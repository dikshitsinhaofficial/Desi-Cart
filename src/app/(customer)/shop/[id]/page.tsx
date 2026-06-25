import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Star, Truck, ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Helper to fetch single product on the server
async function getProduct(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/${id}`, {
      next: { revalidate: 60 } // optional cache configuration
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  const discPct = product.mrp > product.price ? Math.round((1 - product.price / product.mrp) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/shop" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-orange-500 mb-8 transition-colors">
        <ArrowLeft size={16} className="mr-1" /> Back to Shop
      </Link>

      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-10">
        
        {/* Left: Image */}
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="w-full aspect-square relative bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center">
            {product.image ? (
              <Image src={product.image} alt={product.name} fill className="object-cover" unoptimized />
            ) : (
              <div className="text-8xl">📦</div>
            )}
          </div>
        </div>

        {/* Right: Details */}
        <div className="w-full md:w-1/2 flex flex-col justify-start">
          <div className="mb-2">
            <span className="text-orange-500 text-sm font-bold uppercase tracking-wider">{product.category}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 leading-tight">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
            {product.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star size={18} fill="#f59e0b" className="text-amber-400" />
                <span className="text-sm font-bold text-slate-800">{product.rating.toFixed(1)}</span>
                <span className="text-sm text-slate-500">({product.reviews} reviews)</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Sold by:</span>
              <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{product.sellerName || 'Anonymous Seller'}</span>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-4xl font-black text-slate-900">₹{product.price.toLocaleString('en-IN')}</span>
              {discPct > 0 && (
                <>
                  <span className="text-lg text-slate-400 line-through">₹{product.mrp.toLocaleString('en-IN')}</span>
                  <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">-{discPct}% OFF</span>
                </>
              )}
            </div>
            <p className="text-sm text-slate-500">Inclusive of all taxes</p>
          </div>

          <div className="mb-8">
            <h3 className="font-bold text-slate-800 mb-2">Product Description</h3>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
              {product.description || 'No description available for this product.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-emerald-50 rounded-xl p-4 flex items-start gap-3">
              <ShieldCheck className="text-emerald-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-900 mb-0.5">1 Year Warranty</p>
                <p className="text-[10px] text-emerald-700">Brand authorized</p>
              </div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
              <Truck className="text-blue-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-blue-900 mb-0.5">Free Delivery</p>
                <p className="text-[10px] text-blue-700">On orders above ₹1000</p>
              </div>
            </div>
          </div>

          <div className="mt-auto">
            {/* Note: The actual "Add to Cart" functionality should be handled by a client component in a real app,
                or we can wrap the button in a small client component. For now, since it's a server component,
                we provide a message. */}
             <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl text-orange-800 text-sm text-center">
                Please return to the Shop page to add items to your cart.
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
