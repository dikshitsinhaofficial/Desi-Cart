import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Welcome to Desi Cart",
  description: "Discover amazing products from local sellers across India.",
};

export default function CustomerHome() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans">
      {/* ── Background Video ── */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0 pointer-events-none select-none"
      >
        <source
          src="https://assets.mixkit.co/videos/preview/mixkit-shopping-in-a-clothing-store-44015-large.mp4"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>

      {/* ── Premium Glassmorphic Overlay ── */}
      <div className="absolute inset-0 bg-slate-950/70 dark:bg-slate-950/80 backdrop-blur-[3px] z-10" />

      {/* ── Ambient Glow Elements ── */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-orange-500/20 rounded-full blur-[100px] z-10 animate-float-slow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-500/20 rounded-full blur-[120px] z-10 animate-float-reverse pointer-events-none" />

      {/* ── Main Hero Card ── */}
      <main className="relative z-20 max-w-xl w-full mx-4 text-center">
        <div className="bg-white/10 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-white/10 p-8 md:p-12 rounded-3xl shadow-2xl space-y-8 animate-fade-in-up delay-100">
          
          {/* Logo container with float shadow */}
          <div className="flex justify-center mb-2">
            <div className="relative group bg-white/5 dark:bg-white/10 p-5 rounded-2xl border border-white/10 dark:border-white/20 shadow-lg hover:scale-105 transition-all duration-300">
              <Image 
                src="/logo.png" 
                alt="Desi Cart Logo" 
                width={180} 
                height={70} 
                className="object-contain"
                priority 
              />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              Experience the Best of <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-rose-400 bg-clip-text text-transparent">Desi Shopping</span>
            </h1>
            <p className="text-slate-200 dark:text-slate-300 text-base md:text-lg max-w-md mx-auto font-medium">
              Discover, support, and shop authentic products curated from local sellers all across India.
            </p>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
            <Link
              href="/shop"
              className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold rounded-2xl shadow-xl shadow-orange-500/20 hover:shadow-orange-500/30 transition-all duration-300 active:scale-95 text-base"
            >
              <ShoppingBag size={20} className="group-hover:rotate-6 transition-transform" />
              Start Shopping
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Footer text */}
        <p className="mt-8 text-xs text-white/50 tracking-wider uppercase font-semibold">
          🇮🇳 Supporting Local Indian Businesses
        </p>
      </main>
    </div>
  );
}
