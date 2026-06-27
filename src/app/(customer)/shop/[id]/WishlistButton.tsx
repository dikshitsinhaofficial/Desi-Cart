'use client';

import { useWishlist } from '@/lib/WishlistContext';
import { Heart } from 'lucide-react';

interface Props {
  product: {
    id: string;
    name: string;
    category: string;
    price: number;
    mrp: number;
    image?: string;
  };
}

export default function WishlistButton({ product }: Props) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const saved = isInWishlist(product.id);

  const toggle = () => {
    if (saved) removeFromWishlist(product.id);
    else addToWishlist(product);
  };

  return (
    <button
      onClick={toggle}
      className={`w-14 h-14 flex items-center justify-center rounded-2xl border-2 transition-all duration-300 shrink-0 ${
        saved
          ? 'bg-red-50 border-red-200 text-red-500'
          : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50'
      }`}
      title={saved ? "Remove from Wishlist" : "Add to Wishlist"}
    >
      <Heart size={24} className={saved ? "fill-red-500" : ""} />
    </button>
  );
}
