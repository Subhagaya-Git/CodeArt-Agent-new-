import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200, "Name is too long"),
  description: z.string().max(5000, "Description is too long").optional().default(""),
  price: z.coerce.number().min(0, "Price must be a non-negative number"),
  stock: z.coerce.number().int("Stock must be a non-negative integer").min(0, "Stock must be a non-negative integer"),
  category: z.string().trim().min(1, "Category is required").max(100, "Category is too long"),
  image_url: z.string().max(500, "Image URL is too long").optional().default(""),
});

export const reviewSchema = z.object({
  rating: z.coerce.number().int("Rating must be an integer").min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5"),
  comment: z.string().max(2000, "Comment is too long").optional().default(""),
});

export const stockItemsSchema = z.object({
  items: z
    .array(
      z.object({
        product_id: z.string().min(1, "product_id is required"),
        quantity: z.coerce.number().int("quantity must be an integer").min(1, "quantity must be >= 1"),
      })
    )
    .min(1, "items must not be empty"),
});