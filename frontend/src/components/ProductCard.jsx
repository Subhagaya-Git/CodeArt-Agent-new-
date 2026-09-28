import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  const outOfStock = product.stock <= 0;
  return (
    <Link to={`/products/${product._id}`} className="card overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-[3/2] bg-gray-100 overflow-hidden">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
        )}
      </div>
      <div className="p-4">
        <span className="text-xs text-gray-500 uppercase tracking-wide">{product.category}</span>
        <h3 className="font-semibold text-gray-900 mt-1 line-clamp-1">{product.name}</h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-lg font-bold text-brand-600">${product.price.toFixed(2)}</span>
          {outOfStock ? (
            <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">Out of stock</span>
          ) : (
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">In stock</span>
          )}
        </div>
        {product.averageRating > 0 && (
          <div className="text-sm text-amber-500 mt-1">★ {product.averageRating} ({product.reviews?.length})</div>
        )}
      </div>
    </Link>
  );
}