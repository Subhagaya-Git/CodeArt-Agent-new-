import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: user?.name || "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  useEffect(() => {
    api
      .get("/cart")
      .then(({ data }) => setCart(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleCheckout(e) {
    e.preventDefault();
    setError("");
    setPlacing(true);
    try {
      await api.post("/orders/checkout", { shipping: form });
      navigate("/orders");
    } catch (err) {
      setError(err.response?.data?.message || "Checkout failed");
    } finally {
      setPlacing(false);
    }
  }

  if (loading) return <div className="text-center text-gray-500 py-12">Loading...</div>;

  if (cart.items.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        Your cart is empty. Nothing to checkout.
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={handleCheckout} className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Shipping Address</h2>
          <div>
            <label className="label">Full Name</label>
            <input name="fullName" value={form.fullName} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label className="label">Address</label>
            <input name="address" value={form.address} onChange={handleChange} className="input" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">City</label>
              <input name="city" value={form.city} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="label">Postal Code</label>
              <input name="postalCode" value={form.postalCode} onChange={handleChange} className="input" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Country</label>
              <input name="country" value={form.country} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="label">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} className="input" />
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            Payment: <strong>Mock payment</strong> — no real charge. Clicking "Place Order" confirms the order.
          </div>

          <button type="submit" disabled={placing} className="btn-primary w-full">
            {placing ? "Placing order..." : "Place Order"}
          </button>
        </form>

        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="space-y-3">
            {cart.items.map((item) => (
              <div key={item._id} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-brand-600">${cart.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}