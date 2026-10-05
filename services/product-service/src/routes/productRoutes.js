import { Router } from "express";
import {
  getProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  reserveStock,
  restoreStock,
  stats,
} from "../controllers/productController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { productSchema, reviewSchema, stockItemsSchema } from "../validation/productSchemas.js";

const router = Router();

router.get("/", getProducts);
router.get("/categories", getCategories);
router.get("/stats", stats);
router.get("/:id", getProductById);

// Internal-only stock endpoints (called by order-service). Not exposed publicly
// by the gateway.
router.post("/reserve-stock", validate(stockItemsSchema), reserveStock);
router.post("/restore-stock", validate(stockItemsSchema), restoreStock);

router.post("/", authenticate, requireAdmin, validate(productSchema), createProduct);
router.put("/:id", authenticate, requireAdmin, validate(productSchema), updateProduct);
router.delete("/:id", authenticate, requireAdmin, deleteProduct);

router.post("/:id/reviews", authenticate, validate(reviewSchema), addReview);

export default router;
