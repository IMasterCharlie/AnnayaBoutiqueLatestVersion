import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/Order";
import User from "../models/User";

const router = express.Router();

// Create Order
router.post("/create-order", async (req, res) => {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "secret_placeholder",
    });

    const { amount, currency = "INR" } = req.body;

    const options = {
      amount: amount * 100, // amount in the smallest currency unit
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error("Razorpay order creation error:", err);
    res.status(500).json({ message: "Error creating Razorpay order" });
  }
});

// Verify Payment
router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails,
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "secret_placeholder")
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      let finalUserId = undefined;
      let finalShippingAddress = undefined;

      // Map auth0Id to our DB ObjectId and extract specific address
      if (orderDetails.userId) {
        const user = await User.findOne({ auth0Id: orderDetails.userId });
        if (user) {
          finalUserId = user._id;
          
          if (orderDetails.selectedAddressId && user.addresses) {
            finalShippingAddress = user.addresses.find(
              (a: any) => a._id.toString() === orderDetails.selectedAddressId
            );
          }
          
          // Fallback to first address if selected ID wasn't found or provided
          if (!finalShippingAddress && user.addresses.length > 0) {
            finalShippingAddress = user.addresses[0];
          }
        }
      }

      // Payment verified, save order to DB
      const newOrder = new Order({
        ...orderDetails,
        userId: finalUserId,
        shippingAddress: finalShippingAddress,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        status: "Processing",
      });
      await newOrder.save();
      return res.json({ message: "Payment verified successfully", orderId: newOrder._id });
    } else {
      return res.status(400).json({ message: "Invalid signature" });
    }
  } catch (err) {
    console.error("Razorpay verification error:", err);
    res.status(500).json({ message: "Error verifying payment" });
  }
});

export default router;
