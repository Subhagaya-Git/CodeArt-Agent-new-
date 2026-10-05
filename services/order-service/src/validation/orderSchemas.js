import { z } from "zod";

export const VALID_STATUSES = ["Pending", "Shipped", "Delivered", "Cancelled"];

export const shippingSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(200, "Full name is too long"),
  address: z.string().trim().min(1, "Address is required").max(500, "Address is too long"),
  city: z.string().trim().min(1, "City is required").max(100, "City is too long"),
  postalCode: z.string().trim().min(1, "Postal code is required").max(20, "Postal code is too long"),
  country: z.string().trim().min(1, "Country is required").max(100, "Country is too long"),
});

export const checkoutSchema = z.object({
  shipping: shippingSchema,
});

export const updateStatusSchema = z.object({
  status: z.enum(VALID_STATUSES),
});