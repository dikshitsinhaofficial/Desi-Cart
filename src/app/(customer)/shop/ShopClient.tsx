'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, ShoppingBag, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Wallet from '../../components/Wallet';
import API from '@/lib/api';
import { useCart } from '@/lib/CartContext';
import { CATEGORIES } from '@/app/data/products';

import FilterSidebar from './components/FilterSidebar';
import ShopBanner from './components/ShopBanner';
import ProductGrid from './components/ProductGrid';
import CartDrawer from './components/CartDrawer';
import AIRecommendations from './components/AIRecommendations';

interface ShopProduct {
  uid: string;
  name: string;
  category: string;
  price: number;
  mrp: number;
  rating: number;
  reviews: number;
  image?: string;
}

// ── Toast Component ────────────────────────────────────────────
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-28 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold"
    >
      <span className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
        <Check size={14} strokeWidth={3} />
      </span>
      {message}
    </motion.div>
  );
}

export default function ShopClient() {
  const { addToCart, cartCount } = useCart();
  const searchParams = useSearchParams();

  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  const [apiProducts, setApiProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [timeLeft, setTimeLeft] = useState({ hours: 0, mins: 0, secs: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  // Read URL params from header search bar
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    const urlCategory = searchParams.get('category');
    setSearch(urlSearch || '');
    if (urlCategory && ['All', ...CATEGORIES].includes(urlCategory)) {
      setCategory(urlCategory);
    } else {
      setCategory('All');
    }
  }, [searchParams]);

  // Countdown timer
  useEffect(() => {
    const calcTime = () => {
      const now = new Date();
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const diff = end.getTime() - now.getTime();
      if (diff <= 0) return { hours: 0, mins: 0, secs: 0 };
      return {
        hours: Math.floor(diff / 3_600_000),
        mins:  Math.floor((diff % 3_600_000) / 60_000),
        secs:  Math.floor((diff % 60_000) / 1_000),
      };
    };
    setTimeLeft(calcTime());
    const id = setInterval(() => setTimeLeft(calcTime()), 1000);
    return () => clearInterval(id);
  }, []);

  const fetchWallet = async () => {
    try {
      const res = await fetch(`${API}/api/wallet`);
      if (res.ok) {
        const data = await res.json();
        setWalletBalance(data.balance);
      }
    } catch {}
  };

  useEffect(() => { fetchWallet(); }, []);

  // Fetch filtered products from API
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== 'All') params.set('category', category);
    if (search) params.set('search', search);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (selectedBrands.length > 0) params.set('brands', selectedBrands.join(','));

    fetch(`${API}/api/products?${params.toString()}`)
      .then(r => r.json())
      .then((data: any) => {
        // API returns { products, total, ... } OR a plain array (legacy)
        const rawProducts = Array.isArray(data) ? data : (data.products || []);
        const mapped: ShopProduct[] = rawProducts.map((p: any) => ({
          uid:      String(p._id || p.uid),
          name:     String(p.name),
          category: String(p.category),
          price:    Number(p.price),
          mrp:      Number(p.mrp) || Math.round(Number(p.price) * 1.3),
          rating:   Number(p.rating) || 0,
          reviews:  Number(p.reviews) || 0,
          image:    p.image ? String(p.image) : undefined,
        }));
        setApiProducts(mapped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, search, minPrice, maxPrice, selectedBrands]);

  // Client side sorting
  const sorted = useMemo(() => {
    let items = [...apiProducts];
    if (sortBy === 'price-low')  items.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') items.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating')     items.sort((a, b) => b.rating - a.rating);
    return items;
  }, [sortBy, apiProducts]);

  useEffect(() => setCurrentPage(1), [category, search, minPrice, maxPrice, selectedBrands]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sorted.slice(startIndex, startIndex + itemsPerPage);
  }, [sorted, currentPage]);

  const totalPages = Math.ceil(sorted.length / itemsPerPage);

  const handleAddToCart = (p: ShopProduct) => {
    addToCart({ id: p.uid, ...p });
    setToast(`${p.name.slice(0, 28)}${p.name.length > 28 ? '…' : ''} added!`);
  };

  const filterSidebarProps = { 
    category, setCategory, minPrice, setMinPrice, maxPrice, setMaxPrice, 
    selectedBrands, setSelectedBrands, totalCount: sorted.length 
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ShopBanner timeLeft={timeLeft} />
        
        {/* Only show AI recommendations on the main shop view without search/filters active */}
        {category === 'All' && !search && selectedBrands.length === 0 && !minPrice && !maxPrice && (
          <div className="mt-8">
            <AIRecommendations onAddToCart={handleAddToCart} />
          </div>
        )}

        {/* Mobile filter bar */}
        <div className="flex items-center justify-between mt-6 mb-4 lg:hidden">
          <p className="text-sm text-slate-500 font-medium">{sorted.length} products</p>
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-750 dark:text-slate-250 shadow-sm hover:border-orange-400 transition-all animate-fade-in"
          >
            <SlidersHorizontal size={16} className="text-orange-500" />
            Filters {(category !== 'All' || minPrice || maxPrice || selectedBrands.length > 0) && <span className="w-2 h-2 bg-orange-500 rounded-full ml-1" />}
          </button>
        </div>

        <div className="flex items-start gap-8 relative">
          {/* Desktop sidebar */}
          <FilterSidebar {...filterSidebarProps} />

          <ProductGrid
            products={paginatedProducts}
            totalFiltered={sorted.length}
            currentPage={currentPage}
            totalPages={totalPages}
            sortBy={sortBy}
            setSortBy={setSortBy}
            setCurrentPage={setCurrentPage}
            onAddToCart={handleAddToCart}
            loading={loading}
          />
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setShowMobileFilters(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10 shrink-0">
                <h3 className="font-bold text-slate-850 dark:text-white">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                  <X size={18} />
                </button>
              </div>
              
              <div className="p-3 flex-grow overflow-y-auto">
                <FilterSidebar {...filterSidebarProps} mobile />
              </div>
              
              <div className="sticky bottom-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-850 shrink-0">
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-orange-500/25"
                >
                  Show {sorted.length} Products
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <CartDrawer
        showCart={showCart}
        setShowCart={setShowCart}
        walletBalance={walletBalance}
        fetchWallet={fetchWallet}
      />

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        <Wallet balance={walletBalance} onUpdate={fetchWallet} />
        <button
          onClick={() => setShowCart(true)}
          className="w-14 h-14 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/40 hover:bg-orange-600 transition-all hover:scale-105 active:scale-95 relative"
        >
          <ShoppingBag size={24} />
          {cartCount > 0 && (
            <motion.span
              key={cartCount}
              initial={{ scale: 1.5 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-white text-orange-600 text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md border-2 border-orange-500"
            >
              {cartCount}
            </motion.span>
          )}
        </button>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      </AnimatePresence>
    </>
  );
}
