import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import Script from "next/script";
import Header from "./components/Header";

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
          <Header />

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
