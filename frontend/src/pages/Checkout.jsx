import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";
import EmptyState from "../components/EmptyState.jsx";
import Spinner from "../components/Spinner.jsx";

const TAX_RATE = 0.08;
const SHIPPING_THRESHOLD = 50;
const SHIPPING_FEE = 5.99;

const steps = ["Shipping", "Payment", "Review"];

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    fullName: user?.name || "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    api
      .get("/cart")
      .then(({ data }) => setCart({ items: data.items || [], total: data.total || 0 }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  }

  function validateShipping() {
    const e = {};
    if (!form.fullName) e.fullName = "Required";
    if (!form.address) e.address = "Required";
    if (!form.city) e.city = "Required";
    if (!form.postalCode) e.postalCode = "Required";
    if (!form.country) e.country = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleCheckout(e) {
    e.preventDefault();
    setPlacing(true);
    try {
      await api.post("/orders/checkout", { shipping: form });
      toast.success("Order placed successfully!");
      navigate("/orders");
    } catch (err) {
      toast.error(err.response?.data?.message || "Checkout failed");
    } finally {
      setPlacing(false);
    }
  }

  if (loading) return <Spinner label="Loading checkout..." />;

  if (cart.items.length === 0) {
    return (
      <EmptyState
        title="Nothing to checkout"
        description="Your cart is empty. Add some products first."
        action={<button onClick={() => navigate("/products")} className="btn-primary">Browse products</button>}
      />
    );
  }

  const tax = cart.total * TAX_RATE;
  const shipping = cart.total >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const grandTotal = cart.total + tax + shipping;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Checkout</h1>
        <p className="text-sm text-surface-500 mt-0.5">Complete your order</p>
      </div>

      <div className="flex items-center gap-2 mb-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              i === step ? "bg-brand-600 text-white" : i < step ? "bg-brand-50 text-brand-700" : "bg-surface-100 text-surface-400"
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                i === step ? "bg-white/20" : i < step ? "bg-brand-600 text-white" : "bg-surface-200"
              }`}>
                {i < step ? "✓" : i + 1}
              </span>
              {s}
            </div>
            {i < steps.length - 1 && <div className="w-4 h-px bg-surface-200" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <form onSubmit={handleCheckout} className="lg:col-span-3 card p-6 space-y-5">
          {step === 0 && (
            <>
              <h2 className="text-lg font-semibold text-surface-900">Shipping Address</h2>
              <div>
                <label className="label">Full Name</label>
                <input name="fullName" value={form.fullName} onChange={handleChange} className={`input ${errors.fullName ? "input-error" : ""}`} required />
              </div>
              <div>
                <label className="label">Address</label>
                <input name="address" value={form.address} onChange={handleChange} className={`input ${errors.address ? "input-error" : ""}`} placeholder="123 Main St" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">City</label>
                  <input name="city" value={form.city} onChange={handleChange} className={`input ${errors.city ? "input-error" : ""}`} required />
                </div>
                <div>
                  <label className="label">Postal Code</label>
                  <input name="postalCode" value={form.postalCode} onChange={handleChange} className={`input ${errors.postalCode ? "input-error" : ""}`} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Country</label>
                  <input name="country" value={form.country} onChange={handleChange} className={`input ${errors.country ? "input-error" : ""}`} required />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange} className="input" />
                </div>
              </div>
              <button type="button" onClick={() => { if (validateShipping()) setStep(1); }} className="btn-primary w-full">
                Continue to Payment
              </button>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="text-lg font-semibold text-surface-900">Payment Method</h2>
              <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 text-sm text-brand-700 flex items-start gap-2.5">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span><strong>Mock payment</strong> — no real charge. Clicking "Place Order" confirms the order.</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl border border-surface-200 bg-surface-50">
                  <div className="w-10 h-10 rounded-lg bg-surface-200 flex items-center justify-center">
                    <svg className="w-5 h-5 text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-surface-900">Credit / Debit Card</p>
                    <p className="text-xs text-surface-400">Mock — no real payment processed</p>
                  </div>
                  <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(0)} className="btn-outline flex-1">Back</button>
                <button type="button" onClick={() => setStep(2)} className="btn-primary flex-1">Review Order</button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-lg font-semibold text-surface-900">Review Your Order</h2>
              <div className="space-y-3">
                <div className="bg-surface-50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-surface-700 mb-2">Shipping to</h3>
                  <p className="text-sm text-surface-600">{form.fullName}</p>
                  <p className="text-sm text-surface-600">{form.address}, {form.city} {form.postalCode}</p>
                  <p className="text-sm text-surface-600">{form.country}{form.phone ? ` · ${form.phone}` : ""}</p>
                </div>
                <div className="bg-surface-50 rounded-xl p-4 space-y-2">
                  <h3 className="text-sm font-semibold text-surface-700 mb-2">Items</h3>
                  {(cart.items || []).map((item) => (
                    <div key={item._id} className="flex justify-between text-sm">
                      <span className="text-surface-600 clamp-1 pr-2">{item.name} × {item.quantity}</span>
                      <span className="font-medium text-surface-900 flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-outline flex-1">Back</button>
                <button type="submit" disabled={placing} className="btn-primary flex-1">
                  {placing ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Placing order...
                    </>
                  ) : (
                    `Place Order — $${grandTotal.toFixed(2)}`
                  )}
                </button>
              </div>
            </>
          )}
        </form>

        <div className="lg:col-span-2 card p-6 h-fit lg:sticky lg:top-20">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">Order Summary</h2>
          <div className="space-y-3">
            {(cart.items || []).map((item) => (
              <div key={item._id} className="flex justify-between text-sm">
                <span className="text-surface-600 clamp-1 pr-2">{item.name} × {item.quantity}</span>
                <span className="font-medium text-surface-900 flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-surface-200 mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-surface-500">
              <span>Subtotal</span>
              <span>${cart.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-surface-500">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-surface-500">
              <span>Shipping</span>
              <span>{shipping === 0 ? <span className="text-green-600">Free</span> : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-bold text-surface-900 pt-2">
              <span>Total</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
