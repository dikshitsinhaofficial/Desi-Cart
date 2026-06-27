'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Package, Truck, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock order history data
const MOCK_ORDERS = [
  {
    id: 'ORD-894-3921',
    date: '2023-11-20',
    total: 2499,
    status: 'Delivered',
    items: [
      { name: "Nike Essential Running Shoes", price: 2499, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80", qty: 1 }
    ]
  },
  {
    id: 'ORD-772-9182',
    date: '2023-11-15',
    total: 890,
    status: 'In Transit',
    items: [
      { name: "Organic Honey 500g", price: 340, image: "https://images.unsplash.com/photo-1587049352847-81a56d773c1c?w=400&q=80", qty: 2 },
      { name: "Premium Green Tea", price: 210, image: "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=400&q=80", qty: 1 }
    ]
  },
  {
    id: 'ORD-123-4567',
    date: '2023-10-05',
    total: 55000,
    status: 'Delivered',
    items: [
      { name: "MacBook Pro M1 256GB", price: 55000, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80", qty: 1 }
    ]
  }
];

export default function OrdersPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 flex items-center gap-3">
        <Package className="text-orange-500" /> My Orders
      </h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">View and track your recent orders.</p>

      <div className="space-y-6">
        {MOCK_ORDERS.map((order, i) => (
          <motion.div
            key={order.id}
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
                    {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Total</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">₹{order.total.toLocaleString('en-IN')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Order #</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{order.id}</p>
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
                      <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm md:text-base line-clamp-1 hover:text-orange-500 transition-colors cursor-pointer">
                        {item.name}
                      </h4>
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
    </div>
  );
}
