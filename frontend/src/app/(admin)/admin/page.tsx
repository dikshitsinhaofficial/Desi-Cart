import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Admin Dashboard | Desi Cart",
  description: "Desi Cart super admin panel.",
};

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 dark:bg-gray-800 shadow-md flex flex-col transition-colors duration-300">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col items-center">
          <Image src="/logo.png" alt="Desi Cart Logo" width={120} height={48} priority />
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-2">Super Admin</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="#" className="block p-2 rounded bg-blue-600 text-white font-medium">Overview</a>
          <a href="#" className="block p-2 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors">Sellers</a>
          <a href="#" className="block p-2 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors">Platform Fees</a>
          <a href="#" className="block p-2 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors">Settings</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-semibold mb-6">Platform Overview</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Platform Revenue</h3>
            <p className="text-2xl font-bold mt-2">₹0.00</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Pending Seller Approvals</h3>
            <p className="text-2xl font-bold text-yellow-500 mt-2">0</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Active Stores</h3>
            <p className="text-2xl font-bold mt-2">0</p>
          </div>
        </div>
      </main>
    </div>
  );
}
