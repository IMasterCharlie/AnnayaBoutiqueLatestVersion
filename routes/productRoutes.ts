import express from "express";
import mongoose from "mongoose";
import Product from "../models/Product";
import { isAdmin } from "./adminRoutes";

const router = express.Router();

// Get all products
router.get("/", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database not connected" });
    }
    if (!Product) {
      return res.status(500).json({ message: "Product model not initialized" });
    }
    const { category, sort, search, minPrice, maxPrice } = req.query;
    let query: any = {};

    // Category filter
    if (category && category !== "All") {
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    // Full-text search across name, description, and category
    if (search && String(search).trim() !== "") {
      const searchStr = String(search).trim();
      const searchConditions: any[] = [
        { name: { $regex: searchStr, $options: "i" } },
        { description: { $regex: searchStr, $options: "i" } },
        { category: { $regex: searchStr, $options: "i" } },
      ];
      // If a price number is detected in the search string, also match by price
      const priceMatch = searchStr.match(/\d+/);
      if (priceMatch) {
        const priceVal = Number(priceMatch[0]);
        searchConditions.push({ price: priceVal });
      }

      if (query.$or) {
        // Already have a category query — combine with $and
        query = { $and: [{ category: query.category }, { $or: searchConditions }] };
      } else {
        query.$or = searchConditions;
      }
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
    }

    let sortQuery: any = { createdAt: -1 };
    if (sort === "price-asc") sortQuery = { price: 1 };
    if (sort === "price-desc") sortQuery = { price: -1 };
    if (sort === "rating") sortQuery = { rating: -1 };

    const products = await Product.find(query).sort(sortQuery);
    res.json(products);
  } catch (err: any) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Error fetching products", error: err.message });
  }
});

// Get unique categories with representative images
router.get("/categories", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database not connected" });
    }
    
    // Hardcoded priorities to ensure these always show up if they exist
    const priorityCategories = [
      { name: "Lehenga", static: "/Red Lehenga Image.png" },
      { name: "Saree", static: "/Purple Saree Image.png" },
      { name: "Kurti", static: "/Pink Kurti Image.png" },
      { name: "Suit", static: "/Pista Green Suit Image.png" },
      { name: "Frock", static: "/Peach Frock Image.png" },
      { name: "Co-ord Set", static: "/Red Co-ord Set Image.png" }
    ];
    
    const results = await Promise.all(priorityCategories.map(async (cat) => {
      const product = await Product.findOne({ category: cat.name }).sort({ createdAt: -1 });
      return {
        name: cat.name,
        img: product?.images?.[0] || cat.static
      };
    }));

    // Find any other categories not in the priority list
    const otherCats = await Product.distinct("category", { category: { $nin: priorityCategories } });
    const otherResults = await Promise.all(otherCats.map(async (cat) => {
      const product = await Product.findOne({ category: cat }).sort({ createdAt: -1 });
      return {
        name: cat,
        img: product?.images?.[0] || ""
      };
    }));
    
    res.json([...results, ...otherResults].filter(c => c.name));
  } catch (err: any) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ message: "Error fetching categories", error: err.message });
  }
});

// Get featured products
router.get("/featured", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database not connected" });
    }
    if (!Product) {
      return res.status(500).json({ message: "Product model not initialized" });
    }
    const products = await Product.find({ isFeatured: true }).limit(8);
    res.json(products);
  } catch (err: any) {
    console.error("Error fetching featured products:", err);
    res.status(500).json({ message: "Error fetching featured products", error: err.message });
  }
});

// Get new arrivals
router.get("/new-arrivals", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database not connected" });
    }
    if (!Product) {
      return res.status(500).json({ message: "Product model not initialized" });
    }
    const products = await Product.find({ isNewArrival: true }).limit(8);
    res.json(products);
  } catch (err: any) {
    console.error("Error fetching new arrivals:", err);
    res.status(500).json({ message: "Error fetching new arrivals", error: err.message });
  }
});

// Get product by slug
router.get("/:slug", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database not connected" });
    }
    if (!Product) {
      return res.status(500).json({ message: "Product model not initialized" });
    }
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) {
      console.warn(`Product not found for slug: ${req.params.slug}`);
      return res.status(404).json({ message: `Product not found for slug: ${req.params.slug}` });
    }
    res.json(product);
  } catch (err: any) {
    console.error("Error fetching product:", err);
    res.status(500).json({ message: "Error fetching product", error: err.message });
  }
});

// --- Admin Protected Routes ---

// Create Product
router.post("/", isAdmin, async (req, res) => {
  try {
    const productData = req.body;
    
    // Auto-generate slug if not provided
    if (!productData.slug && productData.name) {
      productData.slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const newProduct = new Product(productData);
    await newProduct.save();
    
    res.status(201).json(newProduct);
  } catch (err: any) {
    console.error("Error creating product:", err);
    res.status(500).json({ message: "Error creating product", error: err.message });
  }
});

// Update Product
router.put("/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updatedProduct);
  } catch (err: any) {
    console.error("Error updating product:", err);
    res.status(500).json({ message: "Error updating product", error: err.message });
  }
});

// Delete Product
router.delete("/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err: any) {
    console.error("Error deleting product:", err);
    res.status(500).json({ message: "Error deleting product", error: err.message });
  }
});

export default router;
