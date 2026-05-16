import express from "express";
import { connectDb } from "./db/db.js";
import productRoutes from "./routes/productRoutes.js";

const app = express();

//middleware
app.use(express.json());

//routes
app.use("/api/v1/products", productRoutes);

// database connection

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  connectDb();
  console.log(`Server is running on port ${PORT}`);
});
