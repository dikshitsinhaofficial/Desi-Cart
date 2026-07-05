'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';
import Link from 'next/link';

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

interface Suggestion {
  _id: string;
  name: string;
  category: string;
}

export default function HeaderSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch search suggestions
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      return;
    }

    setLoadingSuggestions(true);
    const fetchSuggestions = async () => {
      try {
        const res = await fetch(`/api/products/suggestions?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
        }
      } catch (err) {
        console.error('Suggestions fetch error:', err);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    const handler = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(handler);
  }, [query]);

  // Debounced auto-search: navigates 600ms after user stops typing
  useEffect(() => {
    if (!query.trim()) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      params.set('search', query.trim());
      if (selectedCategory !== 'All Categories') params.set('category', selectedCategory);
      router.push(`/shop?${params.toString()}`);
    }, 600);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, selectedCategory, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setShowSuggestions(false);
    const params = new URLSearchParams();
    if (query.trim()) params.set('search', query.trim());
    if (selectedCategory !== 'All Categories') params.set('category', selectedCategory);
    router.push(`/shop${params.toString() ? '?' + params.toString() : ''}`);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    router.push('/shop');
  };

  return (
    <div ref={wrapperRef} className="flex-1 max-w-3xl hidden md:block relative">
      <form
        onSubmit={handleSearch}
        className="flex rounded-xl overflow-hidden bg-white h-11 shadow-sm border border-slate-200/80 focus-within:border-orange-500 focus-within:shadow-md transition-all duration-200"
      >
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm px-4 border-r border-slate-200/80 outline-none w-auto max-w-[170px] cursor-pointer font-medium transition-colors"
        >
          {CATEGORIES.map(cat => (
            <option key={cat}>{cat}</option>
          ))}
        </select>

        <div className="relative flex-1 flex items-center">
          <input
            type="text"
            placeholder="Search for products, categories or brands..."
            value={query}
            onFocus={() => setShowSuggestions(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            className="flex-1 px-4 text-sm text-slate-800 outline-none w-full h-full pr-10 font-medium"
          />
          {loadingSuggestions && (
            <Loader2 size={16} className="absolute right-9 text-slate-400 animate-spin" />
          )}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 transition-colors px-6 flex items-center justify-center text-white"
        >
          <Search size={20} strokeWidth={2.5} />
        </button>
      </form>

      {/* Autocomplete Suggestions Dropdown */}
      {showSuggestions && (query.trim() !== '') && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-150/80 overflow-hidden z-50 py-2">
          {suggestions.length === 0 && !loadingSuggestions ? (
            <div className="px-4 py-3 text-sm text-slate-400 italic">No matches found for "{query}"</div>
          ) : (
            <div className="flex flex-col">
              {suggestions.map((sugg) => (
                <button
                  key={sugg._id}
                  onClick={() => {
                    setShowSuggestions(false);
                    setQuery(sugg.name);
                    router.push(`/shop/${sugg._id}`);
                  }}
                  className="w-full text-left px-5 py-3 hover:bg-orange-50/50 hover:text-orange-600 text-sm font-medium text-slate-700 transition-all flex items-center justify-between group"
                >
                  <span className="truncate group-hover:translate-x-1 transition-transform">{sugg.name}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-orange-400/80 bg-slate-100 group-hover:bg-orange-100/50 px-2 py-0.5 rounded-full">
                    {sugg.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
