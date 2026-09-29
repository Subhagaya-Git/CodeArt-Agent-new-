import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import EmptyState from "../components/EmptyState.jsx";
import Spinner from "../components/Spinner.jsx";

const statusConfig = {
  Pending: { color: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  Shipped: { color: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  Delivered: { color: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500" },
  Cancelled: { color: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
};

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/orders/me")
      .then(({ data }) => setOrders(data.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading orders..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Order History</h1>
        <p className="text-sm text-slate-500 mt-0.5">{orders.length} order{orders.length !== 1 ? "s" : ""} placed</p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="When you place an order, it will appear here."
          action={<Link to="/products" className="btn-primary">Start shopping</Link>}
        />
      ) : (
        <div className="space-y-4">
          {(orders || []).map((order) => {
            const status = statusConfig[order.status] || statusConfig.Pending;
            return (
              <div key={order._id} className="card p-5 hover:shadow-card transition-shadow">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 00-2 2v5a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900">Order #{order._id.slice(-8).toUpperCase()}</span>
                      <p className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</p>
                    </div>
                  </div>
                  <span className={`badge border ${status.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot} mr-1.5`} />
                    {order.status}
                  </span>
                </div>
                <div className="space-y-2 bg-slate-50/50 rounded-xl p-3">
                  {(order.items || []).map((item) => (
                    <div key={item.product_id} className="flex justify-between text-sm">
                      <span className="text-slate-600">{item.name} × {item.quantity}</span>
                      <span className="font-medium text-slate-700">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-200 mt-3 pt-3 flex justify-between font-bold">
                  <span className="text-slate-900">Total</span>
                  <span className="text-brand-600">${order.total_price.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
