import { validationResult } from "express-validator";
import axios from "axios";
import Order from "../models/Order.js";

const CART_SERVICE_URL = process.env.CART_SERVICE_URL;
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL;

const VALID_STATUSES = ["Pending", "Shipped", "Delivered", "Cancelled"];

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: "Validation failed", errors: errors.array() });
    return true;
  }
  return false;
}

export async function checkout(req, res) {
  if (handleValidation(req, res)) return;
  const authHeader = req.headers.authorization;
  try {
    const { data: cartData } = await axios.get(`${CART_SERVICE_URL}/api/cart`, {
      headers: { Authorization: authHeader },
    });
    if (!cartData.items || cartData.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const stockItems = cartData.items.map((i) => ({
      product_id: i.product_id,
      quantity: i.quantity,
    }));

    try {
      await axios.post(`${PRODUCT_SERVICE_URL}/api/products/reserve-stock`, { items: stockItems });
    } catch (reserveErr) {
      const status = reserveErr.response?.status || 500;
      const message = reserveErr.response?.data?.error || reserveErr.response?.data?.message || "Stock reservation failed";
      return res.status(status).json({ message, sagaStep: "reserve-stock" });
    }

    let order;
    try {
      order = await Order.create({
        user_id: req.user.id,
        items: cartData.items.map((i) => ({
          product_id: i.product_id,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          image_url: i.image_url,
        })),
        total_price: cartData.total,
        status: "Pending",
        shipping: req.body.shipping,
        payment_method: "mock",
      });
    } catch (orderErr) {
      console.error("[saga] Order creation failed, compensating with stock restore:", orderErr.message);
      try {
        await axios.post(`${PRODUCT_SERVICE_URL}/api/products/restore-stock`, { items: stockItems });
      } catch (restoreErr) {
        console.error("[saga] CRITICAL: Stock restore also failed:", restoreErr.message);
      }
      return res.status(500).json({ message: "Order creation failed, stock restored", error: orderErr.message, sagaStep: "create-order" });
    }

    try {
      await axios.delete(`${CART_SERVICE_URL}/api/cart`, {
        headers: { Authorization: authHeader },
      });
    } catch (cartErr) {
      console.warn("[saga] Cart clear failed (non-critical, order is valid):", cartErr.message);
    }

    res.status(201).json({
      message: "Order placed successfully (mock payment confirmed)",
      order,
    });
  } catch (err) {
    res.status(500).json({ message: "Checkout failed", error: err.message });
  }
}

export async function getMyOrders(req, res) {
  try {
    const orders = await Order.find({ user_id: req.user.id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
}

export async function getOrderById(req, res) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch order", error: err.message });
  }
}

export async function getAllOrders(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.status && VALID_STATUSES.includes(req.query.status)) {
      filter.status = req.query.status;
    }
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);
    res.json({
      orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
}

export async function updateOrderStatus(req, res) {
  if (handleValidation(req, res)) return;
  try {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ message: "Failed to update order status", error: err.message });
  }
}

export async function stats(_req, res) {
  try {
    const totalOrders = await Order.countDocuments();
    const byStatus = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      { $group: { _id: null, total: { $sum: "$total_price" } } },
    ]);
    res.json({
      totalOrders,
      byStatus: byStatus.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
      totalRevenue: totalRevenue[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats", error: err.message });
  }
}