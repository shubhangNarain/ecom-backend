import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const userSchema = new mongoose.Schema({
  id: uuidv4(),
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  wishlist: { type: Array, default: [] },
  cart: { type: Array, default: [] },
});

const User = mongoose.model("User", userSchema);
export default User;
