import express from "express";
// Vite is imported dynamically in startServer to avoid issues in production bundles
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config({ path: [".env.local", ".env"] });

import { seedProducts } from "./lib/seed";
import Product from "./models/Product";
import productRoutes from "./routes/productRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import userRoutes from "./routes/userRoutes";
import adminRoutes from "./routes/adminRoutes";
import uploadRoutes from "./routes/uploadRoutes";

const app = express();

// Middleware
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

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/annaya-boutique";
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully");
    
    try {
      await seedProducts();
    } catch (seedErr) {
      console.error("Seeding failed:", seedErr);
    }
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}

export async function startServer() {
  const PORT = parseInt(process.env.PORT || "3000", 10);
  await connectDB();

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
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

  if (process.env.VERCEL !== "1") {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

if (process.env.NODE_ENV !== "production" && process.env.VERCEL !== "1") {
  startServer();
}

export default app;
