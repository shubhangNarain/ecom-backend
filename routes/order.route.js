import express from "express";
import {
  createOrder,
  getMyOrders,
  getMyOrderById,
  cancelMyOrder,
  verifyPayment,
  getRazorpayKey,
} from "../controllers/order/order.controller.js";
import verifyToken from "../middlewares/verifyToken.middle.js";
import { createLimiter } from "../config/rateLimit.config.js";
import validate from "../middlewares/validate.middleware.js";
import { verifyPaymentSchema } from "../validators/order.validator.js";

const router = express.Router();

router.post("/", verifyToken, createLimiter, createOrder);
router.get("/razorpay-key", verifyToken, getRazorpayKey);
router.post("/verify", verifyToken, validate(verifyPaymentSchema), verifyPayment);
router.get("/my", verifyToken, getMyOrders);
router.get("/my/:id", verifyToken, getMyOrderById);
router.patch("/my/:id/cancel", verifyToken, cancelMyOrder);

export default router;
