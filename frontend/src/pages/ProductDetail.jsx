import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";
import Spinner from "../components/Spinner.jsx";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import QuantityStepper from "../components/QuantityStepper.jsx";
import ProductCard from "../components/ProductCard.jsx";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [review, setReview] = useState({ rating: 5, comment: "" });

  useEffect(() => {
    setLoading(true);
    setQty(1);
    api
      .get(`/products/${id}`)
      .then(({ data }) => {
        setProduct(data.product);
        if (data.product?.category) {
          api
            .get("/products", { params: { category: data.product.category, limit: 5 } })
            .then(({ data: d }) => {
              setRelated((d.products || []).filter((p) => p._id !== id).slice(0, 4));
            })
            .catch(() => setRelated([]));
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAddToCart() {
    if (!user) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }
    try {
      await api.post("/cart", { product_id: id, quantity: qty });
      toast.success(`${product.name} added to cart`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add to cart");
    }
  }

  async function handleReview(e) {
    e.preventDefault();
    try {
      const { data } = await api.post(`/products/${id}/reviews`, review);
      setProduct(data.product);
      setReview({ rating: 5, comment: "" });
      toast.success("Review submitted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    }
  }

  if (loading) return <Spinner label="Loading product..." />;
  if (!product) return (
    <div className="text-center py-20">
      <h2 className="text-xl font-semibold text-surface-700 mb-2">Product not found</h2>
      <button onClick={() => navigate("/products")} className="btn-outline mt-4">Back to products</button>
    </div>
  );

  const outOfStock = product.stock <= 0;
  const imgSrc = product.image_url || product.image || product.imageUrl;

  return (
    <div className="space-y-10 animate-fade-in">
      <Breadcrumbs items={[
        { label: "Home", to: "/" },
        { label: "Products", to: "/products" },
        { label: product.name },
      ]} />

      <div className="grid md:grid-cols-2 gap-8">
        <div className="card overflow-hidden">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/images/products/fallback.svg";
              }}
            />
          ) : (
            <div className="w-full h-64 flex items-center justify-center text-surface-300">
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <span className="badge bg-brand-50 text-brand-700 mb-3">{product.category}</span>
            <h1 className="text-3xl font-bold text-surface-900">{product.name}</h1>
            <p className="text-2xl font-bold text-surface-900 mt-3">${product.price.toFixed(2)}</p>
          </div>

          <p className="text-surface-600 leading-relaxed">{product.description}</p>

          <div className="flex items-center gap-3">
            {outOfStock ? (
              <span className="badge bg-red-50 text-red-700 border border-red-200">Out of stock</span>
            ) : (
              <span className="badge bg-green-50 text-green-700 border border-green-200">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />
                In stock ({product.stock} available)
              </span>
            )}
            {product.averageRating > 0 && (
              <span className="text-sm text-surface-500">
                ★ {product.averageRating.toFixed(1)} ({product.reviews?.length || 0} reviews)
              </span>
            )}
          </div>

          {!outOfStock && (
            <div className="flex items-center gap-3">
              <QuantityStepper value={qty} min={1} max={product.stock} onChange={setQty} />
              <button onClick={handleAddToCart} className="btn-primary flex-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Add to Cart
              </button>
            </div>
          )}

          <div className="border-t border-surface-200 pt-6">
            <h2 className="text-lg font-semibold text-surface-900 mb-4">Reviews</h2>
            <div className="space-y-3">
              {(product.reviews || []).map((r) => (
                <div key={r._id} className="card p-4">
                  <div className="flex items-center gap-0.5 mb-1.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <svg key={n} className={`w-4 h-4 ${n <= r.rating ? "text-amber-400" : "text-surface-200"}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.921 0 1.322 1.003.63 1.515l-2.807 2.039a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.005 1.603-.63 1.515l-2.807-2.039a1 1 0 00-1.175 0l-2.807 2.039c-.625.088-1.3-.594-.63-1.515l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.703-.512-.29-1.515.63-1.515h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-surface-600">{r.comment || "No comment"}</p>
                </div>
              ))}
              {(product.reviews || []).length === 0 && (
                <p className="text-sm text-surface-400">No reviews yet. Be the first!</p>
              )}
            </div>

            {user && (
              <form onSubmit={handleReview} className="card p-4 mt-4 space-y-3">
                <h3 className="font-semibold text-surface-900">Write a review</h3>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-surface-600">Rating:</label>
                  <select value={review.rating} onChange={(e) => setReview({ ...review, rating: parseInt(e.target.value) })} className="input w-24">
                    {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
                  </select>
                </div>
                <textarea
                  value={review.comment}
                  onChange={(e) => setReview({ ...review, comment: e.target.value })}
                  className="input"
                  rows="2"
                  placeholder="Share your thoughts..."
                />
                <button type="submit" className="btn-primary">Submit Review</button>
              </form>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-surface-900 mb-4">You may also like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
