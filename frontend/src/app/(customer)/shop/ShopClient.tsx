'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  X,
  ChevronRight,
  CreditCard,
  Wallet as WalletIcon,
  Truck,
  CheckCircle2,
  Trash2,
  Plus,
  Minus,
  Search,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  ShoppingBag as CartIcon,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Wallet from '../../components/Wallet';
import API from '../../../lib/api';

// ── Types ──────────────────────────────────────────────────────────────────
interface ShopProduct {
  uid: string;
  name: string;
  category: string;
  price: number;
  mrp: number;
  rating: number;
  reviews: number;
  image?: string;
  color: string;
  badge?: string;
}

interface CartEntry {
  product: ShopProduct;
  qty: number;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// ── Static data ────────────────────────────────────────────────────────────
const EMOJI_MAP: Record<string, string> = {
  Electronics: '📱', Fitness: '🏋️‍♂️', Groceries: '🌾', Food: '🍲', Clothing: '👕', default: '📦',
};

const COLOR_MAP: Record<string, string> = {
  Electronics: 'from-blue-500/20 to-indigo-600/20', Fitness: 'from-teal-400/20 to-emerald-600/20',
  Groceries: 'from-green-400/20 to-emerald-500/20', Food: 'from-amber-400/20 to-yellow-500/20',
  Clothing: 'from-pink-400/20 to-rose-500/20', default: 'from-gray-500/20 to-gray-700/20',
};

import { CATEGORIES, STATIC_PRODUCTS } from '../../data/products';
const disc = (p: number, m: number) => Math.round((1 - p / m) * 100);

export default function ShopClient() {
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [toast, setToast] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [apiProducts, setApiProducts] = useState<ShopProduct[]>([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, mins: 0, secs: 0 });
  const [sliderMaxPrice, setSliderMaxPrice] = useState(100000);
  const [showFloatingFilter, setShowFloatingFilter] = useState(false);

  // ── Read URL search params from header search ─────────────────────────
  const searchParams = useSearchParams();
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    const urlCategory = searchParams.get('category');
    if (urlSearch) setSearch(urlSearch);
    if (urlCategory && ['All', ...CATEGORIES].includes(urlCategory)) setCategory(urlCategory);
  }, [searchParams]);

  // ── Pagination State ──────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  // ── Checkout Stepper States ──────────────────────────────────────────────
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'payment' | 'success'>('cart');
  const [addressName, setAddressName] = useState('');
  const [addressPhone, setAddressPhone] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressZip, setAddressZip] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'razorpay' | 'cod'>('wallet');
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [formError, setFormError] = useState('');
  const [completedOrder, setCompletedOrder] = useState<{
    orderId: string;
    items: CartEntry[];
    total: number;
    shipping: number;
    address: { name: string; phone: string; street: string; city: string; zip: string };
    paymentMethod: string;
    date: string;
  } | null>(null);

  // ── Real countdown to midnight ────────────────────────────────────────
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

  // ── Fetch seller-added products ───────────────────────────────────────
  useEffect(() => {
    fetch(`${API}/api/products`)
      .then(r => r.json())
      .then((data: Array<Record<string, unknown>>) => {
        const mapped: ShopProduct[] = data.map(p => ({
          uid:      String(p._id),
          name:     String(p.name),
          category: String(p.category),
          price:    Number(p.price),
          mrp:      Number(p.mrp) || Math.round(Number(p.price) * 1.3),
          rating:   Number(p.rating) || 0,
          reviews:  Number(p.reviews) || 0,
          image:    p.image ? String(p.image) : undefined,
          color:    COLOR_MAP[String(p.category)] ?? COLOR_MAP.default,
          badge:    'New Arrival',
        }));
        setApiProducts(mapped);
      })
      .catch(() => {}); // backend offline — static products still show
  }, []);

  // ── Fetch Wallet Balance ───────────────────────────────────────────────
  const fetchWallet = async () => {
    try {
      const res = await fetch(`${API}/api/wallet`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setWalletBalance(data.balance);
    } catch (err) {
      console.error('Failed to fetch wallet balance', err);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const allProducts = [...apiProducts, ...STATIC_PRODUCTS];

  const filtered = useMemo(() => {
    let items = [...allProducts];
    if (category !== 'All') items = items.filter(p => p.category === category);
    if (search) items = items.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    
    // Filter by price slider
    items = items.filter(p => p.price <= sliderMaxPrice);

    if (sortBy === 'price-low')  items.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') items.sort((a, b) => b.price - a.price);
    return items;
  }, [category, search, sortBy, sliderMaxPrice, allProducts]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [category, search, sliderMaxPrice]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  // ── Cart helpers ──────────────────────────────────────────────────────
  const cartSubtotal = cart.reduce((sum, e) => sum + e.product.price * e.qty, 0);
  const shippingFee = cartSubtotal > 1000 ? 0 : 49;
  const cartTotal = cartSubtotal + shippingFee;
  const cartCount = cart.reduce((sum, e) => sum + e.qty, 0);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const addToCart = (product: ShopProduct) => {
    setCart(prev => {
      const existing = prev.find(e => e.product.uid === product.uid);
      if (existing) {
        return prev.map(e =>
          e.product.uid === product.uid ? { ...e, qty: e.qty + 1 } : e
        );
      }
      return [...prev, { product, qty: 1 }];
    });
    showToast(`${product.name} added!`);
  };

  const removeFromCart = (uid: string) =>
    setCart(prev => prev.filter(e => e.product.uid !== uid));

  const updateQty = (uid: string, delta: number) =>
    setCart(prev =>
      prev.map(e =>
        e.product.uid === uid ? { ...e, qty: Math.max(1, e.qty + delta) } : e
      )
    );

  // ── Checkout Form Validation ──────────────────────────────────────────
  const validateDetails = () => {
    if (!addressName || !addressPhone || !addressStreet || !addressCity || !addressZip) {
      setFormError('Please fill out all delivery fields.');
      return false;
    }
    if (addressPhone.length < 10) {
      setFormError('Please enter a valid phone number.');
      return false;
    }
    setFormError('');
    return true;
  };

  // ── Checkout Form Submission ──────────────────────────────────────────
  const handleCheckoutSubmit = async () => {
    if (cartTotal === 0) return;
    setCheckoutLoading(true);

    const addressObj = {
      name: addressName,
      phone: addressPhone,
      street: addressStreet,
      city: addressCity,
      zip: addressZip,
    };

    if (paymentMethod === 'cod') {
      // Simulate COD Success
      setTimeout(() => {
        fireSuccessConfetti();
        setCompletedOrder({
          orderId: `DC-${Math.floor(100000 + Math.random() * 900000)}`,
          items: [...cart],
          total: cartTotal,
          shipping: shippingFee,
          address: addressObj,
          paymentMethod: 'Cash on Delivery (COD)',
          date: new Date().toLocaleDateString('en-IN', { dateStyle: 'long' }),
        });
        setCart([]);
        setCheckoutStep('success');
        setCheckoutLoading(false);
      }, 1200);

    } else if (paymentMethod === 'wallet') {
      // Pay via Wallet API
      try {
        const walletRes = await fetch(`${API}/api/checkout/pay-with-wallet`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: cartTotal }),
        });
        const walletData = await walletRes.json();

        if (!walletData.success) {
          showToast(walletData.message || 'Wallet transaction failed.');
          setCheckoutLoading(false);
          return;
        }

        // Wallet checkout success!
        fireSuccessConfetti();
        setCompletedOrder({
          orderId: `DC-${Math.floor(100000 + Math.random() * 900000)}`,
          items: [...cart],
          total: cartTotal,
          shipping: shippingFee,
          address: addressObj,
          paymentMethod: 'Desi Cart Wallet',
          date: new Date().toLocaleDateString('en-IN', { dateStyle: 'long' }),
        });
        // Sync wallet balances
        fetchWallet();
        window.dispatchEvent(new Event('wallet-update'));

        setCart([]);
        setCheckoutStep('success');
      } catch (err) {
        console.error(err);
        showToast('Wallet payment error. Please try again.');
      } finally {
        setCheckoutLoading(false);
      }

    } else if (paymentMethod === 'razorpay') {
      // Pay via Razorpay
      try {
        const orderRes = await fetch(`${API}/api/checkout/create-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: cartTotal }),
        });
        const orderData = await orderRes.json();

        if (orderData.error) {
          showToast('Please add real Razorpay Keys in backend/.env to process payments.');
          setCheckoutLoading(false);
          return;
        }

        const options = {
          key: orderData.key_id || 'rzp_test_placeholder',
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Desi Cart',
          description: 'Complete your purchase',
          image: '/logo.png',
          order_id: orderData.id,
          prefill: { 
            name: addressName, 
            email: 'user@desicart.com', 
            contact: addressPhone 
          },
          theme: { color: '#f97316' },
          handler: async (response: RazorpayResponse) => {
            const verifyRes = await fetch(`${API}/api/checkout/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id:  response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                amount: cartTotal
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              fireSuccessConfetti();
              setCompletedOrder({
                orderId: response.razorpay_order_id || `DC-${Math.floor(100000 + Math.random() * 900000)}`,
                items: [...cart],
                total: cartTotal,
                shipping: shippingFee,
                address: addressObj,
                paymentMethod: 'Razorpay (Card/UPI)',
                date: new Date().toLocaleDateString('en-IN', { dateStyle: 'long' }),
              });
              
              // Sync wallet balances
              fetchWallet();
              window.dispatchEvent(new Event('wallet-update'));

              setCart([]);
              setCheckoutStep('success');
            }
          },
        };
        const rzp = new (window as Window & { Razorpay: new (o: object) => { open: () => void } }).Razorpay(options);
        rzp.open();
      } catch (err) {
        console.error(err);
        showToast('Payment Failed. Try again.');
      } finally {
        setCheckoutLoading(false);
      }
    }
  };

  const fireSuccessConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#f97316', '#e11d48', '#fbbf24', '#ffffff'],
    });
  };

  const handleCloseCart = () => {
    if (checkoutStep !== 'success') {
      setShowCart(false);
    }
  };

  const resetCheckout = () => {
    setCheckoutStep('cart');
    setShowCart(false);
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative overflow-x-hidden font-sans">
      
      {/* ── Floating Glow Blobs (Background Aesthetic) ── */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-orange-300/10 dark:bg-orange-950/20 rounded-full blur-[100px] pointer-events-none z-0 animate-float-slow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-rose-300/10 dark:bg-pink-950/10 rounded-full blur-[120px] pointer-events-none z-0 animate-float-reverse" />

      {/* ── Shop Toolbar ── */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100 dark:border-gray-800 transition-colors shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          
          {/* Search bar */}
          <div className="flex w-full order-last md:order-none md:flex-1 md:max-w-lg relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search products, categories..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 rounded-full border border-transparent focus:border-orange-500/50 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all shadow-inner"
            />
          </div>

          <div className="flex items-center gap-3 w-full justify-between md:w-auto">
            {/* Wallet */}
            <Wallet />

            {/* Cart trigger */}
            <button
              onClick={() => {
                if (checkoutStep === 'success') setCheckoutStep('cart');
                setShowCart(!showCart);
              }}
              className="relative p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 dark:hover:text-white transition-all rounded-full shadow-sm active:scale-95"
            >
              <CartIcon size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Category Strip ── */}
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 py-2 sticky top-[136px] md:top-[69px] z-30 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex gap-2 overflow-x-auto py-1 scrollbar-hide">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`whitespace-nowrap px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 active:scale-95 ${
                category === c
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {EMOJI_MAP[c] || '📦'} {c}
            </button>
          ))}
        </div>
      </div>

      {/* ── Hero Banner with real countdown ── */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="relative bg-gradient-to-r from-orange-500 via-rose-500 to-pink-600 rounded-3xl overflow-hidden shadow-xl shadow-orange-500/10">
          {/* Background patterns */}
          <div className="absolute inset-0 bg-grid-white/[0.1] pointer-events-none" />
          <div className="absolute -right-10 -top-10 w-44 h-44 bg-white/10 rounded-full blur-2xl" />
          
          <div className="relative px-6 py-12 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6 z-10">
            <div className="text-white space-y-4 max-w-md">
              <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <Sparkles size={12} className="animate-spin" /> Limited Deal of the Day
              </span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none">Desi Mega Sale!</h2>
              <p className="text-white/90 text-sm md:text-base font-medium">
                Get up to 70% off on all clothing, daily use items, and premium local crafts.
              </p>
            </div>
            
            {/* Timer card */}
            <div className="bg-slate-950/30 backdrop-blur-md border border-white/20 rounded-2xl p-4 md:p-6 text-white text-center min-w-[280px]">
              <p className="text-xs font-bold text-orange-200 uppercase tracking-widest mb-3">Ends In</p>
              <div className="flex justify-center gap-3">
                {[
                  [String(timeLeft.hours).padStart(2, '0'), 'Hrs'],
                  [String(timeLeft.mins).padStart(2, '0'),  'Mins'],
                  [String(timeLeft.secs).padStart(2, '0'),  'Secs'],
                ].map(([val, label]) => (
                  <div key={label} className="bg-white/15 rounded-xl px-3 py-2 text-center min-w-[60px] border border-white/5 shadow-inner">
                    <div className="text-2xl md:text-3xl font-black tabular-nums">{val}</div>
                    <div className="text-[10px] text-white/70 uppercase font-bold mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Shop Content ── */}
      <div className="max-w-[1500px] mx-auto px-4 py-8 relative z-10 flex gap-6">
        
        {/* Left Sidebar Filters (Amazon Style) */}
        <aside className={`w-full md:w-64 shrink-0 ${showMobileFilters ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 sticky top-32 rounded-2xl shadow-sm">
            
            {/* Header with Clear button */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white">Filters</span>
              {(category !== 'All' || sliderMaxPrice !== 100000 || search !== '') && (
                <button 
                  onClick={() => {
                    setCategory('All');
                    setSliderMaxPrice(100000);
                    setSearch('');
                  }}
                  className="text-xs text-orange-500 hover:text-orange-600 dark:text-orange-400 font-bold hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            <h3 className="font-bold mb-3 text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider">Categories</h3>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 mb-6">
              {['All', ...CATEGORIES].map(c => (
                <li key={c}>
                  <button 
                    onClick={() => setCategory(c)}
                    className={`text-left w-full hover:text-orange-500 dark:hover:text-orange-400 transition-colors ${category === c ? 'font-bold text-orange-600 dark:text-orange-400' : ''}`}
                  >
                    {c}
                  </button>
                </li>
              ))}
            </ul>

            <h3 className="font-bold mb-3 text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider">Price Range</h3>
            <div className="mb-2">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                <span>₹0</span>
                <span className="font-bold text-orange-600 dark:text-orange-400">Up to ₹{sliderMaxPrice.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="100" 
                max="100000" 
                step="500"
                value={sliderMaxPrice} 
                onChange={(e) => setSliderMaxPrice(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between mt-2">
                <button 
                  onClick={() => setSliderMaxPrice(1000)} 
                  className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  ₹1k
                </button>
                <button 
                  onClick={() => setSliderMaxPrice(5000)} 
                  className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  ₹5k
                </button>
                <button 
                  onClick={() => setSliderMaxPrice(20000)} 
                  className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  ₹20k
                </button>
                <button 
                  onClick={() => setSliderMaxPrice(100000)} 
                  className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Max
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Product Grid */}
        <main className="flex-1 min-w-0">
          
          {/* Sorting bar & Mobile Filter Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 shadow-sm rounded-2xl">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="md:hidden text-slate-700 dark:text-slate-300 font-bold border border-slate-300 dark:border-slate-800 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center gap-2"
              >
                Filters {showMobileFilters ? '▲' : '▼'}
              </button>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                Showing <span className="font-bold text-slate-900 dark:text-white">{filtered.length}</span> results
                {category !== 'All' && <> for <span className="text-orange-600 dark:text-orange-400 font-bold">&quot;{category}&quot;</span></>}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="text-sm border border-slate-300 dark:border-slate-800 rounded-lg px-2 py-1 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:border-orange-500 outline-none cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <p className="text-lg font-bold text-slate-700 dark:text-slate-300">No results for {search || category}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Try checking your spelling or use more general terms</p>
            </div>
          ) : (
            <>
              <motion.div 
                layout
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              >
                {paginatedProducts.map(p => {
                  const inCart = cart.find(e => e.product.uid === p.uid);
                  return (
                    <motion.div
                      layout
                      key={p.uid}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                    >
                      {/* Badges */}
                      {p.badge && (
                        <span className="absolute top-0 left-0 bg-[#C45500] text-white text-[10px] font-bold px-2.5 py-1 z-10 rounded-br-lg">
                          {p.badge}
                        </span>
                      )}

                      {/* Image Box */}
                      <div className="h-48 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-center p-4 relative overflow-hidden transition-all duration-300 group-hover:bg-slate-100/80 dark:group-hover:bg-slate-950/80">
                        {p.image ? (
                          <Image 
                            src={p.image} 
                            alt={p.name} 
                            width={200} 
                            height={200} 
                            className="object-contain w-full h-full dark:mix-blend-normal mix-blend-multiply" 
                          />
                        ) : (
                          <span className="text-6xl select-none z-10 filter drop-shadow-md">
                            {EMOJI_MAP[p.category] ?? EMOJI_MAP.default}
                          </span>
                        )}
                      </div>
                      
                      {/* Info details */}
                      <div className="p-3 flex flex-col flex-1">
                        <h3 className="text-sm text-slate-800 dark:text-slate-200 hover:text-orange-500 dark:hover:text-orange-400 cursor-pointer font-semibold leading-snug mb-2 line-clamp-2 transition-colors">
                          {p.name}
                        </h3>
                        
                        <div className="flex items-baseline gap-1.5 mb-1 mt-auto">
                          <span className="text-xl font-bold text-slate-900 dark:text-white">₹{p.price.toLocaleString()}</span>
                          {p.mrp > p.price && (
                            <span className="text-xs text-slate-500 dark:text-slate-400 line-through">M.R.P: ₹{p.mrp.toLocaleString()}</span>
                          )}
                        </div>
                        
                        <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 mb-3">Get it by Tomorrow</p>

                        <button
                          onClick={() => addToCart(p)}
                          className={`w-full text-sm py-2 rounded-xl transition-colors cursor-pointer border font-bold ${
                            inCart
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-800 dark:text-emerald-300'
                              : 'bg-[#FFD814] border-[#FCD200] hover:bg-[#F7CA00] text-[#0F1111] dark:text-slate-950'
                          }`}
                        >
                          {inCart ? `Added (${inCart.qty})` : 'Add to cart'}
                        </button>
                      </div>
                    </motion.div>
                );
              })}
            </motion.div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8 mb-4">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:cursor-not-allowed cursor-pointer"
                >
                  Previous
                </button>
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Page <strong className="text-slate-900 dark:text-white">{currentPage}</strong> of <strong className="text-slate-900 dark:text-white">{totalPages}</strong>
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:cursor-not-allowed cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
      </div>

      {/* ── Cart Sidebar Drawer (AnimatePresence) ── */}
      <AnimatePresence>
        {showCart && (
          <div className="fixed inset-0 z-50 flex justify-end">
            
            {/* Blur Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseCart}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs cursor-pointer"
            />
            
            {/* Sidebar Box */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-10 border-l border-slate-100 dark:border-slate-800/80 transition-colors"
            >
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  {checkoutStep !== 'cart' && checkoutStep !== 'success' && (
                    <button
                      onClick={() => {
                        if (checkoutStep === 'details') setCheckoutStep('cart');
                        if (checkoutStep === 'payment') setCheckoutStep('details');
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <ArrowLeft size={20} />
                    </button>
                  )}
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    {checkoutStep === 'cart' && '🛒 Shopping Cart'}
                    {checkoutStep === 'details' && '📍 Shipping details'}
                    {checkoutStep === 'payment' && '💳 Choose Payment'}
                    {checkoutStep === 'success' && '🎉 Order Placed!'}
                  </h2>
                </div>
                
                <button
                  onClick={resetCheckout}
                  className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* ── Stepper progress indicator ── */}
              {checkoutStep !== 'success' && (
                <div className="bg-slate-50 dark:bg-slate-950 px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs font-semibold text-slate-400 transition-colors">
                  <span className={checkoutStep === 'cart' ? 'text-orange-500 font-bold' : 'text-emerald-500 font-bold'}>
                    1. Cart {checkoutStep !== 'cart' && '✓'}
                  </span>
                  <ChevronRight size={14} className="text-slate-300" />
                  <span className={
                    checkoutStep === 'details' ? 'text-orange-500 font-bold' : 
                    checkoutStep === 'payment' ? 'text-emerald-500 font-bold' : 'text-slate-400'
                  }>
                    2. Shipping {checkoutStep === 'payment' && '✓'}
                  </span>
                  <ChevronRight size={14} className="text-slate-300" />
                  <span className={checkoutStep === 'payment' ? 'text-orange-500 font-bold' : 'text-slate-400'}>
                    3. Payment
                  </span>
                </div>
              )}

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
                
                {/* ── STEP 1: CART LIST ── */}
                {checkoutStep === 'cart' && (
                  <div className="space-y-4 h-full flex flex-col">
                    {cart.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-slate-400 flex-1">
                        <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                          <ShoppingBag size={48} className="text-slate-300" />
                        </div>
                        <p className="font-bold text-slate-700 dark:text-slate-350">Your cart is empty</p>
                        <p className="text-xs text-slate-500 mt-1">Add items from the store to start checkout.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 flex-1">
                        <AnimatePresence initial={false}>
                          {cart.map(entry => (
                            <motion.div
                              layout
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              key={entry.product.uid}
                              className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3.5 border border-slate-100 dark:border-slate-800"
                            >
                              <div className={`w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0 overflow-hidden relative border border-slate-200/20`}>
                                {entry.product.image ? (
                                  <Image src={entry.product.image} alt={entry.product.name} width={56} height={56} className="object-cover w-full h-full" />
                                ) : (
                                  <span className="text-3xl">{EMOJI_MAP[entry.product.category] ?? '📦'}</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{entry.product.name}</p>
                                <p className="text-xs text-orange-500 font-extrabold mt-0.5">₹{entry.product.price.toLocaleString()}</p>
                                
                                {/* Quantity controls */}
                                <div className="flex items-center gap-2 mt-2">
                                  <button
                                    onClick={() => updateQty(entry.product.uid, -1)}
                                    className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white text-xs font-bold flex items-center justify-center hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 transition-colors"
                                  >−</button>
                                  <span className="text-xs font-black text-slate-850 dark:text-white w-4 text-center">{entry.qty}</span>
                                  <button
                                    onClick={() => updateQty(entry.product.uid, 1)}
                                    className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white text-xs font-bold flex items-center justify-center hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 transition-colors"
                                  >+</button>
                                  
                                  <button
                                    onClick={() => removeFromCart(entry.product.uid)}
                                    className="ml-auto text-slate-400 hover:text-rose-500 p-1 rounded-lg transition-colors"
                                    title="Remove"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                )}

                {/* ── STEP 2: SHIPPING ADDRESS ── */}
                {checkoutStep === 'details' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-semibold">
                      Please enter your shipping address details.
                    </p>
                    
                    {formError && (
                      <div className="bg-red-500/10 text-red-500 border border-red-500/20 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
                        <AlertCircle size={16} />
                        <span>{formError}</span>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                        <input
                          type="text"
                          value={addressName}
                          onChange={e => setAddressName(e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-3 text-sm focus:border-orange-500 dark:text-white outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                        <input
                          type="tel"
                          value={addressPhone}
                          onChange={e => setAddressPhone(e.target.value)}
                          placeholder="e.g. 9876543210"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-3 text-sm focus:border-orange-500 dark:text-white outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Street Address</label>
                        <textarea
                          rows={2}
                          value={addressStreet}
                          onChange={e => setAddressStreet(e.target.value)}
                          placeholder="e.g. Flat 402, Block B, Silver Heights"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-3 text-sm focus:border-orange-500 dark:text-white outline-none transition-colors resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">City</label>
                          <input
                            type="text"
                            value={addressCity}
                            onChange={e => setAddressCity(e.target.value)}
                            placeholder="e.g. Mumbai"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-3 text-sm focus:border-orange-500 dark:text-white outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Postal Code</label>
                          <input
                            type="number"
                            value={addressZip}
                            onChange={e => setAddressZip(e.target.value)}
                            placeholder="e.g. 400001"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-3 text-sm focus:border-orange-500 dark:text-white outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 3: PAYMENT METHOD ── */}
                {checkoutStep === 'payment' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-semibold">
                      Select your preferred payment method.
                    </p>

                    <div className="space-y-3">
                      
                      {/* Wallet Option */}
                      <button
                        onClick={() => setPaymentMethod('wallet')}
                        disabled={walletBalance !== null && walletBalance < cartTotal}
                        className={`w-full flex items-start gap-4 p-4 rounded-2xl border text-left transition-all ${
                          paymentMethod === 'wallet'
                            ? 'bg-orange-500/5 border-orange-500 ring-2 ring-orange-500/10'
                            : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <div className={`p-2.5 rounded-xl ${paymentMethod === 'wallet' ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-300'}`}>
                          <WalletIcon size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">Desi Cart Wallet</p>
                          <p className="text-xs text-slate-450 dark:text-slate-400 mt-0.5">
                            Pay instantly using your wallet funds.
                          </p>
                          {walletBalance !== null && (
                            <p className={`text-xs font-black mt-1.5 ${walletBalance >= cartTotal ? 'text-emerald-500' : 'text-rose-500'}`}>
                              Available Balance: ₹{walletBalance.toLocaleString()} 
                              {walletBalance < cartTotal && ' (Insufficient Funds)'}
                            </p>
                          )}
                        </div>
                      </button>

                      {/* Razorpay Option */}
                      <button
                        onClick={() => setPaymentMethod('razorpay')}
                        className={`w-full flex items-start gap-4 p-4 rounded-2xl border text-left transition-all ${
                          paymentMethod === 'razorpay'
                            ? 'bg-orange-500/5 border-orange-500 ring-2 ring-orange-500/10'
                            : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className={`p-2.5 rounded-xl ${paymentMethod === 'razorpay' ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-300'}`}>
                          <CreditCard size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">Razorpay Secure</p>
                          <p className="text-xs text-slate-455 dark:text-slate-400 mt-0.5 animate-pulse text-orange-500">
                            Cards, Net Banking, UPI (Google Pay, PhonePe)
                          </p>
                        </div>
                      </button>

                      {/* Cash on Delivery */}
                      <button
                        onClick={() => setPaymentMethod('cod')}
                        className={`w-full flex items-start gap-4 p-4 rounded-2xl border text-left transition-all ${
                          paymentMethod === 'cod'
                            ? 'bg-orange-500/5 border-orange-500 ring-2 ring-orange-500/10'
                            : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className={`p-2.5 rounded-xl ${paymentMethod === 'cod' ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-300'}`}>
                          <Truck size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">Cash on Delivery (COD)</p>
                          <p className="text-xs text-slate-450 dark:text-slate-400 mt-0.5">
                            Pay in cash when package arrives at your home.
                          </p>
                        </div>
                      </button>

                    </div>
                  </div>
                )}

                {/* ── STEP 4: SUCCESS CONFIRMATION ── */}
                {checkoutStep === 'success' && completedOrder && (
                  <div className="space-y-6 py-6 text-center">
                    <div className="flex justify-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                        transition={{ type: 'spring', duration: 0.6 }}
                        className="text-emerald-500 bg-emerald-500/10 p-5 rounded-full border border-emerald-500/20 shadow-lg shadow-emerald-500/5"
                      >
                        <CheckCircle2 size={56} />
                      </motion.div>
                    </div>
        <div className="space-y-2">
                      <h3 className="text-xl font-black text-slate-905 dark:text-white">Purchase Successful!</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Order ID: <span className="font-bold text-slate-850 dark:text-slate-200">{completedOrder.orderId}</span>
                      </p>
                    </div>

                    {/* Order Details list */}
                    <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 text-left border border-slate-100 dark:border-slate-800 text-xs space-y-3.5 transition-colors">
                      <div className="flex justify-between border-b border-slate-200/50 dark:border-slate-800 pb-2">
                        <span className="text-slate-500 font-bold">Estimated Delivery:</span>
                        <span className="font-extrabold text-orange-500">In 3-5 Business Days</span>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-slate-500 font-bold">Shipping Address:</p>
                        <p className="font-semibold text-slate-850 dark:text-slate-200">{completedOrder.address.name}</p>
                        <p className="text-slate-600 dark:text-slate-400">{completedOrder.address.street}, {completedOrder.address.city} - {completedOrder.address.zip}</p>
                        <p className="text-slate-600 dark:text-slate-400">Phone: {completedOrder.address.phone}</p>
                      </div>

                      <div className="flex justify-between border-t border-slate-200/50 dark:border-slate-800 pt-2.5">
                        <span className="text-slate-500 font-bold">Paid via:</span>
                        <span className="font-extrabold text-slate-850 dark:text-slate-200">{completedOrder.paymentMethod}</span>
                      </div>

                      <div className="flex justify-between text-sm font-black border-t border-slate-200/50 dark:border-slate-800 pt-2.5">
                        <span className="text-slate-900 dark:text-white">Paid Amount:</span>
                        <span className="text-orange-500 text-base">₹{completedOrder.total.toLocaleString()}</span>
                      </div>
                    </div>

                    <button
                      onClick={resetCheckout}
                      className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-bold py-3.5 rounded-2xl transition-all shadow-md active:scale-95 text-xs tracking-wider uppercase"
                    >
                      Continue Shopping
                    </button>
                  </div>
                )}

              </div>

              {/* Drawer Footer (Subtotal / Continue Buttons) */}
              {checkoutStep !== 'success' && cart.length > 0 && (
                <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
                  
                  {/* Summary Rows */}
                  <div className="space-y-2 mb-4 text-xs">
                    <div className="flex justify-between text-slate-500 dark:text-slate-400 font-semibold">
                      <span>Items Subtotal</span>
                      <span>₹{cartSubtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 dark:text-slate-400 font-semibold">
                      <span>Shipping Fee</span>
                      <span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200/50 dark:border-slate-800">
                      <span>Total Amount</span>
                      <span className="text-orange-500 text-lg font-black">₹{cartTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {checkoutStep === 'cart' && (
                    <button
                      onClick={() => setCheckoutStep('details')}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer shadow-lg shadow-orange-500/20 text-xs uppercase tracking-wider"
                    >
                      Checkout Securely <ChevronRight size={16} />
                    </button>
                  )}

                  {checkoutStep === 'details' && (
                    <button
                      onClick={() => {
                        if (validateDetails()) setCheckoutStep('payment');
                      }}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer shadow-lg shadow-orange-500/20 text-xs uppercase tracking-wider"
                    >
                      Continue to Payment <ChevronRight size={16} />
                    </button>
                  )}

                  {checkoutStep === 'payment' && (
                    <button
                      onClick={handleCheckoutSubmit}
                      disabled={checkoutLoading}
                      className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer shadow-lg shadow-orange-500/20 text-xs uppercase tracking-wider"
                    >
                      {checkoutLoading && (
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      )}
                      {checkoutLoading ? 'Processing Order...' : `Pay ₹${cartTotal.toLocaleString()} & Place Order`}
                    </button>
                  )}

                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Filter Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setShowFloatingFilter(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 active:scale-95 transition-all cursor-pointer text-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Quick Filter
        </button>
      </div>

      {/* Floating Filter Panel overlay */}
      <AnimatePresence>
        {showFloatingFilter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFloatingFilter(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs cursor-pointer"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl z-10 text-slate-800 dark:text-slate-100 flex flex-col gap-6"
            >
              <button
                onClick={() => setShowFloatingFilter(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </button>

              <div>
                <h3 className="text-xl font-extrabold bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent mb-1">
                  Filters &amp; Settings
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Refine your shopping feed instantly.</p>
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-sm font-bold mb-3 text-slate-700 dark:text-slate-300">
                  Select Category
                </label>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                  {['All', ...CATEGORIES].map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                        category === c
                          ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Slider */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Max Price Limit
                  </label>
                  <span className="text-sm font-black text-orange-600 dark:text-orange-400">
                    ₹{sliderMaxPrice.toLocaleString()}
                  </span>
                </div>
                
                <input
                  type="range"
                  min="100"
                  max="100000"
                  step="500"
                  value={sliderMaxPrice}
                  onChange={(e) => setSliderMaxPrice(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500 mb-3"
                />
                
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Min: ₹100</span>
                  <span>Max: ₹100,000+</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => {
                    setCategory('All');
                    setSliderMaxPrice(100000);
                  }}
                  className="flex-1 py-3 text-sm font-bold rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowFloatingFilter(false)}
                  className="flex-1 py-3 text-sm font-bold rounded-2xl bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Toast Alert ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 dark:bg-white/95 backdrop-blur-md text-white dark:text-slate-900 px-6 py-3.5 rounded-full shadow-2xl text-xs font-bold animate-fade-in-up flex items-center gap-2">
          <span>✨</span> {toast}
        </div>
      )}
    </div>
  );
}
