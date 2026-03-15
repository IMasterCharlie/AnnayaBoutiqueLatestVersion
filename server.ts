import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config({ path: [".env.local", ".env"] });

import { seedProducts } from "./lib/seed";
// @ts-ignore - Check if seed exists
let seedFn: any = seedProducts;
import Product from "./models/Product";
import productRoutes from "./routes/productRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import userRoutes from "./routes/userRoutes";
import adminRoutes from "./routes/adminRoutes";
import uploadRoutes from "./routes/uploadRoutes";

const app = express();

export async function startServer() {
  const PORT = process.env.PORT || 3000;

  // Connect to MongoDB
  const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/annaya-boutique";
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully");
    
    // Only seed if in development or explicitly requested
    if (process.env.NODE_ENV !== "production") {
      try {
        if (typeof seedFn === 'function') {
          await seedFn();
        }
      } catch (seedErr) {
        console.warn("Seeding skipped or failed (likely missing seed file)");
      }
    }
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(cookieParser());

  // API Routes
  app.use("/api/products", productRoutes);
  app.use("/api/payment", paymentRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/upload", uploadRoutes);

  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      db: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
    });
  });

  app.get("/api/debug/slugs", async (req, res) => {
    try {
      const products = await Product.find({});
      res.json(products);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/debug/reset-products", async (req, res) => {
    try {
      await Product.deleteMany({});
      await seedProducts();
      res.json({ message: "Products reset and re-seeded successfully" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // TODO: Add Product, User, Order, Review routes here

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (process.env.NODE_ENV !== "production" && process.env.VERCEL !== "1") {
  startServer();
}

export default app;
