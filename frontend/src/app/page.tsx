"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, ChevronRight, Star, Zap, Shield, Truck } from "lucide-react";

// Hero slides with beautiful Unsplash backgrounds
const heroSlides = [
  {
    bg: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&q=80",
    tag: "🎉 Grand Sale — Up to 70% Off",
    headline: "Shop India's Best",
    sub: "From electronics to groceries, find everything you love — delivered fast.",
    accent: "from-orange-500 to-yellow-400",
    btn: "bg-orange-500 hover:bg-orange-600",
  },
  {
    bg: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80",
    tag: "🛍️ New Arrivals Every Day",
    headline: "Discover Desi Picks",
    sub: "Curated collections from trusted local sellers across every category.",
    accent: "from-blue-600 to-cyan-400",
    btn: "bg-blue-600 hover:bg-blue-700",
  },
  {
    bg: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&q=80",
    tag: "⚡ Flash Deals Today Only",
    headline: "Unbeatable Prices",
    sub: "Lightning-fast checkout, secure payments, and hassle-free returns.",
    accent: "from-purple-600 to-pink-500",
    btn: "bg-purple-600 hover:bg-purple-700",
  },
  {
    bg: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1600&q=80",
    tag: "🌿 Trusted Desi Brands",
    headline: "Made in India, Made for You",
    sub: "Support local artisans and brands — quality you can trust, prices you'll love.",
    accent: "from-green-600 to-emerald-400",
    btn: "bg-green-600 hover:bg-green-700",
  },
];

const features = [
  { icon: Truck, label: "Free Delivery", sub: "On orders above ₹499", color: "text-orange-500" },
  { icon: Shield, label: "Secure Payments", sub: "100% safe & encrypted", color: "text-blue-500" },
  { icon: Zap, label: "Lightning Deals", sub: "New offers every hour", color: "text-yellow-500" },
  { icon: Star, label: "Top Rated", sub: "Trusted by 10L+ shoppers", color: "text-purple-500" },
];

const categories = [
  { name: "Electronics", emoji: "📱", bg: "from-blue-500 to-indigo-600" },
  { name: "Fitness", emoji: "💪", bg: "from-green-500 to-emerald-600" },
  { name: "Groceries", emoji: "🛒", bg: "from-yellow-500 to-orange-500" },
  { name: "Clothing", emoji: "👗", bg: "from-pink-500 to-rose-600" },
  { name: "Food", emoji: "🍱", bg: "from-red-500 to-orange-600" },
];

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % heroSlides.length);
        setFading(false);
      }, 600);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const slide = heroSlides[current];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* ── Hero Section ── */}
      <section className="relative h-[90vh] min-h-[560px] overflow-hidden">
        {/* Background Images */}
        {heroSlides.map((s, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-700"
            style={{
              opacity: i === current ? (fading ? 0 : 1) : 0,
              backgroundImage: `url(${s.bg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              transition: "opacity 0.7s ease-in-out",
            }}
          />
        ))}

        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-16 lg:px-24 max-w-7xl mx-auto">
          {/* Logo / Brand */}
          <div className="mb-6 flex items-center gap-3">
            <div className={`bg-gradient-to-r ${slide.accent} p-2.5 rounded-xl shadow-lg transition-all duration-700`}>
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
            <span className="text-white text-3xl font-black tracking-tight drop-shadow-lg">
              Desi<span className={`bg-gradient-to-r ${slide.accent} bg-clip-text text-transparent`}>Cart</span>
            </span>
          </div>

          {/* Tag line */}
          <div
            key={`tag-${current}`}
            className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 text-white text-sm font-semibold px-4 py-2 rounded-full mb-5 w-fit animate-fade-in-up"
          >
            {slide.tag}
          </div>

          {/* Headline */}
          <h1
            key={`h-${current}`}
            className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-4 animate-fade-in-up delay-100"
            style={{ textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}
          >
            {slide.headline}
          </h1>

          {/* Sub text */}
          <p
            key={`p-${current}`}
            className="text-white/85 text-lg md:text-xl max-w-xl mb-8 leading-relaxed animate-fade-in-up delay-200"
          >
            {slide.sub}
          </p>

          {/* CTA Buttons */}
          <div
            key={`btn-${current}`}
            className="flex flex-wrap gap-4 animate-fade-in-up delay-300"
          >
            <Link
              href="/shop"
              className={`${slide.btn} text-white font-bold px-8 py-4 rounded-2xl text-lg shadow-2xl flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-orange-500/30`}
            >
              Shop Now <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              href="/shop"
              className="bg-white/15 backdrop-blur-sm border border-white/30 text-white font-semibold px-8 py-4 rounded-2xl text-lg hover:bg-white/25 transition-all duration-200 hover:scale-105"
            >
              Explore Deals
            </Link>
          </div>
        </div>

        {/* Slide Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => { setFading(true); setTimeout(() => { setCurrent(i); setFading(false); }, 600); }}
              className={`h-2 rounded-full transition-all duration-400 ${
                i === current ? "w-8 bg-white" : "w-2 bg-white/40"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Slide Counter */}
        <div className="absolute top-6 right-6 z-20 bg-black/30 backdrop-blur-sm text-white text-sm font-medium px-3 py-1.5 rounded-full border border-white/20">
          {current + 1} / {heroSlides.length}
        </div>
      </section>

      {/* ── Feature Badges ── */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, label, sub, color }) => (
            <div key={label} className="flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-gray-50 dark:bg-gray-800 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Category Quick Links ── */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100">Shop by Category</h2>
          <Link href="/shop" className="text-sm text-orange-500 font-semibold hover:underline flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map(({ name, emoji, bg }) => (
            <Link
              key={name}
              href="/shop"
              className={`bg-gradient-to-br ${bg} rounded-2xl p-5 flex flex-col items-center justify-center gap-2 text-white font-bold shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 aspect-square`}
            >
              <span className="text-4xl">{emoji}</span>
              <span className="text-sm font-semibold">{name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Banner CTA ── */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 p-10 text-white text-center shadow-2xl">
          {/* Decorative blobs */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -right-10 w-56 h-56 bg-white/10 rounded-full blur-2xl" />

          <div className="relative z-10">
            <p className="text-sm font-semibold bg-white/20 inline-block px-4 py-1 rounded-full mb-4">
              🔥 Limited Time Offer
            </p>
            <h2 className="text-4xl md:text-5xl font-black mb-3">
              Millions of Products.<br />One Desi Destination.
            </h2>
            <p className="text-white/80 text-lg mb-7 max-w-xl mx-auto">
              Join thousands of happy shoppers — quality products, local sellers, unbeatable prices.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-white text-orange-600 font-black px-10 py-4 rounded-2xl text-lg shadow-xl hover:scale-105 transition-all duration-200"
            >
              Start Shopping <ShoppingBag className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}