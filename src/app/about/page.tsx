import Link from 'next/link';
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-6 py-20">
      <div className="max-w-2xl text-center">
        <span className="text-6xl mb-6 block">🛒</span>
        <h1 className="text-4xl font-black mb-4">About <span className="text-orange-400">DesiCart</span></h1>
        <p className="text-slate-400 leading-relaxed mb-4">DesiCart is India's fastest-growing e-commerce platform connecting local sellers with millions of shoppers. We believe in empowering Indian entrepreneurs and making quality products accessible to everyone.</p>
        <p className="text-slate-400 leading-relaxed mb-8">Founded with a mission to support local businesses, DesiCart offers a wide range of products — from electronics and fashion to groceries and home decor.</p>
        <Link href="/shop" className="inline-block px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-orange-500/20">Start Shopping</Link>
      </div>
    </div>
  );
}
