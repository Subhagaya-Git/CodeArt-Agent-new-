import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import ProductCard from "../components/ProductCard.jsx";
import { ProductSkeleton } from "../components/Spinner.jsx";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/products", { params: { limit: 6 } })
      .then(({ data }) => setProducts(data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-12 animate-fade-in">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white p-10 sm:p-16">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative max-w-2xl">
          <span className="badge bg-white/10 backdrop-blur-sm text-brand-100 mb-4">Microservices E-Commerce</span>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
            Shop smarter with ShopHub
          </h1>
          <p className="text-brand-100 text-lg mb-8 max-w-xl">
            Discover curated products, manage your cart, and checkout seamlessly — powered by a scalable microservices backend.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/products" className="btn bg-white text-brand-700 hover:bg-brand-50 shadow-md">
              Browse Products
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link to="/register" className="btn border border-white/20 text-white hover:bg-white/10">
              Create account
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Featured Products</h2>
            <p className="text-sm text-slate-500 mt-0.5">Handpicked items just for you</p>
          </div>
          <Link to="/products" className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1">
            View all
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)
            : (products || []).map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>
    </div>
  );
}
