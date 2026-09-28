import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/stats")
      .then(({ data }) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center text-gray-500 py-12">Loading dashboard...</div>;

  const s = stats?.summary || {};

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={s.totalUsers ?? "—"} />
        <StatCard label="Total Products" value={s.totalProducts ?? "—"} />
        <StatCard label="Total Orders" value={s.totalOrders ?? "—"} />
        <StatCard label="Total Revenue" value={s.totalRevenue != null ? `$${Number(s.totalRevenue).toFixed(2)}` : "—"} />
      </div>

      {stats?.orders?.byStatus && (
        <div className="card p-5 mb-8">
          <h2 className="font-semibold mb-3">Orders by Status</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(stats.orders.byStatus).map(([status, count]) => (
              <span key={status} className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
                {status}: {count}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/admin/products" className="card p-6 hover:shadow-md transition-shadow">
          <h2 className="font-semibold text-lg">Manage Products</h2>
          <p className="text-gray-500 text-sm mt-1">Add, edit, or delete products.</p>
        </Link>
        <Link to="/admin/orders" className="card p-6 hover:shadow-md transition-shadow">
          <h2 className="font-semibold text-lg">Manage Orders</h2>
          <p className="text-gray-500 text-sm mt-1">View and update order statuses.</p>
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-brand-600 mt-1">{value}</p>
    </div>
  );
}