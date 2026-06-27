'use client';

import { useCart } from '@/lib/CartContext';
import { ShoppingBag, Check } from 'lucide-react';
import { useState } from 'react';

interface Props {
  product: {
    id: string;
    name: string;
    category: string;
    price: number;
    mrp: number;
    rating: number;
    reviews: number;
    image?: string;
  };
}

export default function AddToCartButton({ product }: Props) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleAdd}
      className={`w-full flex items-center justify-center gap-3 py-4 px-8 rounded-2xl font-bold text-base transition-all duration-300 shadow-lg ${
        added
          ? 'bg-emerald-500 shadow-emerald-500/30 scale-95'
          : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/30 hover:scale-105 active:scale-95'
      } text-white`}
    >
      {added ? (
        <>
          <Check size={20} strokeWidth={3} />
          Added to Cart!
        </>
      ) : (
        <>
          <ShoppingBag size={20} />
          Add to Cart
        </>
      )}
    </button>
  );
}
