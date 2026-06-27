'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import HeaderSearchBar from './HeaderSearchBar';
import { useAuth } from '@/lib/AuthContext';
import { useCart } from '@/lib/CartContext';
import { useWishlist } from '@/lib/WishlistContext';
import { LogOut, User, LayoutDashboard, Store, Heart, Package } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const [showMenu, setShowMenu] = useState(false);

  // Set role cookie whenever user changes (used by middleware)
  useEffect(() => {
    if (user) {
      document.cookie = `desi-cart-role=${user.role}; path=/; max-age=86400; SameSite=Lax`;
    } else {
      document.cookie = 'desi-cart-role=; path=/; max-age=0';
    }
  }, [user]);

  if (pathname === '/' || pathname === '/login') return null;

  const handleLogout = async () => {
    await logout();
    setShowMenu(false);
    router.push('/');
  };

  const firstName = user?.displayName?.split(' ')[0] || 'Sign in';

  return (
    <header className="sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-slate-900 text-white flex items-center justify-between px-4 py-2 gap-4">
        {/* Logo */}
        <Link href="/" className="flex flex-col flex-shrink-0 items-start">
          <span className="text-xl font-bold leading-none tracking-tight">
            <span className="text-white">Desi</span>
            <span className="text-orange-500">Cart</span>
          </span>
          <span className="text-[10px] text-slate-300">Explore Plus ✨</span>
        </Link>

        {/* Search */}
        <HeaderSearchBar />

        {/* Right Menu */}
        <div className="flex items-center gap-5 text-sm font-semibold whitespace-nowrap">
          {/* Wishlist */}
          <Link href="/wishlist" className="relative group flex items-center gap-1 cursor-pointer">
            <Heart className="group-hover:text-red-500 transition-colors" size={20} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -left-2 bg-red-500 text-white text-[10px] font-bold px-1 py-0.5 rounded-full leading-none">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Account */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setShowMenu(p => !p)}
              className="flex flex-col cursor-pointer group text-left"
            >
              <span className="text-xs font-normal text-slate-300 leading-none">
                Hello, {firstName}
              </span>
              <span className="leading-none mt-1 flex items-center gap-0.5">
                Account &amp; Lists
                <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>

            {/* Dropdown */}
            {showMenu && (
              <div
                className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 z-50"
                onMouseLeave={() => setShowMenu(false)}
              >
                {user ? (
                  <>
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-800 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">{user.role}</span>
                    </div>
                    {user.role === 'admin' && (
                      <Link href="/admin" onClick={() => setShowMenu(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                        <LayoutDashboard size={15} /> Admin Dashboard
                      </Link>
                    )}
                    {user.role === 'seller' && (
                      <Link href="/seller" onClick={() => setShowMenu(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 border-t border-slate-100">
                        <Store size={15} /> Seller Portal
                      </Link>
                    )}
                    <Link href="/orders" onClick={() => setShowMenu(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 border-t border-slate-100">
                      <Package size={15} /> My Orders
                    </Link>
                    <Link href="/shop" onClick={() => setShowMenu(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                      <User size={15} /> My Profile
                    </Link>
                    <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50">
                      <LogOut size={15} /> Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setShowMenu(false)} className="block px-4 py-2.5 text-sm font-semibold text-center text-white bg-orange-500 hover:bg-orange-600 mx-3 rounded-lg my-1">
                      Sign In
                    </Link>
                    <p className="text-xs text-slate-500 text-center mb-2">
                      New customer?{' '}
                      <Link href="/login" className="text-orange-500 font-semibold hover:underline">Start here</Link>
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Returns & Orders */}
          <div className="hidden lg:flex flex-col cursor-pointer">
            <span className="text-xs font-normal text-slate-300 leading-none">Returns</span>
            <span className="leading-none mt-1">&amp; Orders</span>
          </div>

          {/* Cart */}
          <Link href="/shop" className="flex items-center gap-1 cursor-pointer group">
            <div className="relative">
              <svg className="w-8 h-8 text-white group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none group-hover:bg-white group-hover:text-orange-600 transition-colors min-w-[18px] text-center">
                {cartCount}
              </span>
            </div>
            <span className="hidden md:block mt-2">Cart</span>
          </Link>
        </div>
      </div>

      {/* Category Bar */}
      <div className="bg-slate-800 text-white px-4 py-1.5 flex items-center gap-6 overflow-x-auto whitespace-nowrap border-t border-slate-700 text-sm font-medium">
        <Link href="/shop" className="flex items-center gap-1 hover:text-orange-400 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          All
        </Link>
        <Link href="/shop" className="hover:text-orange-400 transition-colors">Today&apos;s Deals</Link>
        <Link href="/shop?category=Mobile+Phones" className="hover:text-orange-400 transition-colors">Mobiles</Link>
        <Link href="/shop?category=Laptops+%26+Accessories" className="hover:text-orange-400 transition-colors">Electronics</Link>
        <Link href="/shop?category=Men%27s+Clothing" className="hover:text-orange-400 transition-colors">Fashion</Link>
        <Link href="/shop?category=Food+%26+Groceries" className="hover:text-orange-400 transition-colors">Groceries</Link>
        <Link href="/shop?category=Home+Decor" className="hover:text-orange-400 transition-colors">Home</Link>
        <Link href="/shop?category=Beauty+%26+Personal+Care" className="hover:text-orange-400 transition-colors">Beauty</Link>
        <Link href="/shop?category=Books" className="hover:text-orange-400 transition-colors">Books</Link>
        <Link href="/shop?category=Toys+%26+Games" className="hover:text-orange-400 transition-colors">Toys</Link>
      </div>
    </header>
  );
}
