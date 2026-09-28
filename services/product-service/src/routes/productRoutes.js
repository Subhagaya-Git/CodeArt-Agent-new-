import { Router } from "express";
import { body } from "express-validator";
import {
  getProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  stats,
} from "../controllers/productController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = Router();

const productValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a non-negative number"),
  body("stock").isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
  body("category").trim().notEmpty().withMessage("Category is required"),
];

router.get("/", getProducts);
router.get("/categories", getCategories);
router.get("/stats", stats);
router.get("/:id", getProductById);

router.post("/", authenticate, requireAdmin, productValidation, createProduct);
router.put("/:id", authenticate, requireAdmin, productValidation, updateProduct);
router.delete("/:id", authenticate, requireAdmin, deleteProduct);

router.post(
  "/:id/reviews",
  authenticate,
  [
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    body("comment").optional().isString(),
  ],
  addReview
);

export default router;