'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import API from '../../../lib/api';

// ── Types ────────────────────────────────────────────────────────────────
interface AdminStats {
  productCount: number;
  totalRevenue: number;
  sellerCount: number;
  storeCount: number;
}

type AdminTab = 'overview' | 'sellers' | 'fees' | 'settings';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    productCount: 0,
    totalRevenue: 0,
    sellerCount: 0,
    storeCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  useEffect(() => {
    fetch(`${API}/api/admin/stats`)
      .then(r => r.json())
      .then((data: AdminStats) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const navItems: { key: AdminTab; label: string; icon: string }[] = [
    { key: 'overview',  label: 'Overview',       icon: '📊' },
    { key: 'sellers',   label: 'Sellers',         icon: '🏪' },
    { key: 'fees',      label: 'Platform Fees',   icon: '💰' },
    { key: 'settings',  label: 'Settings',        icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex transition-colors duration-300">

      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 dark:bg-gray-800 shadow-md flex flex-col transition-colors duration-300">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col items-center">
          <Image src="/logo.png" alt="Desi Cart Logo" width={120} height={48} priority />
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-2">Super Admin</h2>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full text-left flex items-center gap-2 p-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.key
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500">
          {loading ? 'Loading…' : `${stats.productCount} products · ${stats.storeCount} stores`}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">

        {/* ── Overview Tab ── */}
        {activeTab === 'overview' && (
          <div>
            <h1 className="text-3xl font-semibold mb-6">Platform Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                {
                  label: 'Total Revenue',
                  value: loading ? '…' : `₹${stats.totalRevenue.toLocaleString()}`,
                  icon: '💰',
                  color: 'text-green-600 dark:text-green-400',
                  bg: 'bg-green-50 dark:bg-green-900/20',
                },
                {
                  label: 'Products Listed',
                  value: loading ? '…' : stats.productCount,
                  icon: '📦',
                  color: 'text-blue-600 dark:text-blue-400',
                  bg: 'bg-blue-50 dark:bg-blue-900/20',
                },
                {
                  label: 'Active Sellers',
                  value: loading ? '…' : stats.sellerCount,
                  icon: '🏪',
                  color: 'text-purple-600 dark:text-purple-400',
                  bg: 'bg-purple-50 dark:bg-purple-900/20',
                },
                {
                  label: 'Active Stores',
                  value: loading ? '…' : stats.storeCount,
                  icon: '🏬',
                  color: 'text-orange-600 dark:text-orange-400',
                  bg: 'bg-orange-50 dark:bg-orange-900/20',
                },
              ].map(card => (
                <div
                  key={card.label}
                  className={`${card.bg} p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm`}
                >
                  <div className="text-2xl mb-2">{card.icon}</div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{card.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
                </div>
              ))}
            </div>

            {/* Quick info banner */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-1">ℹ️ Admin Note</h3>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                Revenue reflects completed wallet top-up transactions. Seller and store counts are derived from
                unique seller names registered in the product catalogue.
              </p>
            </div>
          </div>
        )}

        {/* ── Sellers Tab ── */}
        {activeTab === 'sellers' && (
          <div>
            <h1 className="text-3xl font-semibold mb-6">🏪 Sellers</h1>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-12 text-center text-gray-400">
              <p className="text-5xl mb-4">🏪</p>
              <p className="text-lg font-medium">Seller management</p>
              <p className="text-sm mt-1">Individual seller profiles and approvals — coming soon.</p>
            </div>
          </div>
        )}

        {/* ── Platform Fees Tab ── */}
        {activeTab === 'fees' && (
          <div>
            <h1 className="text-3xl font-semibold mb-6">💰 Platform Fees</h1>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-12 text-center text-gray-400">
              <p className="text-5xl mb-4">💰</p>
              <p className="text-lg font-medium">Fee configuration</p>
              <p className="text-sm mt-1">Set commission rates per category — coming soon.</p>
            </div>
          </div>
        )}

        {/* ── Settings Tab ── */}
        {activeTab === 'settings' && (
          <div>
            <h1 className="text-3xl font-semibold mb-6">⚙️ Settings</h1>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-12 text-center text-gray-400">
              <p className="text-5xl mb-4">⚙️</p>
              <p className="text-lg font-medium">Platform settings</p>
              <p className="text-sm mt-1">Global configuration options — coming soon.</p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
