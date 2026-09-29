import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      <div className="text-7xl font-bold text-brand-200 mb-4">404</div>
      <h1 className="text-2xl font-bold text-surface-900 mb-2">Page not found</h1>
      <p className="text-sm text-surface-500 mb-6 text-center max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link to="/" className="btn-primary">Back to home</Link>
        <Link to="/products" className="btn-outline">Browse products</Link>
      </div>
    </div>
  );
}