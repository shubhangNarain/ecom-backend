import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: { type: Array, required: true },
  amount: { type: Number, required: true },
  status: { type: String, required: true },
  shippingAddress: { type: Object, required: true },
  paymentId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
