import { Router } from "express";
import {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  stats,
} from "../controllers/cartController.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { addToCartSchema, updateQuantitySchema } from "../validation/cartSchemas.js";

const router = Router();

router.use(authenticate);

router.get("/", getCart);
router.post("/", validate(addToCartSchema), addToCart);
router.put("/:id", validate(updateQuantitySchema), updateQuantity);
router.delete("/:id", removeFromCart);
router.delete("/", clearCart);
router.get("/stats", stats);

export default router;
