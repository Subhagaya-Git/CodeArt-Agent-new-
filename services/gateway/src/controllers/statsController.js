import axios from "axios";
import { readSecret } from "../config/secret.js";

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL;
const CART_SERVICE_URL = process.env.CART_SERVICE_URL;
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL;

export async function getDashboardStats(req, res) {
  const authHeader = req.headers.authorization;
  const headers = { "x-internal-key": readSecret("INTERNAL_API_KEY") };
  if (authHeader) headers.Authorization = authHeader;
  const options = { headers, timeout: 5000 };

  const results = await Promise.allSettled([
    axios.get(`${AUTH_SERVICE_URL}/api/auth/stats`, options),
    axios.get(`${PRODUCT_SERVICE_URL}/api/products/stats`, options),
    axios.get(`${CART_SERVICE_URL}/api/cart/stats`, options),
    axios.get(`${ORDER_SERVICE_URL}/api/orders/admin/stats`, options),
  ]);

  const [auth, product, cart, order] = results;

  res.json({
    users: auth.status === "fulfilled" ? auth.value.data : { error: "unavailable" },
    products: product.status === "fulfilled" ? product.value.data : { error: "unavailable" },
    cart: cart.status === "fulfilled" ? cart.value.data : { error: "unavailable" },
    orders: order.status === "fulfilled" ? order.value.data : { error: "unavailable" },
    summary: {
      totalUsers: auth.status === "fulfilled" ? auth.value.data.totalUsers || 0 : null,
      totalProducts: product.status === "fulfilled" ? product.value.data.totalProducts || 0 : null,
      totalOrders: order.status === "fulfilled" ? order.value.data.totalOrders || 0 : null,
      totalRevenue: order.status === "fulfilled" ? order.value.data.totalRevenue || 0 : null,
    },
  });
}
