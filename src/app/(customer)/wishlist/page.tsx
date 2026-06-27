'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useWishlist } from '@/lib/WishlistContext';
import { useCart } from '@/lib/CartContext';
import { ShoppingBag, Trash2, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
        <Heart className="text-orange-500" fill="currentColor" /> My Wishlist
      </h1>

      {wishlist.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <Heart size={64} className="mx-auto text-slate-300 dark:text-slate-700 mb-6" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Your wishlist is empty</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
            Save items you love here to buy them later. Start exploring our catalogue!
          </p>
          <Link
            href="/shop"
            className="inline-block px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-orange-500/20"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {wishlist.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-slate-100 dark:border-slate-800 flex flex-col"
            >
              <Link href={`/shop/${item.id}`} className="block relative bg-slate-50 dark:bg-slate-800">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={300}
                    height={200}
                    className="w-full h-44 object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-44 flex items-center justify-center text-5xl bg-gradient-to-br from-slate-100 to-slate-200">
                    📦
                  </div>
                )}
              </Link>
              
              <div className="p-4 flex flex-col flex-1">
                <p className="text-xs text-orange-500 font-medium mb-1 truncate">{item.category}</p>
                <Link href={`/shop/${item.id}`}>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white line-clamp-2 hover:text-orange-500 transition-colors mb-3">
                    {item.name}
                  </p>
                </Link>
                
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      ₹{item.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      title="Remove"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button
                      onClick={() => {
                        addToCart({ id: item.id, ...item, rating: 0, reviews: 0 });
                        removeFromWishlist(item.id);
                      }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30 transition-colors"
                      title="Move to Cart"
                    >
                      <ShoppingBag size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
