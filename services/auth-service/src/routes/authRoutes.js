import { Router } from "express";
import { body } from "express-validator";
import { register, login, getProfile, verifyTokenEndpoint, listUsers, stats } from "../controllers/authController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  login
);

router.get("/profile", authenticate, getProfile);
router.get("/verify-token", verifyTokenEndpoint);
router.get("/users", authenticate, requireAdmin, listUsers);
router.get("/stats", stats);

export default router;