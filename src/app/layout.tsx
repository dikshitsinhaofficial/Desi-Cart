import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import Script from "next/script";
import Header from "./components/Header";
import { AuthProvider } from "@/lib/AuthContext";
import { CartProvider } from "@/lib/CartContext";
import { WishlistProvider } from "@/lib/WishlistContext";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Desi Cart — Shop India's Best",
  description: "Discover amazing products from local sellers across India. Electronics, fitness, groceries, clothing & more.",
  keywords: "online shopping, india, electronics, fashion, groceries, desi cart",
  openGraph: {
    title: "Desi Cart — Shop India's Best",
    description: "Discover amazing products from local sellers across India.",
    type: "website",
    locale: "en_IN",
    siteName: "DesiCart",
  },
  twitter: {
    card: "summary_large_image",
    title: "Desi Cart — Shop India's Best",
    description: "Discover amazing products from local sellers across India.",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>

      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ThemeProvider>
                <Header />

                {/* Main — full width */}
                <main className="flex-1 bg-slate-100 dark:bg-slate-950">
                  {children}
                </main>

                <footer className="bg-slate-900 text-slate-300 pt-10 pb-6 text-sm mt-auto">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                  <div>
                    <h4 className="text-white font-bold mb-4">Get to Know Us</h4>
                    <ul className="space-y-2">
                      <li><a href="/about" className="hover:text-orange-400 transition-colors">About Us</a></li>
                      <li><a href="/careers" className="hover:text-orange-400 transition-colors">Careers</a></li>
                      <li><a href="/press" className="hover:text-orange-400 transition-colors">Press Releases</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-4">Connect with Us</h4>
                    <ul className="space-y-2">
                      <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">Facebook</a></li>
                      <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">Twitter</a></li>
                      <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">Instagram</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-4">Make Money with Us</h4>
                    <ul className="space-y-2">
                      <li><a href="/login" className="hover:text-orange-400 transition-colors">Sell on DesiCart</a></li>
                      <li><a href="/affiliate" className="hover:text-orange-400 transition-colors">Affiliate Program</a></li>
                      <li><a href="/advertise" className="hover:text-orange-400 transition-colors">Advertise Products</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-4">Let Us Help You</h4>
                    <ul className="space-y-2">
                      <li><a href="/login" className="hover:text-orange-400 transition-colors">Your Account</a></li>
                      <li><a href="/returns" className="hover:text-orange-400 transition-colors">Returns Centre</a></li>
                      <li><a href="/protection" className="hover:text-orange-400 transition-colors">100% Purchase Protection</a></li>
                      <li><a href="/help" className="hover:text-orange-400 transition-colors">Help</a></li>
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
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
