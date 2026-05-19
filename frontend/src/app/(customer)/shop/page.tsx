'use client';
import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
  Electronics: '📱', Fashion: '👕', Home: '🏠', Books: '📚',
  Sports: '⚽', Beauty: '✨', Toys: '🧸', 'Daily Use': '🧴', default: '📦',
};

const COLOR_MAP: Record<string, string> = {
  Electronics: 'from-blue-500 to-indigo-600', Fashion: 'from-pink-400 to-rose-500',
  Home: 'from-amber-400 to-orange-500', Books: 'from-green-500 to-teal-500',
  Sports: 'from-lime-500 to-green-600', Beauty: 'from-purple-400 to-pink-500',
  Toys: 'from-red-400 to-orange-500', 'Daily Use': 'from-sky-400 to-blue-500',
  default: 'from-gray-500 to-gray-700',
};

const STATIC_PRODUCTS: ShopProduct[] = [
  { uid: 's1',  name: 'Wireless Earbuds Pro',   category: 'Electronics', price: 1299, mrp: 2999, rating: 4.3, reviews: 2341, image: '/images/earbuds.png',   color: 'from-purple-500 to-blue-500',    badge: 'Best Seller' },
  { uid: 's2',  name: 'Cotton Kurta Set',        category: 'Fashion',     price: 799,  mrp: 1499, rating: 4.1, reviews: 876,  image: '/images/kurta.png',    color: 'from-orange-400 to-pink-500',   badge: '' },
  { uid: 's3',  name: 'Smart LED Bulb Pack',     category: 'Home',        price: 449,  mrp: 899,  rating: 4.5, reviews: 5678, image: '/images/bulb.png',     color: 'from-yellow-400 to-orange-400', badge: 'Deal of Day' },
  { uid: 's4',  name: 'Python Programming Book', category: 'Books',       price: 349,  mrp: 699,  rating: 4.7, reviews: 1234, image: '/images/book.png',     color: 'from-green-500 to-teal-500',    badge: '' },
  { uid: 's5',  name: 'Bluetooth Speaker Mini',  category: 'Electronics', price: 999,  mrp: 1999, rating: 4.2, reviews: 3412, image: '/images/speaker.png', color: 'from-blue-600 to-indigo-600',   badge: 'Top Rated' },
  { uid: 's6',  name: 'Yoga Mat Premium',        category: 'Sports',      price: 599,  mrp: 1199, rating: 4.4, reviews: 987,  image: '/images/yoga.png',    color: 'from-teal-400 to-cyan-500',     badge: '' },
  { uid: 's7',  name: 'Face Serum Vitamin C',    category: 'Beauty',      price: 499,  mrp: 999,  rating: 4.6, reviews: 4567, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400', color: 'from-pink-400 to-rose-500', badge: 'New' },
  { uid: 's8',  name: 'LEGO Building Set',       category: 'Toys',        price: 1499, mrp: 2499, rating: 4.8, reviews: 2109, image: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=400', color: 'from-red-400 to-orange-500', badge: "Kids' Choice" },
  { uid: 's9',  name: 'Mechanical Keyboard',     category: 'Electronics', price: 2499, mrp: 4999, rating: 4.5, reviews: 1876, image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=400', color: 'from-gray-600 to-gray-800', badge: '' },
  { uid: 's10', name: 'Ethnic Saree Cotton',     category: 'Fashion',     price: 1299, mrp: 2499, rating: 4.3, reviews: 654,  image: 'https://images.unsplash.com/photo-1610189013778-591db30efca6?w=400', color: 'from-amber-500 to-yellow-500', badge: '' },
  { uid: 's11', name: 'Air Fryer 4L',            category: 'Home',        price: 3499, mrp: 5999, rating: 4.6, reviews: 3210, image: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400', color: 'from-slate-500 to-gray-600', badge: 'Best Seller' },
  { uid: 's12', name: 'Cricket Bat Kashmir',     category: 'Sports',      price: 899,  mrp: 1799, rating: 4.2, reviews: 432,  image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400', color: 'from-lime-500 to-green-600', badge: '' },
  { uid: 's13', name: 'Moisturizer SPF 50',      category: 'Beauty',      price: 299,  mrp: 599,  rating: 4.4, reviews: 7890, image: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=400', color: 'from-sky-400 to-blue-500', badge: 'Popular' },
  { uid: 's14', name: 'Story Books Bundle',      category: 'Books',       price: 499,  mrp: 999,  rating: 4.5, reviews: 876,  image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400', color: 'from-violet-500 to-purple-600', badge: '' },
  { uid: 's15', name: 'USB-C Hub 7-in-1',        category: 'Electronics', price: 1799, mrp: 3499, rating: 4.3, reviews: 2345, image: 'https://images.unsplash.com/photo-1647414907153-6ce8bd0558b3?w=400', color: 'from-cyan-500 to-blue-600', badge: '' },
  { uid: 's16', name: 'Resistance Band Set',     category: 'Sports',      price: 399,  mrp: 799,  rating: 4.1, reviews: 1234, image: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400', color: 'from-emerald-500 to-green-500', badge: 'New' },
];

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Home', 'Books', 'Sports', 'Beauty', 'Toys'];
const disc = (p: number, m: number) => Math.round((1 - p / m) * 100);

// ── Component ──────────────────────────────────────────────────────────────
export default function ShopPage() {
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [toast, setToast] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [apiProducts, setApiProducts] = useState<ShopProduct[]>([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, mins: 0, secs: 0 });

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
          image:    p.image ? String(p.image) : 'https://images.unsplash.com/photo-1555529733-0e67056058e1?w=400',
          color:    COLOR_MAP[String(p.category)] ?? COLOR_MAP.default,
          badge:    'New Arrival',
        }));
        setApiProducts(mapped);
      })
      .catch(() => {}); // backend offline — static products still show
  }, []);

  const allProducts = [...apiProducts, ...STATIC_PRODUCTS];

  const filtered = useMemo(() => {
    let items = [...allProducts];
    if (category !== 'All') items = items.filter(p => p.category === category);
    if (search) items = items.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (sortBy === 'price-low')  items.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') items.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating')     items.sort((a, b) => b.rating - a.rating);
    return items;
  }, [category, search, sortBy, allProducts]);

  // ── Cart helpers ──────────────────────────────────────────────────────
  const cartTotal = cart.reduce((sum, e) => sum + e.product.price * e.qty, 0);
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

  // ── Checkout ──────────────────────────────────────────────────────────
  const handleCheckout = async () => {
    if (cartTotal === 0) return;
    setCheckoutLoading(true);
    try {
      const orderRes = await fetch(`${API}/api/checkout/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: cartTotal }),
      });
      const orderData = await orderRes.json();

      if (orderData.error) {
        showToast('Please add real Razorpay Keys in backend/.env to process payments.');
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
        prefill: { name: 'Desi Cart User', email: 'user@desicart.com', contact: '9999999999' },
        theme: { color: '#f97316' },
        handler: async (response: RazorpayResponse) => {
          const verifyRes = await fetch(`${API}/api/checkout/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id:  response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            showToast('Payment Successful! 🎉');
            setCart([]);
            setShowCart(false);
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
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">

      {/* ── Navbar ── */}
      <nav className="bg-orange-500 dark:bg-orange-800 text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="shrink-0">
            <Image src="/logo.png" alt="Desi Cart" width={90} height={36} priority />
          </Link>

          <div className="flex flex-1 mx-2 md:mx-4">
            <input
              type="text"
              placeholder="Search products, brands and more…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 text-gray-900 text-sm rounded-l-md focus:outline-none"
            />
            <button className="bg-orange-300 hover:bg-orange-200 transition px-4 rounded-r-md text-gray-800">🔍</button>
          </div>

          {/* Wallet — desktop only */}
          <div className="hidden lg:block">
            <Wallet />
          </div>

          {/* Wallet icon — mobile */}
          <Link
            href="#"
            title="Open Wallet"
            className="lg:hidden flex items-center bg-white/10 hover:bg-white/20 transition px-2 py-2 rounded-md text-lg"
          >
            👛
          </Link>

          {/* Cart button */}
          <button
            onClick={() => setShowCart(!showCart)}
            className="relative flex items-center gap-1.5 bg-white/10 hover:bg-white/20 transition px-3 py-2 rounded-md text-sm font-medium"
          >
            🛒 <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-gray-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* ── Category Strip ── */}
      <div className="bg-orange-600 dark:bg-orange-900 text-white">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto py-1 scrollbar-hide">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`whitespace-nowrap px-3 py-1.5 text-sm rounded transition-colors ${category === c ? 'bg-white/30 font-semibold' : 'hover:bg-white/20'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* ── Hero Banner with real countdown ── */}
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 dark:from-orange-900 dark:via-red-900 dark:to-pink-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-10 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">🔥 Limited Time</p>
            <h2 className="text-4xl font-extrabold mb-1">Mega Sale!</h2>
            <p className="text-lg opacity-90 mb-4">Up to 70% off — today only</p>
            <div className="flex gap-3">
              {[
                [String(timeLeft.hours).padStart(2, '0'), 'Hours'],
                [String(timeLeft.mins).padStart(2, '0'),  'Mins'],
                [String(timeLeft.secs).padStart(2, '0'),  'Secs'],
              ].map(([val, label]) => (
                <div key={label} className="bg-white/20 rounded-lg px-4 py-2 text-center min-w-[64px]">
                  <div className="text-2xl font-bold tabular-nums">{val}</div>
                  <div className="text-xs">{label}</div>
                </div>
              ))}
            </div>
          </div>
          <span className="text-8xl hidden md:block select-none">🛍️</span>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Sort bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-white">{filtered.length}</span> results
            {category !== 'All' && <> in <span className="text-orange-500 font-semibold">{category}</span></>}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filtered.map(p => {
              const inCart = cart.find(e => e.product.uid === p.uid);
              return (
                <div
                  key={p.uid}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 dark:border-gray-700 flex flex-col"
                >
                  {/* Image area */}
                  <div className={`relative h-44 bg-gradient-to-br ${p.color} flex items-center justify-center overflow-hidden`}>
                    {p.image ? (
                      <Image src={p.image} alt={p.name} width={176} height={176} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                      <span className="text-6xl group-hover:scale-110 transition-transform duration-300 select-none">
                        {EMOJI_MAP[p.category] ?? EMOJI_MAP.default}
                      </span>
                    )}
                    {p.badge && (
                      <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {p.badge}
                      </span>
                    )}
                    {p.mrp > p.price && (
                      <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        -{disc(p.price, p.mrp)}%
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3 flex flex-col flex-1">
                    <p className="text-[10px] text-orange-500 font-semibold uppercase mb-1">{p.category}</p>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight mb-2 line-clamp-2 flex-1">
                      {p.name}
                    </h3>
                    {p.rating > 0 && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded font-bold">
                          {p.rating} ★
                        </span>
                        <span className="text-xs text-gray-400">({p.reviews.toLocaleString()})</span>
                      </div>
                    )}
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-base font-bold text-gray-900 dark:text-white">₹{p.price.toLocaleString()}</span>
                      {p.mrp > p.price && (
                        <span className="text-xs text-gray-400 line-through">₹{p.mrp.toLocaleString()}</span>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart(p)}
                      className={`w-full text-white text-sm font-semibold py-2 rounded-lg transition-all duration-150 active:scale-95 ${
                        inCart
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-orange-500 hover:bg-orange-600'
                      }`}
                    >
                      {inCart ? `In Cart (${inCart.qty}) ✓` : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Cart Sidebar ── */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCart(false)} />
          <div className="relative w-80 bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">🛒 Your Cart ({cartCount})</h2>
              <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center text-gray-400 mt-10">
                  <div className="text-5xl mb-3">🛒</div>
                  <p>Your cart is empty</p>
                </div>
              ) : (
                cart.map(entry => (
                  <div key={entry.product.uid} className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${entry.product.color} flex items-center justify-center text-2xl shrink-0 overflow-hidden`}>
                      {entry.product.image ? (
                        <Image src={entry.product.image} alt={entry.product.name} width={48} height={48} className="object-cover w-full h-full" />
                      ) : (
                        EMOJI_MAP[entry.product.category] ?? '📦'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{entry.product.name}</p>
                      <p className="text-sm text-orange-500 font-bold">₹{(entry.product.price * entry.qty).toLocaleString()}</p>

                      {/* Quantity control */}
                      <div className="flex items-center gap-2 mt-1.5">
                        <button
                          onClick={() => updateQty(entry.product.uid, -1)}
                          className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white text-sm font-bold flex items-center justify-center hover:bg-orange-100 dark:hover:bg-orange-900 transition"
                        >−</button>
                        <span className="text-sm font-semibold text-gray-800 dark:text-white w-4 text-center">{entry.qty}</span>
                        <button
                          onClick={() => updateQty(entry.product.uid, 1)}
                          className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white text-sm font-bold flex items-center justify-center hover:bg-orange-100 dark:hover:bg-orange-900 transition"
                        >+</button>
                        <button
                          onClick={() => removeFromCart(entry.product.uid)}
                          className="ml-auto text-red-400 hover:text-red-600 text-xs transition"
                          title="Remove"
                        >🗑</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t dark:border-gray-700">
                <div className="flex justify-between mb-3 text-gray-900 dark:text-white">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">₹{cartTotal.toLocaleString()}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {checkoutLoading && (
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  )}
                  {checkoutLoading ? 'Processing…' : 'Proceed to Checkout'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-full shadow-xl text-sm font-semibold animate-fade-in-up">
          ✅ {toast}
        </div>
      )}
    </div>
  );
}
