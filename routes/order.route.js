import express from "express";
import verifyToken from "../middlewares/verifyToken.middleware.js";
import { createOrder, getOrders } from "../controllers/order/order.controller.js";

const router = express.Router();

// Create new order
router.post("/", verifyToken, createOrder);

// Get user orders
router.get("/", verifyToken, getOrders);

export default router;
