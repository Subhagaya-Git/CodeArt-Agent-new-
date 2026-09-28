import { validationResult } from "express-validator";
import axios from "axios";
import CartItem from "../models/Cart.js";

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL;

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: "Validation failed", errors: errors.array() });
    return true;
  }
  return false;
}

async function fetchProduct(productId) {
  const { data } = await axios.get(`${PRODUCT_SERVICE_URL}/api/products/${productId}`);
  return data.product;
}

export async function getCart(req, res) {
  try {
    const items = await CartItem.find({ user_id: req.user.id }).sort({ createdAt: -1 });
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    res.json({ items, total: Math.round(total * 100) / 100, count: items.length });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch cart", error: err.message });
  }
}

export async function addToCart(req, res) {
  if (handleValidation(req, res)) return;
  const { product_id, quantity } = req.body;
  try {
    const product = await fetchProduct(product_id);
    if (product.stock < quantity) {
      return res.status(400).json({ message: `Insufficient stock. Available: ${product.stock}` });
    }

    const existing = await CartItem.findOne({ user_id: req.user.id, product_id });
    if (existing) {
      existing.quantity += quantity;
      existing.price = product.price;
      existing.name = product.name;
      existing.image_url = product.image_url;
      await existing.save();
      return res.json({ message: "Cart updated", item: existing });
    }

    const item = await CartItem.create({
      user_id: req.user.id,
      product_id,
      quantity,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
    });
    res.status(201).json({ message: "Added to cart", item });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(500).json({ message: "Failed to add to cart", error: err.message });
  }
}

export async function updateQuantity(req, res) {
  if (handleValidation(req, res)) return;
  const { quantity } = req.body;
  try {
    const item = await CartItem.findOne({ _id: req.params.id, user_id: req.user.id });
    if (!item) return res.status(404).json({ message: "Cart item not found" });

    const product = await fetchProduct(item.product_id);
    if (product.stock < quantity) {
      return res.status(400).json({ message: `Insufficient stock. Available: ${product.stock}` });
    }

    item.quantity = quantity;
    item.price = product.price;
    await item.save();
    res.json({ message: "Quantity updated", item });
  } catch (err) {
    res.status(500).json({ message: "Failed to update quantity", error: err.message });
  }
}

export async function removeFromCart(req, res) {
  try {
    const item = await CartItem.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });
    if (!item) return res.status(404).json({ message: "Cart item not found" });
    res.json({ message: "Item removed" });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove item", error: err.message });
  }
}

export async function clearCart(req, res) {
  try {
    await CartItem.deleteMany({ user_id: req.user.id });
    res.json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ message: "Failed to clear cart", error: err.message });
  }
}

export async function stats(_req, res) {
  try {
    const totalItems = await CartItem.countDocuments();
    const totalCarts = await CartItem.distinct("user_id");
    res.json({ totalCartItems: totalItems, totalCarts: totalCarts.length });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats", error: err.message });
  }
}