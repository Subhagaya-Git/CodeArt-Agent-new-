import { validationResult } from "express-validator";
import Product from "../models/Product.js";

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: "Validation failed", errors: errors.array() });
    return true;
  }
  return false;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const PRODUCT_UPDATE_FIELDS = ["name", "description", "price", "stock", "category", "image_url"];

export async function getProducts(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 9, 1), 50);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) {
      const escaped = escapeRegex(req.query.search);
      filter.$or = [
        { name: { $regex: escaped, $options: "i" } },
        { description: { $regex: escaped, $options: "i" } },
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products", error: err.message });
  }
}

export async function getProductById(req, res) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch product", error: err.message });
  }
}

export async function getCategories(_req, res) {
  try {
    const cats = await Product.distinct("category");
    res.json({ categories: cats.sort() });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch categories", error: err.message });
  }
}

export async function createProduct(req, res) {
  if (handleValidation(req, res)) return;
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ message: "Product created", product });
  } catch (err) {
    res.status(500).json({ message: "Failed to create product", error: err.message });
  }
}

export async function updateProduct(req, res) {
  if (handleValidation(req, res)) return;
  try {
    const update = {};
    for (const field of PRODUCT_UPDATE_FIELDS) {
      if (field in req.body) update[field] = req.body[field];
    }
    const product = await Product.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product updated", product });
  } catch (err) {
    res.status(500).json({ message: "Failed to update product", error: err.message });
  }
}

export async function deleteProduct(req, res) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product", error: err.message });
  }
}

export async function addReview(req, res) {
  if (handleValidation(req, res)) return;
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const existing = product.reviews.find((r) => r.user === req.user.id);
    if (existing) return res.status(409).json({ message: "You have already reviewed this product" });

    product.reviews.push({
      user: req.user.id,
      rating: req.body.rating,
      comment: req.body.comment || "",
    });
    await product.save();
    res.status(201).json({ message: "Review added", product });
  } catch (err) {
    res.status(500).json({ message: "Failed to add review", error: err.message });
  }
}

export async function stats(_req, res) {
  try {
    const totalProducts = await Product.countDocuments();
    const lowStock = await Product.countDocuments({ stock: { $lt: 5 } });
    res.json({ totalProducts, lowStock });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats", error: err.message });
  }
}