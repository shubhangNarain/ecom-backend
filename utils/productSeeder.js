import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Product from "../models/product.model.js";

// Setup __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env configuration relative to the script directory
dotenv.config({ path: path.resolve(__dirname, "../env/.env") });

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("No MongoDB URI configured in env/.env");
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    // Read products from local products.json (located in same folder as this script)
    const jsonPath = path.resolve(__dirname, "products.json");
    console.log(`Reading local products from: ${jsonPath}`);
    const productsData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

    try {
      await Product.collection.drop();
      console.log("Dropped products collection to clear old indexes.");
    } catch (e) {
      // Collection might not exist yet, ignore
    }

    const inserted = await Product.insertMany(productsData, { ordered: false });
    console.log(`Seeded ${inserted.length} products successfully!`);

  } catch (err) {
    console.error("Seeder failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seed();
