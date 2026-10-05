import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().trim().email("Valid email is required").max(254, "Email is too long"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password is too long"),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Valid email is required").max(254, "Email is too long"),
  password: z.string().min(1, "Password is required").max(128, "Password is too long"),
});