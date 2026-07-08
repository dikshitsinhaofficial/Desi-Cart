'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import API from '../../../lib/api';
import { useAuth } from '@/lib/AuthContext';
import { CATEGORIES } from '@/app/data/products';
import { Shield, Loader2, Image as ImageIcon, ShoppingCart, RefreshCw } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────
interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  mrp: number;
  description: string;
  sellerName: string;
  image?: string;
  createdAt: string;
}

interface SellerStats {
  productCount: number;
  activeOrders: number;
  totalSales: number;
}

type ActiveTab = 'dashboard' | 'add' | 'products' | 'orders';

export default function SellerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<SellerStats>({ productCount: 0, activeOrders: 0, totalSales: 0 });
  const [form, setForm] = useState({
    name: '', category: CATEGORIES[0], price: '', mrp: '', description: '', sellerName: '', image: '',
  });
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  useEffect(() => {
    if (user?.email) {
      setForm(prev => ({ ...prev, sellerName: user.email! }));
    }
  }, [user]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchMyProducts = async () => {
    if (!user?.email) return;
    try {
      // Filter products by this seller's email
      const res = await fetch(`${API}/api/products?seller=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      setMyProducts(data);
    } catch {
      showToast('Could not fetch products', 'error');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API}/api/seller/stats`);
      const data = await res.json();
      setStats(data);
    } catch {
      // stats stay at 0 if backend is offline
    }
  };

  const fetchOrders = async () => {
    if (!user?.email) return;
    setOrdersLoading(true);
    try {
      const res = await fetch(`${API}/api/seller/orders`, {
        headers: { 'Authorization': `Bearer ${user?.role || 'seller'}_${user?.email}` }
      });
      const data = await res.json();
      setOrders(data);
    } catch {
      showToast('Could not fetch orders', 'error');
    } finally {
      setOrdersLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`${API}/api/seller/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.role || 'seller'}_${user?.email}`
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error();
      showToast('Order status updated');
      fetchOrders();
      fetchStats();
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  useEffect(() => {
    if (user && user.role === 'seller') {
      fetchMyProducts();
      fetchStats();
      fetchOrders();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) return showToast('Name and price are required', 'error');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/products`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.role || 'seller'}_${user?.email}`
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      showToast("✅ Product added! It's now live in the shop.");
      setForm(prev => ({ ...prev, name: '', price: '', mrp: '', description: '', image: '' }));
      fetchMyProducts();
      fetchStats();
      setActiveTab('products');
    } catch {
      showToast('Failed to add product', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Quick validation
    if (file.size > 2 * 1024 * 1024) {
      showToast('Image must be less than 2MB', 'error');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setForm(prev => ({ ...prev, image: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (_id: string) => {
    try {
      await fetch(`${API}/api/products/${_id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.role || 'seller'}_${user?.email}`
        }
      });
      showToast('Product removed');
      fetchMyProducts();
      fetchStats();
    } catch {
      showToast('Failed to remove product', 'error');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (user && user.role !== 'seller') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-slate-400 mb-6">You need seller privileges to view this page.</p>
          <button onClick={() => router.push('/login')} className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 rounded-xl font-semibold transition-colors">
            Sign In as Seller
          </button>
        </div>
      </div>
    );
  }

  const navItems: { key: ActiveTab; label: string; icon: string }[] = [
    { key: 'dashboard', label: 'Dashboard',   icon: '📊' },
    { key: 'add',       label: 'Add Product', icon: '➕' },
    { key: 'products',  label: 'My Products', icon: '📦' },
    { key: 'orders',    label: 'Orders',      icon: '🛒' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 shadow-md flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800 flex flex-col items-center">
          <h2 className="text-xl font-bold">
            <span className="text-white">Desi</span><span className="text-orange-500">Cart</span>
          </h2>
          <h3 className="text-xs font-semibold text-slate-500 mt-2 uppercase tracking-wider">Seller Portal</h3>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === item.key
                  ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
          {myProducts.length} product{myProducts.length !== 1 ? 's' : ''} listed
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* ── Dashboard Tab ── */}
        {activeTab === 'dashboard' && (
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome Back, {user?.email} 👋</h1>
            <p className="text-slate-400 mb-8 text-sm">Here's a summary of your store's performance.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { label: 'Total Products', value: myProducts.length,                    color: 'text-blue-400' },
                { label: 'Active Orders',  value: stats.activeOrders,                   color: 'text-emerald-400' },
                { label: 'Total Sales',    value: `₹${stats.totalSales.toFixed(2)}`,    color: 'text-purple-400' },
              ].map(card => (
                <div key={card.label} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow transition-colors duration-300">
                  <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{card.label}</p>
                  <p className={`text-3xl font-black mt-3 ${card.color}`}>{card.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6">
              <h3 className="font-semibold text-orange-400 mb-2">💡 Quick Start</h3>
              <p className="text-sm text-orange-200/70">
                Click <strong>Add Product</strong> in the sidebar to list your first product. Choose a category like
                Electronics, Fashion, or Daily Use — it will instantly appear in the customer shop!
              </p>
            </div>
          </div>
        )}

        {/* ── Add Product Tab ── */}
        {activeTab === 'add' && (
          <div className="max-w-4xl flex gap-8">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-2">Add New Product</h1>
              <p className="text-slate-400 mb-8 text-sm">Fill in the details to list a new item on your store.</p>
              
              <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl shadow p-6 space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samsung 65W Charger"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category *</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Selling Price (₹) *</label>
                    <input
                      type="number"
                      required
                      placeholder="999"
                      value={form.price}
                      onChange={e => setForm({ ...form, price: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">MRP (₹)</label>
                    <input
                      type="number"
                      placeholder="1999"
                      value={form.mrp}
                      onChange={e => setForm({ ...form, mrp: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Brief product description..."
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Product Image</label>
                  <div className="flex gap-4 mb-2">
                    <label className="flex-1 cursor-pointer bg-slate-800 border border-slate-700 hover:border-orange-500 rounded-xl px-4 py-3 text-sm text-center transition-colors">
                      <span className="text-orange-400 font-semibold flex items-center justify-center gap-2">
                        <ImageIcon size={16} /> Upload File (Max 2MB)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-slate-700"></div>
                    <span className="shrink-0 px-4 text-xs text-slate-500 uppercase tracking-widest">OR</span>
                    <div className="flex-grow border-t border-slate-700"></div>
                  </div>
                  <input
                    type="url"
                    placeholder="Paste direct image URL..."
                    value={form.image}
                    onChange={e => setForm({ ...form, image: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                  />
                  <p className="text-[10px] text-slate-500 mt-1.5">Real-time preview shown on the right.</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors duration-200 mt-4 shadow-lg shadow-orange-500/20"
                >
                  {loading ? 'Publishing…' : 'Publish Product'}
                </button>
              </form>
            </div>
            
            {/* Image Preview Panel */}
            <div className="w-80 shrink-0">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Image Preview</h3>
              <div className="w-full aspect-square bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col items-center justify-center relative">
                {form.image ? (
                   <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <ImageIcon className="w-12 h-12 text-slate-700 mb-3" />
                    <p className="text-sm text-slate-600 font-medium">No Image Provided</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── My Products Tab ── */}
        {activeTab === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">My Products</h1>
                <p className="text-slate-400 text-sm">Manage your listed products.</p>
              </div>
              <button
                onClick={() => setActiveTab('add')}
                className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-orange-500/20"
              >
                Add New Product
              </button>
            </div>

            {myProducts.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl text-center py-20 text-slate-500">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-xl font-bold text-slate-300 mb-2">No products yet</p>
                <p className="text-sm">Click "Add New Product" to list your first item</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {myProducts.map(p => (
                  <div key={p._id} className="bg-slate-900 rounded-2xl p-4 border border-slate-800 hover:border-slate-700 transition-colors group">
                    <div className="w-full h-40 bg-slate-800 rounded-xl overflow-hidden mb-4 relative">
                      {p.image ? (
                        <Image src={p.image} alt={p.name} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-4xl">📦</div>
                      )}
                    </div>
                    
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-orange-400 bg-orange-500/10 px-2 py-1 rounded-full">
                        {p.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-white mb-3 line-clamp-1">{p.name}</h3>
                    
                    <div className="flex items-end justify-between mt-auto">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-bold text-white">₹{p.price.toLocaleString('en-IN')}</span>
                        {p.mrp > p.price && (
                          <span className="text-xs text-slate-500 line-through">₹{p.mrp.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="text-red-400/70 hover:text-red-400 text-xs font-semibold transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Orders Tab ── */}
        {activeTab === 'orders' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Customer Orders</h1>
                <p className="text-slate-400 text-sm">Manage fulfillment for items you've sold.</p>
              </div>
              <button onClick={fetchOrders} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">
                <RefreshCw size={18} className={ordersLoading ? 'animate-spin text-orange-500' : 'text-slate-300'} />
              </button>
            </div>

            {ordersLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>
            ) : orders.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl text-center py-20 text-slate-500">
                <div className="text-6xl mb-4">🛒</div>
                <p className="text-xl font-bold text-slate-300 mb-2">No orders yet</p>
                <p className="text-sm">When customers buy your products, they will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => {
                  const myItems = order.items.filter((i: any) => i.sellerName === user?.email);
                  if (myItems.length === 0) return null;
                  
                  return (
                    <div key={order._id} className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                      <div className="flex justify-between items-start mb-4 border-b border-slate-800 pb-4">
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Order ID: {order._id}</p>
                          <p className="font-semibold text-white">{order.shippingAddress?.fullName || order.email}</p>
                          <p className="text-sm text-slate-400">{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500 mb-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {myItems.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-800 rounded flex items-center justify-center shrink-0">
                                {item.image ? <Image src={item.image} alt="" width={40} height={40} className="rounded object-cover" unoptimized/> : '📦'}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-white line-clamp-1">{item.name}</p>
                                <p className="text-xs text-slate-400">Qty: {item.qty} × ₹{item.price.toLocaleString()}</p>
                              </div>
                            </div>
                            <select
                              value={item.status || 'Processing'}
                              onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                              className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-orange-500 cursor-pointer"
                            >
                              <option value="Processing">Processing</option>
                              <option value="In Transit">In Transit</option>
                              <option value="Delivered">Delivered</option>
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl text-sm font-semibold text-white animate-fade-in-up ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
