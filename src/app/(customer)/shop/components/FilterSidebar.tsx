'use client';

import { CATEGORIES } from '@/app/data/products';

interface FilterSidebarProps {
  category: string;
  setCategory: (c: string) => void;
  minPrice: string;
  setMinPrice: (v: string) => void;
  maxPrice: string;
  setMaxPrice: (v: string) => void;
  selectedBrands: string[];
  setSelectedBrands: (brands: string[]) => void;
  totalCount: number;
  mobile?: boolean;
}

const BRANDS = [
  "Nike", "Adidas", "Apple", "Samsung", "Sony", "Zara", "IKEA", "Pedigree"
];

const EMOJI_MAP: Record<string, string> = {
  "Men's Clothing": '👔', "Women's Clothing": '👗', "Shoes": '👟',
  "Mobile Phones": '📱', "Laptops & Accessories": '💻', "Audio & Watches": '🎧',
  "Gym Equipment": '🏋️', "Sports Outdoors": '⛺', "Food & Groceries": '🛒',
  "Beverages": '☕', "Home Decor": '🏠', "Beauty & Personal Care": '💄',
  "Toys & Games": '🎮', "Books": '📚', "Pet Supplies": '🐾',
};

export default function FilterSidebar({
  category, setCategory, minPrice, setMinPrice, maxPrice, setMaxPrice,
  selectedBrands, setSelectedBrands, totalCount, mobile
}: FilterSidebarProps) {
  
  const handleBrandChange = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter(b => b !== brand));
    } else {
      setSelectedBrands([...selectedBrands, brand]);
    }
  };

  return (
    <aside className={mobile ? 'w-full' : 'w-64 shrink-0 hidden lg:block'}>
      <div className={mobile ? '' : 'sticky top-24 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden'}>
        {/* Header */}
        <div className="px-4 py-3.5 bg-slate-800 dark:bg-slate-950 text-white">
          <h3 className="font-bold text-sm">Filters</h3>
          <p className="text-xs text-slate-400 mt-0.5">{totalCount} products</p>
        </div>

        {/* Price Range */}
        <div className="px-4 py-4 border-b border-slate-100 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Price Range (₹)</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-white outline-none focus:border-orange-500 transition-colors"
            />
            <span className="text-slate-400 text-sm">—</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-white outline-none focus:border-orange-500 transition-colors"
            />
          </div>
        </div>

        {/* Brands */}
        <div className="px-4 py-4 border-b border-slate-100 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Brands</p>
          <div className="space-y-2">
            {BRANDS.map(brand => (
              <label key={brand} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-350 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => handleBrandChange(brand)}
                  className="rounded text-orange-500 focus:ring-orange-500 w-4 h-4 accent-orange-500 border-slate-300"
                />
                <span>{brand}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="px-3 py-4 max-h-[350px] overflow-y-auto">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1 mb-2">Categories</p>
          <button
            onClick={() => setCategory('All')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all mb-0.5 ${
              category === 'All'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
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
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
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
