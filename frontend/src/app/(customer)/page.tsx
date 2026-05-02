import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Welcome to Desi Cart",
  description: "Discover amazing products from local sellers across India.",
};

export default function CustomerHome() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center transition-colors duration-300">
      <div className="animate-fade-in-up delay-100 mb-4">
        <Image src="/logo.png" alt="Desi Cart Logo" width={200} height={80} priority />
      </div>
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 animate-fade-in-up delay-300">
        Welcome to Desi Cart
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 animate-fade-in-up delay-500">
        Discover amazing products from local sellers.
      </p>
      <div className="mt-8 flex gap-4 animate-fade-in-up delay-500">
        <Link
          href="/shop"
          className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
        >
          Shop Now 🛍️
        </Link>
      </div>
    </div>
  );
}

