import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";

const statusColors = {
  Pending: "bg-amber-100 text-amber-700",
  Shipped: "bg-blue-100 text-blue-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/orders/me")
      .then(({ data }) => setOrders(data.orders))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center text-gray-500 py-12">Loading orders...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Order History</h1>
      {orders.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          No orders yet. <Link to="/products" className="text-brand-600 hover:underline">Start shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <span className="font-semibold">Order #{order._id.slice(-8).toUpperCase()}</span>
                  <span className="text-sm text-gray-500 ml-3">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${statusColors[order.status]}`}>
                  {order.status}
                </span>
              </div>
              <div className="space-y-1">
                {order.items.map((item) => (
                  <div key={item.product_id} className="flex justify-between text-sm text-gray-700">
                    <span>{item.name} × {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t mt-3 pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-brand-600">${order.total_price.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}