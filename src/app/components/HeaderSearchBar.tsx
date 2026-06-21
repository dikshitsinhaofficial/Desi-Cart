'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HeaderSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('search', query.trim());
    if (selectedCategory !== 'All Categories') params.set('category', selectedCategory);
    router.push(`/shop${params.toString() ? '?' + params.toString() : ''}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex-1 max-w-3xl hidden md:flex rounded-md overflow-hidden bg-white h-10 shadow-sm border border-transparent focus-within:border-orange-500 transition-colors"
    >
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="bg-slate-100 text-slate-700 text-sm px-3 border-r border-slate-300 outline-none w-auto max-w-[120px] cursor-pointer"
      >
        <option>All Categories</option>
        <option>Electronics</option>
        <option>Fitness</option>
        <option>Groceries</option>
        <option>Clothing</option>
        <option>Food</option>
      </select>
      <input
        type="text"
        placeholder="Search for products, brands and more..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 px-4 text-sm text-slate-900 outline-none w-full"
      />
      <button
        type="submit"
        className="bg-orange-500 hover:bg-orange-600 transition-colors px-5 flex items-center justify-center"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  );
}
