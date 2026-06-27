'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useAuth } from './AuthContext';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  mrp: number;
  image?: string;
  category: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlist: [],
  addToWishlist: () => {},
  removeFromWishlist: () => {},
  isInWishlist: () => false,
});

export const useWishlist = () => useContext(WishlistContext);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [mounted, setMounted] = useState(false);

  const getWishlistKey = () => `desi-cart-wishlist-${user?.uid || 'guest'}`;

  // Load from localStorage on mount & when user changes
  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(getWishlistKey());
      if (raw) setWishlist(JSON.parse(raw));
      else setWishlist([]);
    } catch {
      setWishlist([]);
    }
  }, [user]);

  // Persist every change
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(getWishlistKey(), JSON.stringify(wishlist));
    } catch {}
  }, [wishlist, mounted, user]);

  const addToWishlist = (item: WishlistItem) => {
    setWishlist(prev => {
      if (prev.find(w => w.id === item.id)) return prev;
      return [...prev, item];
    });
  };

  const removeFromWishlist = (id: string) => {
    setWishlist(prev => prev.filter(w => w.id !== id));
  };

  const isInWishlist = (id: string) => {
    return wishlist.some(w => w.id === id);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}
