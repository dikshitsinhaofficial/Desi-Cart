'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Package, Truck, CheckCircle, Clock, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';
import API from '@/lib/api';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
  sellerName?: string;
  status?: string;
}

interface Order {
  _id: string;
  email: string;
  items: OrderItem[];
  total: number;
  status: string;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
  };
  createdAt: string;
}

const statusConfig: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  'Processing': { color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', icon: Clock, label: 'Processing' },
  'In Transit': { color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', icon: Truck, label: 'In Transit' },
  'Delivered':  { color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle, label: 'Delivered' },
};

function SkeletonOrder() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
        <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded-full" />
      </div>
      <div className="flex gap-3">
        {[1,2].map(i => (
          <div key={i} className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    
    fetch(`${API}/api/orders`, {
      headers: { 'Authorization': `Bearer ${user.role}_${user.email}` }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
          <div className="h-8 w-40 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-6" />
          {[1,2,3].map(i => <SkeletonOrder key={i} />)}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Sign in to view orders</h1>
          <p className="text-slate-500 mb-6">You need to be logged in to see your order history.</p>
          <button onClick={() => router.push('/login')} className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center">
            <Package size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Orders</h1>
            <p className="text-sm text-slate-500">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 text-center py-20">
            <ShoppingBag className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No orders yet</h2>
            <p className="text-slate-400 text-sm mb-6">When you place an order, it will appear here.</p>
            <button onClick={() => router.push('/shop')} className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const status = statusConfig[order.status] || statusConfig['Processing'];
              const StatusIcon = status.icon;
              const isExpanded = expandedId === order._id;
              const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
              });

              return (
                <div key={order._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-all shadow-sm hover:shadow-md">
                  {/* Header */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : order._id)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        {order.items.slice(0, 3).map((item, i) => (
                          <div key={i} className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 overflow-hidden relative">
                            {item.image ? (
                              <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                            ) : (
                              <span className="flex items-center justify-center w-full h-full text-sm">📦</span>
                            )}
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">
                          {order.items.length} item{order.items.length > 1 ? 's' : ''} • ₹{order.total.toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-slate-500">{orderDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${status.bg} ${status.color}`}>
                        <StatusIcon size={12} />
                        {status.label}
                      </span>
                      {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-slate-100 dark:border-slate-800">
                      <div className="pt-4 space-y-3">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                            <div className="w-14 h-14 rounded-lg bg-white dark:bg-slate-800 overflow-hidden relative shrink-0">
                              {item.image ? (
                                <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                              ) : (
                                <span className="flex items-center justify-center w-full h-full text-xl">📦</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-800 dark:text-white line-clamp-1">{item.name}</p>
                              <p className="text-xs text-slate-500">Qty: {item.qty} × ₹{item.price.toLocaleString('en-IN')}</p>
                            </div>
                            <p className="text-sm font-bold text-slate-800 dark:text-white shrink-0">
                              ₹{(item.price * item.qty).toLocaleString('en-IN')}
                            </p>
                          </div>
                        ))}
                      </div>

                      {order.shippingAddress && (
                        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Shipping Address</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300">
                            {order.shippingAddress.fullName}<br />
                            {order.shippingAddress.address}<br />
                            {order.shippingAddress.city} - {order.shippingAddress.postalCode}<br />
                            📞 {order.shippingAddress.phone}
                          </p>
                        </div>
                      )}

                      <div className="mt-4 flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-xs text-slate-500">Order ID: {order._id.slice(-8).toUpperCase()}</span>
                        <span className="text-lg font-black text-slate-800 dark:text-white">₹{order.total.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
