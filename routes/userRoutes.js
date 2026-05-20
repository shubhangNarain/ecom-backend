import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import verifyToken from "../middleware/auth/verifyToken.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "30d" },
  );
};

// Signup route
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({ name, email, password, role });
    await newUser.save();

    const token = generateToken(newUser);
    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.log("Signup error:", error);
    res.status(500).json({ message: "Error during signup", error });
  }
});

// login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "User not Signed up, Please Sign Up first" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user);
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error during login", error });
  }
});

// Get user cart
router.get("/cart", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart", error });
  }
});

// Update user cart
router.put("/cart", verifyToken, async (req, res) => {
  try {
    const { cart } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    user.cart = cart;
    await user.save();
    
    res.status(200).json({ message: "Cart updated successfully", cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: "Error updating cart", error });
  }
});

// Get user wishlist
router.get("/wishlist", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ wishlist: user.wishlist || [] });
  } catch (error) {
    res.status(500).json({ message: "Error fetching wishlist", error: error.message });
  }
});

// Update user wishlist
router.put("/wishlist", verifyToken, async (req, res) => {
  try {
    const { wishlist } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.wishlist = wishlist;
    await user.save();
    res.status(200).json({ message: "Wishlist updated successfully", wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: "Error updating wishlist", error: error.message });
  }
});

export default router;
