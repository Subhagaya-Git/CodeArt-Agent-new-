import { useEffect, useState } from "react";
import api from "../../api/axios.js";

const emptyForm = { name: "", description: "", price: "", stock: "", category: "", image_url: "" };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  function fetchProducts() {
    setLoading(true);
    api
      .get("/products", { params: { limit: 50 } })
      .then(({ data }) => setProducts(data.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }

  useEffect(fetchProducts, []);

  function openCreate() {
    setEditing("new");
    setForm(emptyForm);
    setError("");
    setMsg("");
  }

  function openEdit(product) {
    setEditing(product._id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      image_url: product.image_url,
    });
    setError("");
    setMsg("");
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMsg("");
    const payload = {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
    };
    try {
      if (editing === "new") {
        await api.post("/products", payload);
        setMsg("Product created");
      } else {
        await api.put(`/products/${editing}`, payload);
        setMsg("Product updated");
      }
      setEditing(null);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Products</h1>
        <button onClick={openCreate} className="btn-primary">+ Add Product</button>
      </div>

      {msg && <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4">{msg}</div>}
      {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">{error}</div>}

      {editing && (
        <form onSubmit={handleSubmit} className="card p-6 mb-6 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label className="label">Category</label>
            <input name="category" value={form.category} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label className="label">Price</label>
            <input type="number" step="0.01" name="price" value={form.price} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label className="label">Stock</label>
            <input type="number" name="stock" value={form.stock} onChange={handleChange} className="input" required />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Image URL</label>
            <input name="image_url" value={form.image_url} onChange={handleChange} className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="input" rows="3" />
          </div>
          <div className="sm:col-span-2 flex gap-3">
            <button type="submit" className="btn-primary">Save</button>
            <button type="button" onClick={() => setEditing(null)} className="btn-outline">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center text-gray-500 py-12">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b">
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{p.category}</td>
                  <td className="p-3">${p.price.toFixed(2)}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3 flex gap-2">
                    <button onClick={() => openEdit(p)} className="btn-outline px-3 py-1 text-xs">Edit</button>
                    <button onClick={() => handleDelete(p._id)} className="btn-danger px-3 py-1 text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}