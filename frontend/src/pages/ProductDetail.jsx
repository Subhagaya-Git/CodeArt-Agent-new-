import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [review, setReview] = useState({ rating: 5, comment: "" });

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then(({ data }) => setProduct(data.product))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAddToCart() {
    setError("");
    setMsg("");
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await api.post("/cart", { product_id: id, quantity: qty });
      setMsg("Added to cart!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add to cart");
    }
  }

  async function handleReview(e) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post(`/products/${id}/reviews`, review);
      setProduct(data.product);
      setReview({ rating: 5, comment: "" });
      setMsg("Review submitted!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review");
    }
  }

  if (loading) return <div className="text-center text-gray-500 py-12">Loading...</div>;
  if (!product) return <div className="text-center text-gray-500 py-12">Product not found.</div>;

  const outOfStock = product.stock <= 0;

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="card overflow-hidden">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-64 flex items-center justify-center text-gray-400">No image</div>
        )}
      </div>

      <div>
        <span className="text-sm text-gray-500 uppercase tracking-wide">{product.category}</span>
        <h1 className="text-3xl font-bold mt-1">{product.name}</h1>
        <p className="text-3xl font-bold text-brand-600 mt-3">${product.price.toFixed(2)}</p>
        <p className="text-gray-600 mt-4">{product.description}</p>

        <div className="mt-4">
          {outOfStock ? (
            <span className="px-3 py-1 rounded-full bg-red-100 text-red-700">Out of stock</span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700">
              In stock ({product.stock} available)
            </span>
          )}
        </div>

        {!outOfStock && (
          <div className="flex items-center gap-3 mt-6">
            <input
              type="number"
              min="1"
              max={product.stock}
              value={qty}
              onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="input w-20"
            />
            <button onClick={handleAddToCart} className="btn-primary">Add to Cart</button>
          </div>
        )}

        {msg && <div className="bg-green-50 text-green-700 p-3 rounded-lg mt-4">{msg}</div>}
        {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mt-4">{error}</div>}

        <div className="mt-8 border-t pt-6">
          <h2 className="text-xl font-bold mb-3">Reviews</h2>
          {product.averageRating > 0 && (
            <p className="text-amber-500 mb-3">★ {product.averageRating} ({product.reviews.length} reviews)</p>
          )}
          {product.reviews?.length === 0 && <p className="text-gray-500">No reviews yet.</p>}
          <div className="space-y-3">
            {product.reviews?.map((r) => (
              <div key={r._id} className="card p-3">
                <div className="text-amber-500 text-sm">{"★".repeat(r.rating)}</div>
                <p className="text-gray-700 text-sm mt-1">{r.comment || "No comment"}</p>
              </div>
            ))}
          </div>

          {user && (
            <form onSubmit={handleReview} className="card p-4 mt-4 space-y-3">
              <h3 className="font-semibold">Write a review</h3>
              <div>
                <label className="label">Rating</label>
                <select
                  value={review.rating}
                  onChange={(e) => setReview({ ...review, rating: parseInt(e.target.value) })}
                  className="input w-24"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>{n} ★</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Comment</label>
                <textarea
                  value={review.comment}
                  onChange={(e) => setReview({ ...review, comment: e.target.value })}
                  className="input"
                  rows="2"
                />
              </div>
              <button type="submit" className="btn-primary">Submit Review</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}