import { Router } from "express";
import { body } from "express-validator";
import {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  stats,
} from "../controllers/cartController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/", getCart);
router.post(
  "/",
  [
    body("product_id").notEmpty().withMessage("product_id is required"),
    body("quantity").isInt({ min: 1 }).withMessage("Quantity must be a positive integer"),
  ],
  addToCart
);
router.put(
  "/:id",
  [body("quantity").isInt({ min: 1 }).withMessage("Quantity must be a positive integer")],
  updateQuantity
);
router.delete("/:id", removeFromCart);
router.delete("/", clearCart);
router.get("/stats", stats);

export default router;