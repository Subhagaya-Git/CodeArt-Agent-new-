import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios.js";

export default function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function fetchCart() {
    setLoading(true);
    api
      .get("/cart")
      .then(({ data }) => {
        setItems(data.items);
        setTotal(data.total);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }

  useEffect(fetchCart, []);

  async function updateQty(id, quantity) {
    setError("");
    try {
      await api.put(`/cart/${id}`, { quantity });
      fetchCart();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update");
    }
  }

  async function removeItem(id) {
    setError("");
    try {
      await api.delete(`/cart/${id}`);
      fetchCart();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove");
    }
  }

  if (loading) return <div className="text-center text-gray-500 py-12">Loading cart...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
      {items.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          Your cart is empty. <Link to="/products" className="text-brand-600 hover:underline">Browse products</Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item._id} className="card p-4 flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-brand-600 font-bold">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQty(item._id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="btn-outline px-2"
                  >
                    −
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button onClick={() => updateQty(item._id, item.quantity + 1)} className="btn-outline px-2">
                    +
                  </button>
                </div>
                <div className="w-24 text-right font-semibold">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
                <button onClick={() => removeItem(item._id)} className="btn-danger px-3 py-1 text-sm">
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="card p-4 mt-6 flex items-center justify-between">
            <span className="text-xl font-bold">Total: ${total.toFixed(2)}</span>
            <button onClick={() => navigate("/checkout")} className="btn-primary">
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}