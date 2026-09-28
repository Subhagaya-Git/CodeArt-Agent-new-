import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-brand-600">
            ShopHub
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/products" className="text-gray-700 hover:text-brand-600">
              Products
            </Link>
            {user && (
              <Link to="/cart" className="text-gray-700 hover:text-brand-600">
                Cart
              </Link>
            )}
            {user && (
              <Link to="/orders" className="text-gray-700 hover:text-brand-600">
                Orders
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="text-gray-700 hover:text-brand-600">
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="hidden sm:inline text-sm text-gray-600">
                  Hi, {user.name}
                </span>
                <button onClick={handleLogout} className="btn-outline text-sm">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-outline text-sm">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="md:hidden flex items-center gap-4 py-2 border-t border-gray-100">
          <Link to="/products" className="text-sm text-gray-700">Products</Link>
          {user && <Link to="/cart" className="text-sm text-gray-700">Cart</Link>}
          {user && <Link to="/orders" className="text-sm text-gray-700">Orders</Link>}
          {isAdmin && <Link to="/admin" className="text-sm text-gray-700">Admin</Link>}
        </div>
      </div>
    </nav>
  );
}