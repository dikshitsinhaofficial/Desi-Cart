'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, Zap } from 'lucide-react';

interface Product {
  uid: string;
  name: string;
  category: string;
  price: number;
  mrp: number;
  rating: number;
  reviews: number;
  image?: string;
}

interface ProductGridProps {
  products: Product[];
  totalFiltered: number;
  currentPage: number;
  totalPages: number;
  sortBy: string;
  setSortBy: (s: string) => void;
  setCurrentPage: (p: number) => void;
  onAddToCart: (p: Product) => void;
  loading: boolean;
}

const disc = (p: number, m: number) => Math.round((1 - p / m) * 100);

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden animate-pulse">
      <div className="bg-slate-200 h-48 w-full" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-200 rounded w-1/2" />
        <div className="h-5 bg-slate-200 rounded w-1/3 mt-2" />
        <div className="h-9 bg-slate-200 rounded-xl w-full mt-3" />
      </div>
    </div>
  );
}

export default function ProductGrid({
  products, totalFiltered, currentPage, totalPages,
  sortBy, setSortBy, setCurrentPage, onAddToCart, loading
}: ProductGridProps) {
  return (
    <div className="flex-1 min-w-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-800">{products.length}</span> of{' '}
          <span className="font-semibold text-slate-800">{totalFiltered}</span> results
        </p>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none focus:border-orange-500 cursor-pointer"
        >
          <option value="featured">Featured</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-6xl mb-4">🔍</span>
          <h3 className="text-lg font-bold text-slate-700 mb-2">No products found</h3>
          <p className="text-slate-500 text-sm">Try adjusting your filters or search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((p, i) => {
            const discPct = p.mrp > p.price ? disc(p.price, p.mrp) : 0;
            return (
              <motion.div
                key={p.uid}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-slate-100 hover:border-orange-200 transition-all duration-200 group flex flex-col"
              >
                <Link href={`/shop/${p.uid}`} className="block relative bg-slate-50 overflow-hidden">
                  {discPct > 0 && (
                    <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Zap size={9} fill="currentColor" /> -{discPct}%
                    </span>
                  )}
                  {p.image ? (
                    <Image
                      src={p.image}
                      alt={p.name}
                      width={300}
                      height={200}
                      className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-44 flex items-center justify-center text-5xl bg-gradient-to-br from-slate-100 to-slate-200">
                      📦
                    </div>
                  )}
                </Link>

                <div className="p-3 flex flex-col flex-1">
                  <Link href={`/shop/${p.uid}`}>
                    <p className="text-xs text-orange-500 font-medium mb-0.5 truncate">{p.category}</p>
                    <p className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug hover:text-orange-600 transition-colors mb-2">{p.name}</p>
                  </Link>

                  {p.rating > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                      <Star size={11} fill="#f59e0b" className="text-amber-400" />
                      <span className="text-xs font-semibold text-slate-700">{p.rating.toFixed(1)}</span>
                      <span className="text-xs text-slate-400">({p.reviews})</span>
                    </div>
                  )}

                  <div className="mt-auto">
                    <div className="flex items-baseline gap-1.5 mb-2.5">
                      <span className="text-base font-black text-slate-900">₹{p.price.toLocaleString('en-IN')}</span>
                      {p.mrp > p.price && (
                        <span className="text-xs text-slate-400 line-through">₹{p.mrp.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                    <button
                      onClick={() => onAddToCart(p)}
                      className="w-full flex items-center justify-center gap-1.5 bg-orange-50 hover:bg-orange-500 border border-orange-200 hover:border-orange-500 text-orange-600 hover:text-white text-xs font-bold py-2 rounded-xl transition-all duration-200 group/btn"
                    >
                      <ShoppingBag size={13} />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-slate-200 text-slate-600 hover:border-orange-400 hover:text-orange-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            ← Prev
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                  currentPage === page
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-400 hover:text-orange-500'
                }`}
              >
                {page}
              </button>
            );
          })}
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-slate-200 text-slate-600 hover:border-orange-400 hover:text-orange-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
