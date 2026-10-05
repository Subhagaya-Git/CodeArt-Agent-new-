import { z } from "zod";

export const addToCartSchema = z.object({
  product_id: z.string().min(1, "product_id is required"),
  quantity: z.coerce.number().int("Quantity must be a positive integer").min(1, "Quantity must be a positive integer"),
});

export const updateQuantitySchema = z.object({
  quantity: z.coerce.number().int("Quantity must be a positive integer").min(1, "Quantity must be a positive integer"),
});