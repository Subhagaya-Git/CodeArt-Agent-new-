import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>
      {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="label">Name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} className="input" required />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} className="input" required />
        </div>
        <div>
          <label className="label">Password</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} className="input" required />
        </div>
        <div>
          <label className="label">Confirm Password</label>
          <input type="password" name="confirm" value={form.confirm} onChange={handleChange} className="input" required />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Creating..." : "Sign Up"}
        </button>
      </form>
      <p className="text-center text-sm text-gray-600 mt-4">
        Already have an account? <Link to="/login" className="text-brand-600 hover:underline">Login</Link>
      </p>
    </div>
  );
}