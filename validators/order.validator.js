import { z } from "zod";

const shippingAddressSchema = z.object({
  fullName: z.string({ required_error: "Full name is required" }).min(2).trim(),
  phone: z
    .string({ required_error: "Phone is required" })
    .regex(/^\+?[0-9]{7,15}$/, "Invalid phone number"),
  street: z.string({ required_error: "Street is required" }).min(3).trim(),
  city: z.string({ required_error: "City is required" }).min(2).trim(),
  state: z.string().trim().optional(),
  postalCode: z.string({ required_error: "Postal code is required" }).min(3).trim(),
  country: z.string({ required_error: "Country is required" }).min(2).trim(),
});

const orderItemSchema = z.object({
  product: z.string({ required_error: "Product ID is required" }).regex(/^[a-f\d]{24}$/i, "Invalid product ID"),
  quantity: z
    .number({ required_error: "Quantity is required", invalid_type_error: "Quantity must be a number" })
    .int()
    .min(1, "Quantity must be at least 1"),
});

export const createOrderSchema = z.object({
  items: z
    .array(orderItemSchema, { required_error: "Order items are required" })
    .min(1, "Order must have at least one item"),

  shippingAddress: shippingAddressSchema,

  paymentMethod: z.enum(["razorpay", "cod", "card"], {
    required_error: "Payment method is required",
    invalid_type_error: "Invalid payment method",
  }),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string({ required_error: "Razorpay order ID is required" }),
  razorpay_payment_id: z.string({ required_error: "Razorpay payment ID is required" }),
  razorpay_signature: z.string({ required_error: "Razorpay signature is required" }),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(
    ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"],
    { required_error: "Status is required", invalid_type_error: "Invalid status value" }
  ),
  cancelReason: z.string().trim().optional(),
});
