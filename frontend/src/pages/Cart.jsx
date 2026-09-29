import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import toast from "react-hot-toast";
import EmptyState from "../components/EmptyState.jsx";
import Spinner from "../components/Spinner.jsx";
import QuantityStepper from "../components/QuantityStepper.jsx";

const TAX_RATE = 0.08;
const SHIPPING_THRESHOLD = 50;
const SHIPPING_FEE = 5.99;

export default function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  function fetchCart() {
    setLoading(true);
    api
      .get("/cart")
      .then(({ data }) => {
        setItems(data.items || []);
        setTotal(data.total || 0);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }

  useEffect(fetchCart, []);

  async function updateQty(id, quantity) {
    try {
      await api.put(`/cart/${id}`, { quantity });
      fetchCart();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    }
  }

  async function removeItem(id) {
    try {
      await api.delete(`/cart/${id}`);
      toast.success("Item removed from cart");
      fetchCart();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove");
    }
  }

  if (loading) return <Spinner label="Loading cart..." />;

  const tax = total * TAX_RATE;
  const shipping = total >= SHIPPING_THRESHOLD || total === 0 ? 0 : SHIPPING_FEE;
  const grandTotal = total + tax + shipping;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Your Cart</h1>
        <p className="text-sm text-surface-500 mt-0.5">{items.length} item{items.length !== 1 ? "s" : ""} in your cart</p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          description="Looks like you haven't added anything to your cart yet."
          action={<Link to="/products" className="btn-primary">Browse products</Link>}
        />
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {(items || []).map((item) => (
              <div key={item._id} className="card p-4 flex items-center gap-4 hover:shadow-card transition-shadow">
                <div className="w-20 h-20 rounded-xl bg-surface-100 overflow-hidden flex-shrink-0">
                  {(item.image_url || item.image) && (
                    <img
                      src={item.image_url || item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/products/fallback.svg";
                      }}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-surface-900 clamp-1">{item.name}</h3>
                  <p className="text-sm text-surface-500">${item.price.toFixed(2)} each</p>
                </div>
                <QuantityStepper
                  value={item.quantity}
                  min={1}
              max={99}
              onChange={(v) => updateQty(item._id, v)}
              size="sm"
            />
            <div className="w-24 text-right">
              <p className="font-semibold text-surface-900">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
            <button
              onClick={() => removeItem(item._id)}
              className="w-9 h-9 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors"
              aria-label="Remove item"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="lg:col-span-1">
        <div className="card p-6 lg:sticky lg:top-20 space-y-4">
          <h2 className="text-lg font-semibold text-surface-900">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-surface-600">
              <span>Subtotal</span>
              <span className="font-medium text-surface-900">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-surface-600">
              <span>Tax (8%)</span>
              <span className="font-medium text-surface-900">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-surface-600">
              <span>Shipping</span>
              <span className="font-medium text-surface-900">
                {shipping === 0 ? <span className="text-green-600">Free</span> : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-surface-400 pt-1">
                Add ${(SHIPPING_THRESHOLD - total).toFixed(2)} more for free shipping
              </p>
            )}
          </div>
          <div className="border-t border-surface-200 pt-3 flex justify-between font-bold">
            <span className="text-surface-900">Total</span>
            <span className="text-surface-900">${grandTotal.toFixed(2)}</span>
          </div>
          <button onClick={() => navigate("/checkout")} className="btn-primary w-full">
            Proceed to Checkout
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
          <Link to="/products" className="block text-center text-sm text-surface-500 hover:text-surface-700 transition-colors">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  )}
</div>
  );
}
