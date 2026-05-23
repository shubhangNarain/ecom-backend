import { z } from "zod";

export const createProductSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .min(2, "Title must be at least 2 characters")
    .trim(),

  description: z.string().trim().optional(),

  category: z.string().trim().optional(),

  price: z
    .number({ required_error: "Price is required", invalid_type_error: "Price must be a number" })
    .positive("Price must be greater than 0"),

  discountPercentage: z.number().min(0).max(100).optional().default(0),

  stock: z.number().int().min(0, "Stock cannot be negative").optional().default(0),

  brand: z.string().trim().optional(),

  tags: z.array(z.string()).optional().default([]),

  thumbnail: z.string().url("Invalid thumbnail URL").optional(),

  images: z.array(z.string().url("Invalid image URL")).optional().default([]),

  minimumOrderQuantity: z.number().int().min(1).optional().default(1),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 1))
    .pipe(z.number().int().min(1)),

  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 10))
    .pipe(z.number().int().min(1).max(100)),

  category: z.string().optional(),

  search: z.string().optional(),

  minPrice: z
    .string()
    .optional()
    .transform((v) => (v ? parseFloat(v) : undefined))
    .pipe(z.number().min(0).optional()),

  maxPrice: z
    .string()
    .optional()
    .transform((v) => (v ? parseFloat(v) : undefined))
    .pipe(z.number().min(0).optional()),
});
