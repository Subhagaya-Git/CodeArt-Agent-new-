import { Link } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          className={`w-3.5 h-3.5 ${n <= Math.round(rating) ? "text-amber-400" : "text-slate-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.921 0 1.322 1.003.63 1.515l-2.807 2.039a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.005 1.603-.63 1.515l-2.807-2.039a1 1 0 00-1.175 0l-2.807 2.039c-.625.088-1.3-.594-.63-1.515l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.703-.512-.29-1.515.63-1.515h3.462a1 1 0 00.95-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const [adding, setAdding] = useState(false);
  const outOfStock = product.stock <= 0;

  async function quickAdd(e) {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to add items to cart");
      return;
    }
    setAdding(true);
    try {
      await api.post("/cart", { product_id: product._id, quantity: 1 });
      toast.success(`${product.name} added to cart`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  }

  return (
    <Link
      to={`/products/${product._id}`}
      className="group card overflow-hidden hover:shadow-card hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        {(product.image_url || product.image || product.imageUrl) ? (
          <img
            src={product.image_url || product.image || product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/images/products/fallback.svg";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="badge bg-white/90 backdrop-blur-sm text-slate-600 shadow-sm">
            {product.category}
          </span>
        </div>
        {outOfStock && (
          <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
            <span className="badge bg-red-500 text-white">Out of stock</span>
          </div>
        )}
        {!outOfStock && (
          <button
            onClick={quickAdd}
            disabled={adding}
            className="absolute bottom-3 right-3 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-brand-600 hover:bg-brand-600 hover:text-white transition-all duration-200 active:scale-90 disabled:opacity-50"
          >
            {adding ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            )}
          </button>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{product.description}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-slate-900">
            ${product.price.toFixed(2)}
          </span>
          {product.averageRating > 0 && (
            <div className="flex items-center gap-1">
              <Stars rating={product.averageRating} />
              <span className="text-xs text-slate-400">({product.reviews?.length || 0})</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
