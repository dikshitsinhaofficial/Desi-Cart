import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import Script from "next/script";
import Link from "next/link";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Desi Cart",
  description: "Discover amazing products from local sellers across India.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}> 
      <head>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          {/* Header */}
          <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md">
            <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
              <Link href="/" className="text-2xl font-bold text-primary">
                DesiCart
              </Link>
              <ul className="flex space-x-4 text-sm">
                <li><Link href="#electronics" className="hover:text-primary">Electronics</Link></li>
                <li><Link href="#gym" className="hover:text-primary">Gym</Link></li>
                <li><Link href="#clothing" className="hover:text-primary">Clothing</Link></li>
                <li><Link href="#food" className="hover:text-primary">Food</Link></li>
                <li><Link href="#others" className="hover:text-primary">Others</Link></li>
              </ul>
            </nav>
          </header>
          <main className="flex-1 container mx-auto px-4 py-6">
            {children}
          </main>
          <footer className="bg-gray-100 dark:bg-gray-800 py-4 text-center text-sm">
            © {new Date().getFullYear()} DesiCart. All rights reserved.
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
