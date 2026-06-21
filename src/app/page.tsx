"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag, ShieldCheck, Truck, HeadphonesIcon } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden font-sans">
      
      {/* ── HERO SECTION ── */}
      <section className="relative h-screen flex items-center justify-center pt-16">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero_bg_1781934999722.png"
            alt="Desi-Cart Premium Shopping"
            fill
            priority
            className="object-cover opacity-60"
            unoptimized
          />
          {/* Gradient Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/60 to-slate-950"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 text-center px-4 max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-200">The New Generation of E-Commerce</span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Elevate Your Shopping <br className="hidden md:block"/> Experience.
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Discover a curated collection of premium products across fashion, electronics, fitness, and more. Unbeatable quality, minimalist design, and seamless checkout.
          </p>

          <Link href="/shop">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-600 rounded-2xl font-bold text-lg shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 transition-all"
            >
              <ShoppingBag className="w-5 h-5" />
              Enter The Shop
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* ── VALUE PROPOSITION SECTION ── */}
      <section className="py-24 relative z-10 bg-slate-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/20 flex items-center justify-center mb-6 text-orange-400">
                <Truck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Lightning Fast Delivery</h3>
              <p className="text-slate-400 leading-relaxed">Get your orders delivered securely to your doorstep within 48 hours. Real-time tracking included.</p>
            </div>
            
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 text-purple-400">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Secure Checkout</h3>
              <p className="text-slate-400 leading-relaxed">Experience a seamless and fully encrypted checkout process. We support Razorpay, Wallets, and COD.</p>
            </div>
            
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-pink-500/20 flex items-center justify-center mb-6 text-pink-400">
                <HeadphonesIcon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">24/7 Dedicated Support</h3>
              <p className="text-slate-400 leading-relaxed">Our premium customer care team is available around the clock to assist you with any inquiries.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURED CATEGORIES TEASER ── */}
      <section className="py-24 relative z-10 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Curated Collections</h2>
            <p className="text-slate-400 text-lg">Explore our finest selections categorized just for you.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Premium Electronics", img: "/cat_electronics_1781935010765.png", cat: "Laptops & Accessories" },
              { title: "High Fashion", img: "/cat_fashion_1781935025497.png", cat: "Women's Clothing" },
              { title: "Gym Equipment", img: "/cat_gym_1781935043053.png", cat: "Gym Equipment" },
              { title: "Organic Groceries", img: "/cat_food_1781935055746.png", cat: "Food & Groceries" }
            ].map((item, i) => (
              <Link href={`/shop?category=${item.cat}`} key={i}>
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer"
                >
                  <Image src={item.img} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" unoptimized />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                  <div className="absolute bottom-0 left-0 w-full p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                    <span className="text-orange-400 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                      Shop Now <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link href="/shop">
              <button className="px-8 py-3 rounded-full border border-slate-700 hover:border-slate-500 hover:bg-slate-800 text-slate-300 font-semibold transition-all">
                View All 15 Categories
              </button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}