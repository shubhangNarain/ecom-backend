import express from "express";
import verifyToken from "../middlewares/verifyToken.middleware.js";
import { getCart, updateCart, getWishlist, updateWishlist } from "../controllers/user/user.controller.js";

const router = express.Router();

// Cart routes
router.get("/cart", verifyToken, getCart);
router.put("/cart", verifyToken, updateCart);

// Wishlist routes
router.get("/wishlist", verifyToken, getWishlist);
router.put("/wishlist", verifyToken, updateWishlist);

export default router;
