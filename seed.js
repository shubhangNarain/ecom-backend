import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import Product from "./models/productModel.js";
import { connectDb } from "./db/db.js";

dotenv.config();

const seedProducts = async () => {
  try {
    await connectDb();

    // Read products.json
    const productsPath = path.join(process.cwd(), "products.json");
    const productsData = JSON.parse(fs.readFileSync(productsPath, "utf-8"));

    // Clear existing products
    await Product.deleteMany({});
    console.log("Existing products cleared.");

    // Insert new products
    await Product.insertMany(productsData);
    console.log(`${productsData.length} products seeded successfully!`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding products:", error);
    process.exit(1);
  }
};

seedProducts();
