import { Router } from "express";
import { body } from "express-validator";
import {
  checkout,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  stats,
} from "../controllers/orderController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = Router();

const shippingValidation = [
  body("shipping.fullName").trim().notEmpty().withMessage("Full name is required"),
  body("shipping.address").trim().notEmpty().withMessage("Address is required"),
  body("shipping.city").trim().notEmpty().withMessage("City is required"),
  body("shipping.postalCode").trim().notEmpty().withMessage("Postal code is required"),
  body("shipping.country").trim().notEmpty().withMessage("Country is required"),
];

router.post("/checkout", authenticate, shippingValidation, checkout);
router.get("/me", authenticate, getMyOrders);
router.get("/:id", authenticate, getOrderById);

router.get("/", authenticate, requireAdmin, getAllOrders);
router.put(
  "/:id/status",
  authenticate,
  requireAdmin,
  [body("status").notEmpty().withMessage("Status is required")],
  updateOrderStatus
);
router.get("/admin/stats", authenticate, requireAdmin, stats);

export default router;