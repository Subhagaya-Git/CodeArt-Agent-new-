import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios.js";
import ProductCard from "../components/ProductCard.jsx";
import { ProductSkeleton } from "../components/Spinner.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Pagination from "../components/Pagination.jsx";

const sortOptions = [
  { value: "", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const page = parseInt(searchParams.get("page")) || 1;
  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "";

  useEffect(() => {
    api
      .get("/products/categories")
      .then(({ data }) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get("/products", { params: { page, category, search, limit: 9 } })
      .then(({ data }) => {
        setProducts(data.products || []);
        setPagination(data.pagination || null);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [page, category, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const current = searchParams.get("search") || "";
      if (searchInput !== current) {
        const params = new URLSearchParams(searchParams);
        if (searchInput) params.set("search", searchInput);
        else params.delete("search");
        params.delete("page");
        setSearchParams(params);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const updateParam = useCallback((key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  function goToPage(p) {
    const params = new URLSearchParams(searchParams);
    params.set("page", p);
    setSearchParams(params);
  }

  const sortedProducts = [...products];
  if (sort === "price-asc") sortedProducts.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") sortedProducts.sort((a, b) => b.price - a.price);
  else if (sort === "name-asc") sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === "name-desc") sortedProducts.sort((a, b) => b.name.localeCompare(a.name));

  const FilterSidebar = (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-surface-900 mb-3">Categories</h3>
        <div className="space-y-1">
          <button
            onClick={() => { updateParam("category", ""); setSidebarOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              !category ? "bg-brand-50 text-brand-700 font-medium" : "text-surface-600 hover:bg-surface-100"
            }`}
          >
            All Categories
          </button>
          {(categories || []).map((c) => (
            <button
              key={c}
              onClick={() => { updateParam("category", c); setSidebarOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                category === c ? "bg-brand-50 text-brand-700 font-medium" : "text-surface-600 hover:bg-surface-100"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      {(search || category) && (
        <button
          onClick={() => { setSearchInput(""); updateParam("search", ""); updateParam("category", ""); }}
          className="btn-outline w-full text-sm"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Products</h1>
          <p className="text-sm text-surface-500 mt-0.5">{pagination?.total || "..."} items available</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden btn-outline px-3"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M3 8h18M3 12h18M3 16h18M3 20h18" />
            </svg>
            <span className="text-sm">Filters</span>
          </button>
          <select
            value={sort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="input sm:w-48 cursor-pointer text-sm"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="relative flex gap-6">
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="card p-5 sticky top-20">
            {FilterSidebar}
          </div>
        </aside>

        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-modal" onClick={() => setSidebarOpen(false)}>
            <div className="absolute inset-0 bg-surface-900/40 backdrop-blur-sm" />
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-white p-5 shadow-lift animate-slide-down overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-surface-900">Filters</h3>
                <button onClick={() => setSidebarOpen(false)} className="btn-ghost px-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {FilterSidebar}
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="relative mb-4">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products..."
              className="input pl-10"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : sortedProducts.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Try adjusting your search or filters to find what you're looking for."
              action={
                <button onClick={() => { setSearchInput(""); updateParam("search", ""); updateParam("category", ""); }} className="btn-outline">
                  Clear filters
                </button>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedProducts.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
              {pagination && (
                <Pagination
                  page={page}
                  totalPages={pagination.totalPages || 1}
                  onPageChange={goToPage}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
