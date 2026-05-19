'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import API from '../../../lib/api';

const CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Books', 'Sports', 'Beauty', 'Toys', 'Daily Use'];

// ── Types ────────────────────────────────────────────────────────────────
interface Product {
  _id: string;         // MongoDB ObjectId string — was wrongly typed as number before
  name: string;
  category: string;
  price: number;
  mrp: number;
  description: string;
  sellerName: string;
  createdAt: string;
}

interface SellerStats {
  productCount: number;
  activeOrders: number;
  totalSales: number;
}

type ActiveTab = 'dashboard' | 'add' | 'products';

export default function SellerDashboard() {
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<SellerStats>({ productCount: 0, activeOrders: 0, totalSales: 0 });
  const [form, setForm] = useState({
    name: '', category: 'Electronics', price: '', mrp: '', description: '', sellerName: 'My Store',
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchMyProducts = async () => {
    try {
      const res = await fetch(`${API}/api/products`);
      const data = await res.json();
      setMyProducts(data);
    } catch {
      showToast('Could not fetch products', 'error');
    }
  };

  // Fetch stats from backend
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API}/api/seller/stats`);
      const data = await res.json();
      setStats(data);
    } catch {
      // stats stay at 0 if backend is offline
    }
  };

  useEffect(() => {
    fetchMyProducts();
    fetchStats();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) return showToast('Name and price are required', 'error');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      showToast("✅ Product added! It's now live in the shop.");
      setForm({ name: '', category: 'Electronics', price: '', mrp: '', description: '', sellerName: form.sellerName });
      fetchMyProducts();
      fetchStats();
      setActiveTab('products');
    } catch {
      showToast('Failed to add product', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fixed: now uses _id (string) instead of id (number)
  const handleDelete = async (_id: string) => {
    try {
      await fetch(`${API}/api/products/${_id}`, { method: 'DELETE' });
      showToast('Product removed');
      fetchMyProducts();
      fetchStats();
    } catch {
      showToast('Failed to remove product', 'error');
    }
  };

  const navItems: { key: ActiveTab; label: string; icon: string }[] = [
    { key: 'dashboard', label: 'Dashboard',   icon: '📊' },
    { key: 'add',       label: 'Add Product', icon: '➕' },
    { key: 'products',  label: 'My Products', icon: '📦' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex transition-colors duration-300">

      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-md flex flex-col transition-colors duration-300">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col items-center">
          <Image src="/logo.png" alt="Desi Cart Logo" width={120} height={48} priority />
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-2">Seller Portal</h2>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full text-left flex items-center gap-2 p-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.key
                  ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500">
          {myProducts.length} product{myProducts.length !== 1 ? 's' : ''} listed
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">

        {/* ── Dashboard Tab ── */}
        {activeTab === 'dashboard' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Welcome Back, Seller 👋</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { label: 'Total Products', value: myProducts.length,                    color: 'text-blue-500' },
                { label: 'Active Orders',  value: stats.activeOrders,                   color: 'text-green-500' },
                { label: 'Total Sales',    value: `₹${stats.totalSales.toFixed(2)}`,    color: 'text-orange-500' },
              ].map(card => (
                <div key={card.label} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow transition-colors duration-300">
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{card.label}</p>
                  <p className={`text-3xl font-bold mt-2 ${card.color}`}>{card.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-6">
              <h3 className="font-semibold text-orange-700 dark:text-orange-400 mb-1">💡 Quick Start</h3>
              <p className="text-sm text-orange-600 dark:text-orange-300">
                Click <strong>Add Product</strong> in the sidebar to list your first product. Choose a category like
                Electronics, Fashion, or Daily Use — it will instantly appear in the customer shop!
              </p>
            </div>
          </div>
        )}

        {/* ── Add Product Tab ── */}
        {activeTab === 'add' && (
          <div className="max-w-xl">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Add New Product ➕</h1>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-4 transition-colors duration-300">

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Product Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Samsung 65W Charger"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Category *</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <p className="text-xs text-gray-400 mt-1">This determines which section it appears under in the shop.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="999"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    placeholder="1999"
                    value={form.mrp}
                    onChange={e => setForm({ ...form, mrp: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Store Name</label>
                <input
                  type="text"
                  placeholder="Your store name"
                  value={form.sellerName}
                  onChange={e => setForm({ ...form, sellerName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief product description..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors duration-200"
              >
                {loading ? 'Publishing…' : '🚀 Publish Product to Shop'}
              </button>
            </form>
          </div>
        )}

        {/* ── My Products Tab ── */}
        {activeTab === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Products 📦</h1>
              <button
                onClick={() => setActiveTab('add')}
                className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                + Add New
              </button>
            </div>

            {myProducts.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-xl mb-2">No products yet</p>
                <p className="text-sm">Click &quot;Add Product&quot; to list your first item</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myProducts.map(p => (
                  <div key={p._id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-medium">
                        {p.category}
                      </span>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="text-red-400 hover:text-red-600 text-xs transition-colors"
                      >
                        🗑 Remove
                      </button>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{p.name}</h3>
                    <p className="text-xs text-gray-400 mb-2">{p.sellerName}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">₹{p.price.toLocaleString()}</span>
                      {p.mrp > p.price && (
                        <span className="text-xs text-gray-400 line-through">₹{p.mrp.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold text-white animate-fade-in-up ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-600'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
