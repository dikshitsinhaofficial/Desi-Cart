'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import HeaderSearchBar from './HeaderSearchBar';

export default function Header() {
  const pathname = usePathname();

  // Do not show the header on the homepage
  if (pathname === '/') {
    return null;
  }

  return (
    <header className="sticky top-0 z-50">
      {/* Top Bar - Dark */}
      <div className="bg-slate-900 text-white flex items-center justify-between px-4 py-2 gap-4">
        {/* Logo */}
        <Link href="/" className="flex flex-col flex-shrink-0 items-start">
          <span className="text-xl font-bold leading-none tracking-tight">
            <span className="text-white">Desi</span>
            <span className="text-orange-500">Cart</span>
          </span>
          <span className="text-[10px] text-slate-300">Explore Plus ✨</span>
        </Link>
        
        {/* Search Bar - Center */}
        <HeaderSearchBar />

        {/* Right Menu */}
        <div className="flex items-center gap-6 text-sm font-semibold whitespace-nowrap">
          <div className="hidden lg:flex flex-col cursor-pointer group">
            <span className="text-xs font-normal text-slate-300 leading-none">Hello, Sign in</span>
            <span className="leading-none mt-1 flex items-center">
              Account & Lists{' '}
              <svg className="w-4 h-4 text-slate-400 group-hover:text-white ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
          
          <div className="hidden lg:flex flex-col cursor-pointer">
            <span className="text-xs font-normal text-slate-300 leading-none">Returns</span>
            <span className="leading-none mt-1">& Orders</span>
          </div>

          <Link href="/shop" className="flex items-center gap-1 cursor-pointer group">
            <div className="relative">
              <svg className="w-8 h-8 text-white group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none group-hover:bg-white group-hover:text-orange-600 transition-colors">0</span>
            </div>
            <span className="hidden md:block mt-2">Cart</span>
          </Link>
        </div>
      </div>
      
      {/* Mega Menu / Categories Bar */}
      <div className="bg-slate-800 text-white px-4 py-1.5 flex items-center gap-6 overflow-x-auto whitespace-nowrap scrollbar-hide border-t border-slate-700 text-sm font-medium">
        <Link href="/shop" className="flex items-center gap-1 hover:text-orange-400 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          All
        </Link>
        <Link href="/shop" className="hover:text-orange-400 transition-colors">Today&apos;s Deals</Link>
        <Link href="/shop?category=Electronics" className="hover:text-orange-400 transition-colors">Electronics</Link>
        <Link href="/shop?category=Electronics" className="hover:text-orange-400 transition-colors">Mobiles</Link>
        <Link href="/shop?category=Clothing" className="hover:text-orange-400 transition-colors">Fashion</Link>
        <Link href="/shop?category=Groceries" className="hover:text-orange-400 transition-colors">Home &amp; Kitchen</Link>
        <Link href="/shop?category=Groceries" className="hover:text-orange-400 transition-colors">Groceries</Link>
        <Link href="/shop" className="hover:text-orange-400 transition-colors">Customer Service</Link>
      </div>
    </header>
  );
}
