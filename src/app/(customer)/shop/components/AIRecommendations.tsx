'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight, Loader2, Star, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '@/lib/api';

interface ShopProduct {
  _id: string;
  name: string;
  category: string;
  price: number;
  mrp: number;
  rating: number;
  reviews: number;
  image?: string;
}

export default function AIRecommendations({ onAddToCart }: { onAddToCart: (p: any) => void }) {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await fetch(`${API}/api/ai-recommendations`);
        if (!res.ok) throw new Error('Failed to fetch AI recommendations');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (error || (!loading && products.length === 0)) return null;

  return (
    <div className="mb-10 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-slate-900 dark:to-slate-900 border border-orange-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 relative overflow-hidden">
      {/* Decorative sparkles */}
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <Sparkles size={120} className="text-orange-500" />
      </div>

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30">
          <Sparkles size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI Top Picks</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Curated specifically for you by Gemini AI</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-500">AI is curating products...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {products.map((product, i) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1 transition-all group flex flex-col h-full"
            >
              <Link href={`/shop/${product._id}`} className="block relative aspect-square rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900 mb-4">
                {product.image ? (
                  <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Package className="text-slate-300" /></div>
                )}
              </Link>
              
              <div className="flex-1 flex flex-col">
                <p className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1">{product.category}</p>
                <Link href={`/shop/${product._id}`}>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 mb-2 group-hover:text-orange-500 transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-1 mb-3">
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{product.rating.toFixed(1)}</span>
                </div>
                
                <div className="mt-auto flex items-center justify-between">
                  <div>
                    <span className="font-black text-lg text-slate-900 dark:text-white">₹{product.price.toLocaleString('en-IN')}</span>
                  </div>
                  <button
                    onClick={(e) => { e.preventDefault(); onAddToCart({ uid: product._id, ...product }); }}
                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
