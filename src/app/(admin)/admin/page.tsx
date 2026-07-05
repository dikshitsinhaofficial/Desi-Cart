'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, Users, ShoppingCart,
  TrendingUp, Settings, IndianRupee, Store, Shield,
  ChevronRight, Loader2, RefreshCw
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Stats {
  productCount: number;
  totalRevenue: number;
  sellerCount: number;
  storeCount: number;
  activeOrders?: number;
}

interface Seller {
  name: string;
  productCount: number;
}

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

interface Order {
  _id: string;
  email: string;
  total: number;
  status: 'Processing' | 'In Transit' | 'Delivered';
  createdAt: string;
  items: OrderItem[];
  shippingAddress?: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
  };
}

type Tab = 'overview' | 'sellers' | 'orders' | 'settings';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [sellersLoading, setSellersLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const getAuthHeaders = () => {
    return {
      'Authorization': `Bearer ${user?.role || 'admin'}_${user?.email}`
    };
  };

  const fetchStats = () => {
    if (!user) return;
    setStatsLoading(true);
    fetch(`${API}/api/admin/stats`, {
      headers: getAuthHeaders()
    })
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  };

  const fetchOrders = () => {
    if (!user) return;
    setOrdersLoading(true);
    fetch(`${API}/api/admin/orders`, {
      headers: getAuthHeaders()
    })
      .then(r => r.json())
      .then(d => setOrders(d))
      .catch(() => {})
      .finally(() => setOrdersLoading(false));
  };

  useEffect(() => {
    if (!loading && user && user.role === 'admin') {
      fetchStats();
    }
  }, [user, loading]);

  useEffect(() => {
    if (!user) return;

    if (tab === 'sellers' && sellers.length === 0) {
      setSellersLoading(true);
      fetch(`${API}/api/sellers`)
        .then(r => r.json())
        .then(d => setSellers(d))
        .catch(() => {})
        .finally(() => setSellersLoading(false));
    }
    
    if (tab === 'orders') {
      fetchOrders();
    }
  }, [tab, sellers.length, user]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`${API}/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus as any } : o));
        fetchStats();
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-slate-400 mb-6">You need admin privileges to view this page.</p>
          <button onClick={() => router.push('/login')} className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 rounded-xl font-semibold transition-colors">
            Sign In as Admin
          </button>
        </div>
      </div>
    );
  }

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'sellers', label: 'Sellers', icon: <Store size={18} /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingCart size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  const statCards = [
    {
      label: 'Total Revenue', value: `₹${(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}`,
      icon: <IndianRupee size={22} />, color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      label: 'Total Products', value: stats?.productCount ?? 0,
      icon: <Package size={22} />, color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      label: 'Active Sellers', value: stats?.sellerCount ?? 0,
      icon: <Users size={22} />, color: 'from-violet-500 to-purple-600', bg: 'bg-violet-500/10 border-violet-500/20'
    },
    {
      label: 'Active Orders', value: stats?.activeOrders ?? 0,
      icon: <TrendingUp size={22} />, color: 'from-orange-500 to-red-500', bg: 'bg-orange-500/10 border-orange-500/20'
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="px-6 py-6 border-b border-slate-800">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Admin Panel</p>
          <h2 className="text-xl font-bold">
            <span className="text-white">Desi</span><span className="text-orange-500">Cart</span>
          </h2>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === item.id
                  ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon} {item.label}
              {tab === item.id && <ChevronRight size={14} className="ml-auto" />}\
            </button>
          ))}\
        </nav>
        <div className="px-6 py-4 border-t border-slate-800">
          <p className="text-xs text-slate-500">{user?.email}</p>
          <span className="inline-block mt-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400">Admin</span>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-auto">
        {tab === 'overview' && (
          <>
            <h1 className="text-2xl font-bold mb-2">Dashboard Overview</h1>
            <p className="text-slate-400 mb-8 text-sm">Welcome back! Here&apos;s your store summary.</p>
            {statsLoading ? (
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 size={18} className="animate-spin" /> Loading stats...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {statCards.map(card => (
                  <div key={card.label} className={`rounded-2xl border p-5 ${card.bg}`}>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white mb-4`}>
                      {card.icon}
                    </div>
                    <p className="text-slate-400 text-sm">{card.label}</p>
                    <p className="text-2xl font-bold mt-1">{card.value}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'sellers' && (
          <>
            <h1 className="text-2xl font-bold mb-2">Sellers</h1>
            <p className="text-slate-400 mb-8 text-sm">All registered sellers on the platform.</p>
            {sellersLoading ? (
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 size={18} className="animate-spin" /> Loading sellers...
              </div>
            ) : sellers.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center mt-4">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Store size={32} className="text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Sellers Found</h3>
                <p className="text-slate-400">There are currently no active sellers on the platform.</p>
              </div>
            ) : (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="text-left px-6 py-4 font-semibold">#</th>
                      <th className="text-left px-6 py-4 font-semibold">Seller Name</th>
                      <th className="text-right px-6 py-4 font-semibold">Products Listed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sellers.map((s, i) => (
                      <tr key={s.name} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 text-slate-500">{i + 1}</td>
                        <td className="px-6 py-4 font-medium">{s.name}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="px-3 py-1 bg-orange-500/10 text-orange-400 rounded-full text-xs font-bold">{s.productCount}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {tab === 'orders' && (
          <>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-2xl font-bold">Orders</h1>
                <p className="text-slate-400 text-sm">Manage and track all customer orders.</p>
              </div>
              <button onClick={fetchOrders} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
                <RefreshCw size={18} className={ordersLoading ? 'animate-spin text-orange-500' : ''} />
              </button>
            </div>
            
            {ordersLoading ? (
              <div className="flex items-center gap-2 text-slate-400 mt-6">
                <Loader2 size={18} className="animate-spin" /> Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center mt-6">
                <ShoppingCart size={48} className="text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500">No orders have been placed on the platform yet.</p>
              </div>
            ) : (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden mt-6">
                <table className="w-full text-sm text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/50">
                      <th className="text-left px-6 py-4 font-semibold">Order ID</th>
                      <th className="text-left px-6 py-4 font-semibold">Customer</th>
                      <th className="text-left px-6 py-4 font-semibold">Items</th>
                      <th className="text-left px-6 py-4 font-semibold">Total</th>
                      <th className="text-left px-6 py-4 font-semibold">Status</th>
                      <th className="text-right px-6 py-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o._id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-100 truncate max-w-[120px]">{o._id}</td>
                        <td className="px-6 py-4 font-medium">{o.email}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-0.5 max-w-[200px]">
                            {o.items.map((it, idx) => (
                              <span key={idx} className="truncate text-xs text-slate-400">
                                {it.name} <strong className="text-slate-200">x{it.qty}</strong>
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-black text-slate-100">₹{o.total.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                            o.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400' :
                            o.status === 'In Transit' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <select
                            value={o.status}
                            onChange={(e) => updateOrderStatus(o._id, e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-orange-500 cursor-pointer"
                          >
                            <option value="Processing">Processing</option>
                            <option value="In Transit">In Transit</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {tab === 'settings' && (
          <>
            <h1 className="text-2xl font-bold mb-2">Settings</h1>
            <p className="text-slate-400 mb-8 text-sm">Configure your platform settings.</p>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Site Name</label>
                <input defaultValue="DesiCart" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Platform Currency</label>
                <input defaultValue="INR (₹)" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors" />
              </div>
              <button className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors text-sm">
                Save Changes
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
