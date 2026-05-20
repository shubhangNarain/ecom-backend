import express from "express";
import verifyToken from "../middleware/auth/verifyToken.js";
import Order from "../models/orderModel.js";

const router = express.Router();

// Create new order
router.post("/", verifyToken, async (req, res) => {
  try {
    const { items, amount, shippingAddress, paymentId } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order items cannot be empty" });
    }
    if (!amount || !shippingAddress || !paymentId) {
      return res.status(400).json({ message: "Missing required order details" });
    }

    const newOrder = new Order({
      userId: req.user.id,
      items,
      amount,
      status: "Processing",
      shippingAddress,
      paymentId
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: "Error creating order", error: error.message });
  }
});

// Get user orders
router.get("/", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
});

export default router;
