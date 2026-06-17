"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ChevronLeft } from "lucide-react";
import API from "../lib/api";

const heroSlides = [
  {
    bg: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&q=80",
    link: "/shop?category=Electronics",
  },
  {
    bg: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80",
    link: "/shop?category=Clothing",
  },
  {
    bg: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&q=80",
    link: "/shop?category=Fitness",
  },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch(`${API}/api/products`)
      .then(r => r.json())
      .then(data => setProducts(data))
      .catch(console.error);
  }, []);

  const getProductsByCategory = (cat: string) => products.filter(p => p.category === cat).slice(0, 10);

  const renderHorizontalList = (title: string, items: any[]) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="bg-white p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <Link href={`/shop?category=${items[0]?.category || ''}`} className="text-sm text-blue-600 hover:underline">See all deals</Link>
        </div>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {items.map((item, idx) => (
            <Link href="/shop" key={idx} className="min-w-[200px] max-w-[200px] flex flex-col group">
              <div className="bg-slate-50 h-48 flex items-center justify-center p-2 mb-2 group-hover:bg-slate-100 transition-colors">
                {item.image ? (
                  <Image src={item.image} alt={item.name} width={150} height={150} className="object-contain h-full mix-blend-multiply" />
                ) : (
                  <div className="w-full h-full bg-slate-200" />
                )}
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-sm">
                  Up to {Math.round((1 - item.price / (item.mrp || item.price * 1.2)) * 100)}% off
                </span>
                <span className="text-xs text-red-600 font-bold">Deal of the Day</span>
              </div>
              <span className="text-sm line-clamp-2 text-slate-800 group-hover:text-orange-600">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-10">
      {/* Hero Carousel */}
      <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden bg-slate-200">
        {heroSlides.map((slide, idx) => (
          <Link href={slide.link} key={idx}>
            <div
              className="absolute inset-0 transition-opacity duration-1000 ease-in-out cursor-pointer"
              style={{
                opacity: idx === currentSlide ? 1 : 0,
                backgroundImage: `url(${slide.bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center top",
              }}
            />
          </Link>
        ))}
        {/* Gradients to blend with background below */}
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-slate-100 to-transparent" />
        
        {/* Navigation Arrows */}
        <button 
          onClick={() => setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1))}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 p-2 rounded-full backdrop-blur-sm"
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>
        <button 
          onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 p-2 rounded-full backdrop-blur-sm"
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>
      </div>

      <div className="max-w-[1500px] mx-auto px-4 -mt-20 md:-mt-40 relative z-10">
        
        {/* 4-Grid Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 shadow-sm z-10 flex flex-col h-[400px]">
            <h3 className="text-xl font-bold mb-4">Up to 70% off | Clearance store</h3>
            <div className="grid grid-cols-2 gap-2 flex-1">
              <div className="bg-slate-100 p-2 flex flex-col justify-end"><img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200" className="h-24 object-cover mb-2" /><span className="text-xs">Shoes</span></div>
              <div className="bg-slate-100 p-2 flex flex-col justify-end"><img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200" className="h-24 object-cover mb-2" /><span className="text-xs">Watches</span></div>
              <div className="bg-slate-100 p-2 flex flex-col justify-end"><img src="https://images.unsplash.com/photo-1583394838002-acd97379c167?w=200" className="h-24 object-cover mb-2" /><span className="text-xs">Bags</span></div>
              <div className="bg-slate-100 p-2 flex flex-col justify-end"><img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200" className="h-24 object-cover mb-2" /><span className="text-xs">Audio</span></div>
            </div>
            <Link href="/shop" className="text-sm text-blue-600 mt-4 hover:underline">See more</Link>
          </div>
          
          <div className="bg-white p-4 shadow-sm z-10 flex flex-col h-[400px]">
            <h3 className="text-xl font-bold mb-4">Starting ₹99 | Home & Kitchen</h3>
            <div className="flex-1 bg-slate-100 overflow-hidden relative group cursor-pointer">
              <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            </div>
            <Link href="/shop?category=Groceries" className="text-sm text-blue-600 mt-4 hover:underline">Shop now</Link>
          </div>
          
          <div className="bg-white p-4 shadow-sm z-10 flex flex-col h-[400px]">
            <h3 className="text-xl font-bold mb-4">Keep fit | Sports & Fitness</h3>
            <div className="flex-1 bg-slate-100 overflow-hidden relative group cursor-pointer">
              <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            </div>
            <Link href="/shop?category=Fitness" className="text-sm text-blue-600 mt-4 hover:underline">See all offers</Link>
          </div>
          
          <div className="bg-white p-4 shadow-sm z-10 flex flex-col h-[400px]">
            <h3 className="text-xl font-bold mb-4">Sign in for your best experience</h3>
            <button className="w-full bg-[#ffd814] hover:bg-[#f7ca00] text-slate-900 text-sm font-semibold py-2 rounded-full mb-2">Sign in securely</button>
            <div className="flex-1 bg-slate-50 border border-slate-200 mt-2 p-3">
              <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400" className="w-full h-32 object-cover mb-2" />
              <p className="text-xs text-slate-600">Discover new trends in electronics and fashion.</p>
            </div>
          </div>
        </div>

        {/* Dynamic Horizontal Lists */}
        {renderHorizontalList("Today's Deals in Electronics", getProductsByCategory("Electronics"))}
        {renderHorizontalList("Recommended for you from Clothing", getProductsByCategory("Clothing"))}
        {renderHorizontalList("Bestsellers in Groceries & Gourmet", getProductsByCategory("Groceries"))}

      </div>
    </div>
  );
}