import express from "express";
import { createProduct, deleteProduct, getProductById, getProducts, updateProduct } from "../controllers/product/product.controller.js";
import isAdmin from "../middlewares/isAdmin.middleware.js";
import verifyToken from "../middlewares/verifyToken.middleware.js";

const router = express.Router();

// GET all products
router.get("/", getProducts);

// GET a single product by ID
router.get("/:id", getProductById);

// CREATE a new product
router.post("/", verifyToken, isAdmin, createProduct);

// UPDATE a product by ID
router.patch("/:id", verifyToken, isAdmin, updateProduct);

// DELETE a product by ID
router.delete("/:id", verifyToken, isAdmin, deleteProduct);

export default router;
