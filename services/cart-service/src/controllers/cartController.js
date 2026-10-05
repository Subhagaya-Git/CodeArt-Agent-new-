import axios from "axios";
import CartItem from "../models/Cart.js";
import { readSecret } from "../config/secret.js";

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL;

function internalHeaders() {
  return { "x-internal-key": readSecret("INTERNAL_API_KEY") };
}

async function fetchProduct(productId) {
  const { data } = await axios.get(`${PRODUCT_SERVICE_URL}/api/products/${productId}`, {
    headers: internalHeaders(),
    timeout: 5000,
  });
  return data.product;
}

export async function getCart(req, res) {
  try {
    const items = await CartItem.find({ user_id: req.user.id }).sort({ createdAt: -1 });
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    res.json({ items, total: Math.round(total * 100) / 100, count: items.length });
  } catch {
    res.status(500).json({ code: "SERVER_ERROR", message: "Failed to fetch cart" });
  }
}

export async function addToCart(req, res) {
  const { product_id, quantity } = req.body;
  try {
    const product = await fetchProduct(product_id);
    if (product.stock < quantity) {
      return res.status(400).json({ code: "INSUFFICIENT_STOCK", message: `Insufficient stock. Available: ${product.stock}` });
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
      return res.status(404).json({ code: "PRODUCT_NOT_FOUND", message: "Product not found" });
    }
    res.status(500).json({ code: "SERVER_ERROR", message: "Failed to add to cart" });
  }
}

export async function updateQuantity(req, res) {
  const { quantity } = req.body;
  try {
    const item = await CartItem.findOne({ _id: req.params.id, user_id: req.user.id });
    if (!item) return res.status(404).json({ code: "NOT_FOUND", message: "Cart item not found" });

    const product = await fetchProduct(item.product_id);
    if (product.stock < quantity) {
      return res.status(400).json({ code: "INSUFFICIENT_STOCK", message: `Insufficient stock. Available: ${product.stock}` });
    }

    item.quantity = quantity;
    item.price = product.price;
    await item.save();
    res.json({ message: "Quantity updated", item });
  } catch {
    res.status(500).json({ code: "SERVER_ERROR", message: "Failed to update quantity" });
  }
}

export async function removeFromCart(req, res) {
  try {
    const item = await CartItem.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });
    if (!item) return res.status(404).json({ code: "NOT_FOUND", message: "Cart item not found" });
    res.json({ message: "Item removed" });
  } catch {
    res.status(500).json({ code: "SERVER_ERROR", message: "Failed to remove item" });
  }
}

export async function clearCart(req, res) {
  try {
    await CartItem.deleteMany({ user_id: req.user.id });
    res.json({ message: "Cart cleared" });
  } catch {
    res.status(500).json({ code: "SERVER_ERROR", message: "Failed to clear cart" });
  }
}

export async function stats(_req, res) {
  try {
    const totalItems = await CartItem.countDocuments();
    const totalCarts = await CartItem.distinct("user_id");
    res.json({ totalCartItems: totalItems, totalCarts: totalCarts.length });
  } catch {
    res.status(500).json({ code: "SERVER_ERROR", message: "Failed to fetch stats" });
  }
}
