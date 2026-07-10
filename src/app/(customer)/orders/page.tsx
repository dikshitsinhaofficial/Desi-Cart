'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Truck, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
}

interface Order {
  _id: string;
  email: string;
  total: number;
  status: 'Processing' | 'In Transit' | 'Delivered';
  createdAt: string;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
  };
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || ''}/api/orders?email=${encodeURIComponent(user.email!)}`
        );
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error('Failed to fetch orders', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 px-4">
        <div className="text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl max-w-sm w-full shadow-sm">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-slate-500 mb-6">Please sign in to view your orders.</p>
          <Link href="/login?redirect=/orders" className="inline-block w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 flex items-center gap-3">
        <Package className="text-orange-500" /> My Orders
      </h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">View and track your recent orders.</p>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <Package size={64} className="mx-auto text-slate-300 dark:text-slate-700 mb-6" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">No orders yet</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
            You haven't placed any orders yet. Explore the shop and buy something amazing!
          </p>
          <Link href="/shop" className="inline-block px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-orange-500/20">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order, i) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm"
            >
              {/* Order Header */}
              <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Order Placed</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Total</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">₹{order.total.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Order #</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[150px]">{order._id}</p>
                </div>
              </div>

              {/* Order Status & Items */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  {order.status === 'Delivered' ? (
                    <CheckCircle2 size={20} className="text-emerald-500" />
                  ) : order.status === 'In Transit' ? (
                    <Truck size={20} className="text-blue-500" />
                  ) : (
                    <Clock size={20} className="text-orange-500" />
                  )}
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">{order.status}</h3>
                </div>

                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden relative shrink-0 border border-slate-200 dark:border-slate-700">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/shop/${item.productId}`}>
                          <h4 className="font-semibold text-slate-900 dark:text-white text-sm md:text-base line-clamp-1 hover:text-orange-500 transition-colors">
                            {item.name}
                          </h4>
                        </Link>
                        <p className="text-slate-500 text-sm mt-1">Qty: {item.qty}</p>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        ₹{item.price.toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="mt-8 flex items-center gap-3">
                  <Link
                    href="/shop"
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-semibold rounded-xl text-sm transition-colors"
                  >
                    Buy it again
                  </Link>
                  <button className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-sm transition-colors">
                    Track Package
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
