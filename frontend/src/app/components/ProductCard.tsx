'use client';
import Image from 'next/image';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

export default function ProductCard({ id, name, price, image, category }: ProductCardProps) {
  return (
    <div className="group relative bg-white dark:bg-slate-900/80 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
      {/* Image */}
      <div className="relative w-full aspect-square bg-slate-50 dark:bg-slate-800/50 overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          unoptimized
        />
      </div>

      {/* Content */}
      <div className="p-3.5">
        <p className="text-[11px] font-medium text-purple-500 dark:text-purple-400 uppercase tracking-wider mb-1">{category}</p>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
          {name}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-lg font-bold text-slate-900 dark:text-white">₹{price.toLocaleString()}</span>
        </div>
        <button className="mt-3 w-full py-2 rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white text-xs font-semibold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 active:scale-95">
          Add to Cart
        </button>
      </div>
    </div>
  );
}
