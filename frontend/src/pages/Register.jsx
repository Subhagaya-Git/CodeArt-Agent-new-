import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";
import PasswordStrength from "../components/PasswordStrength.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.name) e.name = "Name is required";
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email format";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Password must be at least 6 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success("Account created successfully!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-slate-800 via-slate-900 to-brand-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 75% 25%, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="relative">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold">ShopHub</span>
          </div>
        </div>
        <div className="relative">
          <h2 className="text-4xl font-bold mb-4 leading-tight">Join the next generation of e-commerce.</h2>
          <p className="text-slate-300 text-lg max-w-md">Create your account and start exploring products built on a scalable microservices architecture.</p>
        </div>
        <div className="relative space-y-3">
          {["Secure authentication", "Real-time inventory", "Seamless checkout"].map((feat) => (
            <div key={feat} className="flex items-center gap-2.5 text-sm text-slate-300">
              <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {feat}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12 bg-slate-50">
        <div className="w-full max-w-md animate-slide-up">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
            <p className="text-sm text-slate-500 mt-1.5">Get started in less than a minute</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Full name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: undefined }); }}
                placeholder="John Doe"
                className={`input ${errors.name ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" : ""}`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1.5">{errors.name}</p>}
            </div>

            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: undefined }); }}
                placeholder="you@example.com"
                className={`input ${errors.email ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" : ""}`}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1.5">{errors.email}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={(e) => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: undefined }); }}
                  placeholder="••••••••"
                  className={`input pr-11 ${errors.password ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPwd ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C5.22 18.667 8.27 20 12 20c1.73 0 3.27-.4 4.66-1.06M6.02 6.02a10.45 10.45 0 015.98-2.02c3.73 0 6.78 1.333 10.066 8A10.45 10.45 0 0117.98 17.98M6.02 6.02L3 3m3.02 3.02l11.96 11.96" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C4.423 4.333 7.66 3 12 3c4.34 0 7.577 1.333 9.964 8.683a1.012 1.012 0 010 .639C19.577 19.667 16.34 21 12 21c-4.34 0-7.577-1.333-9.964-8.678M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1.5">{errors.password}</p>}
              <PasswordStrength password={form.password} />
            </div>

            <div>
              <label className="label">Confirm password</label>
              <input
                type={showPwd ? "text" : "password"}
                name="confirm"
                value={form.confirm}
                onChange={(e) => { setForm({ ...form, confirm: e.target.value }); setErrors({ ...errors, confirm: undefined }); }}
                placeholder="••••••••"
                className={`input ${errors.confirm ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" : ""}`}
              />
              {errors.confirm && <p className="text-xs text-red-500 mt-1.5">{errors.confirm}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
