import { Router } from "express";
import {
  checkout,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  stats,
} from "../controllers/orderController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { checkoutSchema, updateStatusSchema } from "../validation/orderSchemas.js";

const router = Router();

router.post("/checkout", authenticate, validate(checkoutSchema), checkout);
router.get("/me", authenticate, getMyOrders);
router.get("/:id", authenticate, getOrderById);

router.get("/", authenticate, requireAdmin, getAllOrders);
router.put("/:id/status", authenticate, requireAdmin, validate(updateStatusSchema), updateOrderStatus);
router.get("/admin/stats", authenticate, requireAdmin, stats);

export default router;
