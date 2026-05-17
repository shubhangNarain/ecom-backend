import express from "express";
import Product from "../models/productModel.js";
import isAdmin from "../middleware/auth/isAdmin.js";
import verifyToken from "../middleware/auth/verifyToken.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// GET all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
});

// GET a single product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error });
  }
});

// CREATE a new product
router.post("/", verifyToken, isAdmin, upload.single("image"), async (req, res) => {
  try {
    let productData = { ...req.body };
    
    // If an image was uploaded, add the Cloudinary URL
    if (req.file) {
      productData.image = req.file.path;
    }

    // Parse features and specs if they were sent as JSON strings
    if (typeof productData.features === "string") {
      productData.features = JSON.parse(productData.features);
    }
    if (typeof productData.specs === "string") {
      productData.specs = JSON.parse(productData.specs);
    }

    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: "Error creating product", error: error.message });
  }
});

// UPDATE a product by ID
router.put("/:id", verifyToken, isAdmin, upload.single("image"), async (req, res) => {
  try {
    let updateData = { ...req.body };

    // If an image was uploaded, update the Cloudinary URL
    if (req.file) {
      updateData.image = req.file.path;
    }

    // Parse features and specs if they were sent as JSON strings
    if (typeof updateData.features === "string") {
      updateData.features = JSON.parse(updateData.features);
    }
    if (typeof updateData.specs === "string") {
      updateData.specs = JSON.parse(updateData.specs);
    }

    const updatedProduct = await Product.findOneAndUpdate(
      { id: req.params.id },
      updateData,
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: "Error updating product", error: error.message });
  }
});

// DELETE a product by ID
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const deletedProduct = await Product.findOneAndDelete({ id: req.params.id });
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error });
  }
});

export default router;
