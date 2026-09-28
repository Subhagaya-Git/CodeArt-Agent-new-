import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import ProductCard from "../components/ProductCard.jsx";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/products", { params: { limit: 6 } })
      .then(({ data }) => setProducts(data.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-2xl p-8 sm:p-12 mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Welcome to ShopHub</h1>
        <p className="text-brand-50 max-w-xl">
          A modular microservices e-commerce demo. Browse products, add to cart, checkout with mock
          payment, and track your orders.
        </p>
        <Link to="/products" className="btn bg-white text-brand-700 hover:bg-brand-50 mt-6">
          Shop Now
        </Link>
      </section>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Featured Products</h2>
        <Link to="/products" className="text-brand-600 hover:underline">View all →</Link>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-12">Loading products...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}