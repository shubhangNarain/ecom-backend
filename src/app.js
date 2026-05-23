import express from "express";
import cors from "cors";
import productRoutes from "../routes/product.route.js";
import orderRoutes from "../routes/order.route.js";
import authRoutes from "../routes/auth.routes.js";
import userRoutes from "../routes/users.route.js";

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// Catch invalid JSON in requests
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res
      .status(400)
      .json({ message: "Invalid JSON payload format", error: err.message });
  }
  next();
});

// routes
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/users", authRoutes); // register, login
app.use("/api/v1/users", userRoutes); // cart, wishlist

export default app;
