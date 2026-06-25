'use client';

import { CATEGORIES } from '@/app/data/products';

interface FilterSidebarProps {
  category: string;
  setCategory: (c: string) => void;
  sliderMaxPrice: number;
  setSliderMaxPrice: (v: number) => void;
  totalCount: number;
}

const EMOJI_MAP: Record<string, string> = {
  "Men's Clothing": '👔', "Women's Clothing": '👗', "Shoes": '👟',
  "Mobile Phones": '📱', "Laptops & Accessories": '💻', "Audio & Watches": '🎧',
  "Gym Equipment": '🏋️', "Sports Outdoors": '⛺', "Food & Groceries": '🛒',
  "Beverages": '☕', "Home Decor": '🏠', "Beauty & Personal Care": '💄',
  "Toys & Games": '🎮', "Books": '📚', "Pet Supplies": '🐾',
};

export default function FilterSidebar({
  category, setCategory, sliderMaxPrice, setSliderMaxPrice, totalCount
}: FilterSidebarProps) {
  return (
    <aside className="w-56 shrink-0 hidden lg:block">
      <div className="sticky top-24 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-slate-800 text-white">
          <h3 className="font-bold text-sm">Filters</h3>
          <p className="text-xs text-slate-400 mt-0.5">{totalCount} products</p>
        </div>

        {/* Price Slider */}
        <div className="px-4 py-4 border-b border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Max Price</p>
          <input
            type="range"
            min={100}
            max={100000}
            step={500}
            value={sliderMaxPrice}
            onChange={e => setSliderMaxPrice(Number(e.target.value))}
            className="w-full accent-orange-500 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1.5">
            <span>₹100</span>
            <span className="font-bold text-orange-600">₹{sliderMaxPrice.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Categories */}
        <div className="px-3 py-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1 mb-2">Categories</p>
          <button
            onClick={() => setCategory('All')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all mb-0.5 ${
              category === 'All'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            🛍️ All Categories
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all mb-0.5 ${
                category === cat
                  ? 'bg-orange-500 text-white font-medium shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{EMOJI_MAP[cat] || '📦'}</span>
              <span className="truncate">{cat}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
