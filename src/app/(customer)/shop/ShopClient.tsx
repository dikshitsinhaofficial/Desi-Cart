'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Wallet from '../../components/Wallet';
import API from '@/lib/api';
import { useCart } from '@/lib/CartContext';
import { CATEGORIES } from '@/app/data/products';

import FilterSidebar from './components/FilterSidebar';
import ShopBanner from './components/ShopBanner';
import ProductGrid from './components/ProductGrid';
import CartDrawer from './components/CartDrawer';
import { ShoppingBag } from 'lucide-react';

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

export default function ShopClient() {
  const { addToCart, cartCount } = useCart();
  const searchParams = useSearchParams();

  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [sliderMaxPrice, setSliderMaxPrice] = useState(100000);
  
  const [apiProducts, setApiProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  
  const [timeLeft, setTimeLeft] = useState({ hours: 0, mins: 0, secs: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  useEffect(() => {
    const urlSearch = searchParams.get('search');
    const urlCategory = searchParams.get('category');
    if (urlSearch) setSearch(urlSearch);
    if (urlCategory && ['All', ...CATEGORIES].includes(urlCategory)) setCategory(urlCategory);
  }, [searchParams]);

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

  useEffect(() => {
    fetchWallet();
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/api/products`)
      .then(r => r.json())
      .then((data: Array<any>) => {
        const mapped: ShopProduct[] = data.map(p => ({
          uid:      String(p._id),
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
  }, []);

  const filtered = useMemo(() => {
    let items = [...apiProducts];
    if (category !== 'All') items = items.filter(p => p.category === category);
    if (search) items = items.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    items = items.filter(p => p.price <= sliderMaxPrice);

    if (sortBy === 'price-low')  items.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') items.sort((a, b) => b.price - a.price);
    return items;
  }, [category, search, sortBy, sliderMaxPrice, apiProducts]);

  useEffect(() => setCurrentPage(1), [category, search, sliderMaxPrice]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const handleAddToCart = (p: ShopProduct) => {
    addToCart({ id: p.uid, ...p });
    // Keep internal showCart if you want drawer to open on add, else just leave it
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ShopBanner timeLeft={timeLeft} />

        <div className="flex items-start gap-8 mt-8 relative">
          <FilterSidebar
            category={category}
            setCategory={setCategory}
            sliderMaxPrice={sliderMaxPrice}
            setSliderMaxPrice={setSliderMaxPrice}
            totalCount={filtered.length}
          />
          
          <ProductGrid
            products={paginatedProducts}
            totalFiltered={filtered.length}
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
            <span className="absolute -top-2 -right-2 bg-white text-orange-600 text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md border-2 border-orange-500">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </>
  );
}
