'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

const CATEGORIES = [
  "All Categories",
  "Men's Clothing",
  "Women's Clothing",
  "Shoes",
  "Mobile Phones",
  "Laptops & Accessories",
  "Audio & Watches",
  "Gym Equipment",
  "Sports Outdoors",
  "Food & Groceries",
  "Beverages",
  "Home Decor",
  "Beauty & Personal Care",
  "Toys & Games",
  "Books",
  "Pet Supplies",
];

export default function HeaderSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced auto-search: navigates 400ms after the user stops typing
  useEffect(() => {
    if (!query.trim()) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (query.trim()) params.set('search', query.trim());
      if (selectedCategory !== 'All Categories') params.set('category', selectedCategory);
      router.push(`/shop?${params.toString()}`);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, selectedCategory, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const params = new URLSearchParams();
    if (query.trim()) params.set('search', query.trim());
    if (selectedCategory !== 'All Categories') params.set('category', selectedCategory);
    router.push(`/shop${params.toString() ? '?' + params.toString() : ''}`);
  };

  const handleClear = () => {
    setQuery('');
    router.push('/shop');
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex-1 max-w-3xl hidden md:flex rounded-lg overflow-hidden bg-white h-10 shadow-sm border border-transparent focus-within:border-orange-400 transition-colors"
    >
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="bg-slate-100 text-slate-700 text-sm px-3 border-r border-slate-200 outline-none w-auto max-w-[150px] cursor-pointer"
      >
        {CATEGORIES.map(cat => (
          <option key={cat}>{cat}</option>
        ))}
      </select>

      <div className="relative flex-1 flex items-center">
        <input
          type="text"
          placeholder="Search for products, brands and more..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 px-4 text-sm text-slate-900 outline-none w-full h-full pr-8"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <button
        type="submit"
        className="bg-orange-500 hover:bg-orange-600 transition-colors px-5 flex items-center justify-center"
      >
        <Search size={18} className="text-white" />
      </button>
    </form>
  );
}
