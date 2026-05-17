import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: String, required: true },
  oldPrice: { type: String },
  tag: { type: String },
  image: { type: String, required: true },
  description: { type: String, required: true },
  features: { type: [String], default: [] },
  specs: { type: Map, of: String },
  qty: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Product = mongoose.model("Product", productSchema);
export default Product;
