/**
 * @file order.controller.js
 * @description All order controllers — user orders and admin order management.
 *
 * User (verifyToken):
 *  - createOrder, getMyOrders, getMyOrderById, cancelMyOrder
 *
 * Admin (verifyToken + isAdmin):
 *  - getAllOrders, getOrderById, updateOrderStatus, deleteOrder
 */

import Order from "../../models/order.model.js";
import Product from "../../models/product.model.js";
import asyncHandler from "../../utils/asyncHandler.utils.js";
import ApiError from "../../utils/errorHandler.utils.js";
import { getPaginationParams, paginate } from "../../utils/pagination.utils.js";

const VALID_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];

// ─── USER ─────────────────────────────────────────────────────────────────────

export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, payment, shippingCharge = 0, discount = 0 } = req.body;

  if (!items?.length)   throw new ApiError(400, "Order must have at least one item");
  if (!shippingAddress) throw new ApiError(400, "Shipping address is required");
  if (!payment?.method) throw new ApiError(400, "Payment method is required");

  // Support both real MongoDB ObjectIds and dummyId (numeric string from static JSON)
  const isObjectId = (id) => /^[a-f\d]{24}$/i.test(id);

  const products = await Promise.all(
    items.map((i) =>
      isObjectId(i.product)
        ? Product.findById(i.product).lean()
        : Product.findOne({ id: Number(i.product) }).lean()
    )
  );

  const missing = products.findIndex((p) => !p);
  if (missing !== -1) throw new ApiError(400, `Product "${items[missing].product}" not found`);

  const orderItems = items.map((item, idx) => {
    const product = products[idx];
    if ((product.qty ?? 0) < item.quantity) {
      throw new ApiError(400, `Insufficient stock for "${product.name}"`);
    }
    const unitPrice = parseFloat(String(product.price).replace(/,/g, ""));
    return {
      product:   product._id,
      title:     product.name,
      thumbnail: product.image,
      price:     unitPrice,
      quantity:  item.quantity,
      subtotal:  unitPrice * item.quantity,
    };
  });

  const itemsTotal = orderItems.reduce((sum, i) => sum + i.subtotal, 0);
  const grandTotal = itemsTotal + shippingCharge - discount;

  const order = await Order.create({
    user: req.user.id, items: orderItems, shippingAddress, payment,
    itemsTotal, shippingCharge, discount, grandTotal,
  });

  await Promise.all(
    orderItems.map((item) =>
      Product.findByIdAndUpdate(item.product, { $inc: { qty: -item.quantity } })
    )
  );

  res.status(201).json(order);
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req, { limit: 10 });
  const filter = { user: req.user.id };
  if (req.query.status) filter.status = req.query.status;

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);
  res.status(200).json(paginate(orders, total, page, limit, "orders"));
});

export const getMyOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user.id })
    .populate("items.product", "name image price").lean();
  if (!order) throw new ApiError(404, "Order not found");
  res.status(200).json(order);
});

export const cancelMyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
  if (!order) throw new ApiError(404, "Order not found");

  if (!["pending", "confirmed"].includes(order.status)) {
    throw new ApiError(400, `Cannot cancel an order with status "${order.status}"`);
  }

  const cancelPayload = {
    status: "cancelled",
    cancelledAt: new Date(),
    cancelReason: req.body.reason || "Cancelled by user"
  };

  const updatedOrder = await Order.findByIdAndUpdate(
    order._id,
    { $set: cancelPayload },
    { new: true, runValidators: true }
  );

  await Promise.all(
    updatedOrder.items.map(async (item) => {
      const productId = item.product || item._id;
      if (productId) {
        if (/^[a-f\d]{24}$/i.test(String(productId))) {
          await Product.findByIdAndUpdate(productId, { $inc: { qty: item.quantity } });
        } else {
          await Product.findOneAndUpdate({ id: Number(productId) }, { $inc: { qty: item.quantity } });
        }
      }
    })
  );
  res.status(200).json({ message: "Order cancelled", order: updatedOrder });
});

// ─── ADMIN ────────────────────────────────────────────────────────────────────

export const getAllOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.userId) filter.user   = req.query.userId;

  const [orders, total] = await Promise.all([
    Order.find(filter).populate("user", "name email").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);
  res.status(200).json(paginate(orders, total, page, limit, "orders"));
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("items.product", "name image price").lean();
  if (!order) throw new ApiError(404, "Order not found");
  res.status(200).json(order);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    throw new ApiError(400, `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`);
  }

  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  const updatePayload = { status };
  if (status === "delivered") updatePayload.deliveredAt = new Date();
  if (status === "cancelled") {
    updatePayload.cancelledAt  = new Date();
    updatePayload.cancelReason = req.body.reason || "Cancelled by admin";
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    req.params.id,
    { $set: updatePayload },
    { new: true, runValidators: true }
  );

  res.status(200).json({ message: "Order status updated", order: updatedOrder });
});

export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");
  res.status(200).json({ message: "Order deleted successfully" });
});
