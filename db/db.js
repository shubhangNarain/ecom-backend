import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

async function connectDb() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/",
    );
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

export { connectDb };
