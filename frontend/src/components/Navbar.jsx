import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";
import toast from "react-hot-toast";

const navLinks = [
  { to: "/products", label: "Products" },
  { to: "/cart", label: "Cart", auth: true },
  { to: "/orders", label: "Orders", auth: true },
  { to: "/admin", label: "Admin", admin: true },
];

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    api
      .get("/cart")
      .then(({ data }) => setCartCount((data.items || []).length))
      .catch(() => {});
  }, [user, location.pathname]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await logout();
    toast.success("Signed out");
    navigate("/");
  }

  function handleSearch(e) {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchInput.trim())}`);
      setSearchOpen(false);
      setSearchInput("");
    }
  }

  const visibleLinks = navLinks.filter(
    (l) => (!l.auth || user) && (!l.admin || isAdmin)
  );

  return (
    <nav className="glass sticky top-0 z-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm group-hover:shadow-glow transition-shadow">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-surface-900 tracking-tight">ShopHub</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {visibleLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `relative px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "text-brand-600 bg-brand-50"
                      : "text-surface-600 hover:text-surface-900 hover:bg-surface-100/60"
                  }`
                }
              >
                {link.label}
                {link.label === "Cart" && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="btn-ghost px-2.5"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-100/60 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <svg className={`w-4 h-4 text-surface-400 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 card p-2 shadow-lift animate-slide-down z-dropdown">
                    <div className="px-3 py-2 border-b border-surface-100 mb-1">
                      <p className="text-sm font-semibold text-surface-900 truncate">{user.name}</p>
                      <p className="text-xs text-surface-400 truncate">{user.email}</p>
                    </div>
                    <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-surface-600 hover:bg-surface-50 hover:text-surface-900 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 00-2 2v5a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2" />
                      </svg>
                      My Orders
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-surface-600 hover:bg-surface-50 hover:text-surface-900 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5l2 2h5a2 2 0 012 2v8a2 2 0 01-2 2z" />
                        </svg>
                        Admin Dashboard
                      </Link>
                    )}
                    <div className="border-t border-surface-100 mt-1 pt-1">
                      <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm hidden sm:inline-flex">Login</Link>
                <Link to="/register" className="btn-primary text-sm hidden sm:inline-flex">Sign Up</Link>
              </>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden btn-ghost px-2"
              aria-label="Menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="absolute left-0 right-0 top-16 bg-white/95 backdrop-blur-md border-b border-surface-200/60 shadow-soft animate-slide-down" ref={searchRef}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search products..."
                    className="input pl-10"
                    autoFocus
                  />
                </div>
                <button type="submit" className="btn-primary">Search</button>
              </form>
            </div>
          </div>
        )}

        {mobileOpen && (
          <div className="md:hidden flex flex-col gap-1 py-3 border-t border-surface-200/60 animate-fade-in">
            {visibleLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive ? "text-brand-600 bg-brand-50" : "text-surface-600 hover:bg-surface-100"
                  }`
                }
              >
                {link.label}
                {link.label === "Cart" && cartCount > 0 && ` (${cartCount})`}
              </NavLink>
            ))}
            {!user && (
              <div className="flex gap-2 px-3 pt-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-outline flex-1 text-sm">Login</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary flex-1 text-sm">Sign Up</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
