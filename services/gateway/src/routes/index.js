import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { getDashboardStats } from "../controllers/statsController.js";

const router = Router();

const proxyOptions = {
  changeOrigin: true,
  on: {
    error: (err, req, res) => {
      if (!res.headersSent) {
        res.status(502).json({ message: "Service unavailable", error: err.message });
      }
    },
  },
};

router.use("/auth", createProxyMiddleware({ ...proxyOptions, target: process.env.AUTH_SERVICE_URL, pathRewrite: { "^/api/auth": "/api/auth" } }));
router.use("/products", createProxyMiddleware({ ...proxyOptions, target: process.env.PRODUCT_SERVICE_URL, pathRewrite: { "^/api/products": "/api/products" } }));
router.use("/cart", createProxyMiddleware({ ...proxyOptions, target: process.env.CART_SERVICE_URL, pathRewrite: { "^/api/cart": "/api/cart" } }));
router.use("/orders", createProxyMiddleware({ ...proxyOptions, target: process.env.ORDER_SERVICE_URL, pathRewrite: { "^/api/orders": "/api/orders" } }));

router.get("/admin/stats", getDashboardStats);

export default router;