import express from "express";
import mongoose from "mongoose";
import User from "../models/User";
import Order from "../models/Order";

const router = express.Router();

// Middleware to log requests (helpful for debugging)
router.use((req, res, next) => {
// Route tracking removed for production
  next();
});

// Sync Auth0 User to DB
router.post("/sync", async (req, res) => {
  try {
    const { auth0Id, name, email, picture } = req.body;
    
    if (!auth0Id) {
      return res.status(400).json({ message: "auth0Id is required" });
    }

    // Bootstrap admin logic: if email matches a predefined list, force role to admin
    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : ["mehraj@gmail.com", "imastercharlie786@gmail.com"];
    
    // Also explicitly force imastercharlie786@gmail.com without checking env just in case the server wasn't restarted
    const role = (adminEmails.includes(email) || email === "imastercharlie786@gmail.com") ? "admin" : "user";

    // Try to find existing user, or create taking advantage of upsert
    const user = await User.findOneAndUpdate(
      { auth0Id },
      { 
        $set: { 
          name, 
          email: email || "no-email@example.com", 
          picture,
          // Only upgrade to admin. Don't downgrade existing admins if we expand the list later.
          // Optional: We can just let $setOnInsert set "user" if we don't want to unconditionally set.
        } 
      },
      { returnDocument: "after", upsert: true }
    );
    
    // Explicitly update role if they are an admin according to the list but don't have the role yet
    if (role === "admin" && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    res.json(user);
  } catch (err: any) {
    console.error("Error syncing user:", err);
    res.status(500).json({ message: "Error syncing user", error: err.message });
  }
});

// Get Current User Profile (including addresses)
router.get("/me", async (req, res) => {
  try {
    const { auth0Id } = req.query;
    if (!auth0Id) return res.status(400).json({ message: "auth0Id is required" });

    const user = await User.findOne({ auth0Id });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err: any) {
    res.status(500).json({ message: "Error fetching user", error: err.message });
  }
});

// Update User Phone Number
router.put("/phone", async (req, res) => {
  try {
    const { auth0Id, phone } = req.body;
    if (!auth0Id || !phone) {
      return res.status(400).json({ message: "auth0Id and phone are required" });
    }

    const user = await User.findOneAndUpdate(
      { auth0Id },
      { $set: { phone } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err: any) {
    console.error("Error saving phone:", err);
    res.status(500).json({ message: "Error saving phone number", error: err.message });
  }
});

// Add or Update Address
router.put("/address", async (req, res) => {
  try {
    const { auth0Id, address } = req.body;
    if (!auth0Id || !address) return res.status(400).json({ message: "auth0Id and address required" });

    const user = await User.findOne({ auth0Id });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (address._id) {
       // Update existing address
       const addressIndex = user.addresses.findIndex((a: any) => a._id.toString() === address._id);
       if (addressIndex > -1) {
         user.addresses[addressIndex] = { ...user.addresses[addressIndex], ...address };
       }
    } else {
       // Add new address
       user.addresses.push(address);
    }

    await user.save();
    res.json(user.addresses);
  } catch (err: any) {
    res.status(500).json({ message: "Error saving address", error: err.message });
  }
});

// Delete Address
router.delete("/address/:addressId", async (req, res) => {
  try {
    const { auth0Id } = req.query;
    const { addressId } = req.params;
    
    if (!auth0Id) return res.status(400).json({ message: "auth0Id is required" });

    const user = await User.findOne({ auth0Id });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.addresses = user.addresses.filter((a: any) => a._id.toString() !== addressId);
    await user.save();
    
    res.json(user.addresses);
  } catch (err: any) {
    res.status(500).json({ message: "Error deleting address", error: err.message });
  }
});

// Get User Orders
router.get("/orders", async (req, res) => {
  try {
    const { auth0Id } = req.query;
    if (!auth0Id) return res.status(400).json({ message: "auth0Id is required" });

    const user = await User.findOne({ auth0Id });
    if (!user) return res.status(404).json({ message: "User not found" });

    const orders = await Order.find({ userId: user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ message: "Error fetching orders", error: err.message });
  }
});

export default router;
