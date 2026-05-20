import express from "express";
import { createProduct, deleteProduct, getProductById, getProducts, updateProduct } from "../controllers/productsController.js";
import isAdmin from "../middleware/auth/isAdmin.js";
import verifyToken from "../middleware/auth/verifyToken.js";

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
