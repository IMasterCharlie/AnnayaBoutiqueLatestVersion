import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import User from "../models/User";
import Order from "../models/Order";
import Product from "../models/Product";

const router = express.Router();

// Middleware to verify the user is an admin
export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth0Id = req.headers['x-auth0-id'] || req.query.auth0Id || req.body.auth0Id;
    
    if (!auth0Id) {
      return res.status(401).json({ message: "Unauthorized - No Auth0 ID provided" });
    }

    const user = await User.findOne({ auth0Id });
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden - Admin access required" });
    }

    // Pass the user document to the next handler if needed
    (req as any).adminUser = user;
    next();
  } catch (error: any) {
    console.error("Admin Authorization Error:", error);
    res.status(500).json({ message: "Authorization verification failed" });
  }
};

router.use(isAdmin); // Apply this to all routes below

// --- Dashboard Stats ---
router.get("/stats", async (req, res) => {
  try {
    const [userCount, productCount, orderCount] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments()
    ]);

    // Calculate total revenue from all orders
    const orders = await Order.find({}, 'totalAmount');
    const revenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    res.json({
      totalUsers: userCount,
      totalOrders: orderCount,
      productsCount: productCount,
      revenue
    });
  } catch (err: any) {
    console.error("Error fetching admin stats:", err);
    res.status(500).json({ message: "Error fetching admin stats", error: err.message });
  }
});

// --- Users Management ---
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, '-addresses -wishlist').sort({ createdAt: -1 });
    res.json(users);
  } catch (err: any) {
    console.error("Error fetching admin users:", err);
    res.status(500).json({ message: "Error fetching admin users", error: err.message });
  }
});

// --- Orders Management ---
router.get("/orders", async (req, res) => {
  try {
    // Populate user if needed, or just return the orders
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err: any) {
    console.error("Error fetching admin orders:", err);
    res.status(500).json({ message: "Error fetching admin orders", error: err.message });
  }
});

router.put("/orders/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const validStatuses = ["Processing", "Shipped", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (err: any) {
    console.error("Error updating order status:", err);
    res.status(500).json({ message: "Error updating order status", error: err.message });
  }
});

// --- Get orders for a specific customer (by MongoDB _id) ---
router.get("/users/:id/orders", async (req, res) => {
  try {
    const { id } = req.params;

    // Cast to ObjectId so Mongoose can match the userId field correctly
    let userObjectId;
    try {
      userObjectId = new mongoose.Types.ObjectId(id);
    } catch {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const orders = await Order.find({ userId: userObjectId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err: any) {
    console.error("Error fetching user orders:", err);
    res.status(500).json({ message: "Error fetching user orders", error: err.message });
  }
});

export default router;
