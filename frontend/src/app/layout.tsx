import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import Script from "next/script";
import Link from "next/link";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Desi Cart — Shop India's Best",
  description: "Discover amazing products from local sellers across India. Electronics, fitness, groceries, clothing & more.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          {/* Main Top Header - Dense Amazon/Flipkart Style */}
          <header className="sticky top-0 z-50">
            {/* Top Bar - Dark */}
            <div className="bg-slate-900 text-white flex items-center justify-between px-4 py-2 gap-4">
              {/* Logo */}
              <Link href="/" className="flex flex-col flex-shrink-0 items-start">
                <span className="text-xl font-bold leading-none tracking-tight">
                  <span className="text-white">Desi</span>
                  <span className="text-orange-500">Cart</span>
                </span>
                <span className="text-[10px] text-slate-300">Explore Plus ✨</span>
              </Link>
              
              {/* Search Bar - Center */}
              <div className="flex-1 max-w-3xl hidden md:flex rounded-md overflow-hidden bg-white h-10 shadow-sm border border-transparent focus-within:border-orange-500 transition-colors">
                <select className="bg-slate-100 text-slate-700 text-sm px-3 border-r border-slate-300 outline-none w-auto max-w-[120px] cursor-pointer">
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
                  className="flex-1 px-4 text-sm text-slate-900 outline-none w-full"
                />
                <button className="bg-orange-500 hover:bg-orange-600 transition-colors px-5 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
              </div>

              {/* Right Menu */}
              <div className="flex items-center gap-6 text-sm font-semibold whitespace-nowrap">
                <div className="hidden lg:flex flex-col cursor-pointer group">
                  <span className="text-xs font-normal text-slate-300 leading-none">Hello, Sign in</span>
                  <span className="leading-none mt-1 flex items-center">Account & Lists <svg className="w-4 h-4 text-slate-400 group-hover:text-white ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></span>
                </div>
                
                <div className="hidden lg:flex flex-col cursor-pointer">
                  <span className="text-xs font-normal text-slate-300 leading-none">Returns</span>
                  <span className="leading-none mt-1">& Orders</span>
                </div>

                <Link href="/shop" className="flex items-center gap-1 cursor-pointer group">
                  <div className="relative">
                    <svg className="w-8 h-8 text-white group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none group-hover:bg-white group-hover:text-orange-600 transition-colors">0</span>
                  </div>
                  <span className="hidden md:block mt-2">Cart</span>
                </Link>
              </div>
            </div>
            
            {/* Mega Menu / Categories Bar */}
            <div className="bg-slate-800 text-white px-4 py-1.5 flex items-center gap-6 overflow-x-auto whitespace-nowrap scrollbar-hide border-t border-slate-700 text-sm font-medium">
              <Link href="/shop" className="flex items-center gap-1 hover:text-orange-400 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                All
              </Link>
              <Link href="/shop" className="hover:text-orange-400 transition-colors">Today's Deals</Link>
              <Link href="/shop" className="hover:text-orange-400 transition-colors">Electronics</Link>
              <Link href="/shop" className="hover:text-orange-400 transition-colors">Mobiles</Link>
              <Link href="/shop" className="hover:text-orange-400 transition-colors">Fashion</Link>
              <Link href="/shop" className="hover:text-orange-400 transition-colors">Home & Kitchen</Link>
              <Link href="/shop" className="hover:text-orange-400 transition-colors">Groceries</Link>
              <Link href="/shop" className="hover:text-orange-400 transition-colors">Customer Service</Link>
            </div>
          </header>

          {/* Main — full width */}
          <main className="flex-1 bg-slate-100">
            {children}
          </main>

          <footer className="bg-slate-900 text-slate-300 pt-10 pb-6 text-sm mt-auto">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h4 className="text-white font-bold mb-4">Get to Know Us</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:underline">About Us</a></li>
                  <li><a href="#" className="hover:underline">Careers</a></li>
                  <li><a href="#" className="hover:underline">Press Releases</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">Connect with Us</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:underline">Facebook</a></li>
                  <li><a href="#" className="hover:underline">Twitter</a></li>
                  <li><a href="#" className="hover:underline">Instagram</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">Make Money with Us</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:underline">Sell on DesiCart</a></li>
                  <li><a href="#" className="hover:underline">Affiliate Program</a></li>
                  <li><a href="#" className="hover:underline">Advertise Your Products</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">Let Us Help You</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:underline">Your Account</a></li>
                  <li><a href="#" className="hover:underline">Returns Centre</a></li>
                  <li><a href="#" className="hover:underline">100% Purchase Protection</a></li>
                  <li><a href="#" className="hover:underline">Help</a></li>
                </ul>
              </div>
            </div>
            <div className="text-center pt-8 border-t border-slate-800 flex flex-col items-center justify-center">
              <div className="flex items-center gap-1 mb-2">
                <span className="text-xl font-bold leading-none tracking-tight">
                  <span className="text-white">Desi</span>
                  <span className="text-orange-500">Cart</span>
                </span>
              </div>
              <p className="text-xs text-slate-500">© {new Date().getFullYear()} DesiCart. Inspired by global e-commerce. Built with Next.js.</p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
