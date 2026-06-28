import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Star, Truck, ShieldCheck, ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';
import AddToCartButton from './AddToCartButton';
import WishlistButton from './WishlistButton';
import ReviewSection from './ReviewSection';
import { Metadata } from 'next';

async function getProduct(id: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/${id}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await getProduct(params.id);
  if (!product) return {};
  return {
    title: `${product.name} | DesiCart`,
    description: product.description || `Buy ${product.name} on DesiCart. Best local products.`,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.image ? [{ url: product.image }] : [],
    }
  };
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  if (!product) notFound();

  const discPct = product.mrp > product.price
    ? Math.round((1 - product.price / product.mrp) * 100)
    : 0;

  const cartProduct = {
    id:       String(product._id),
    name:     product.name,
    category: product.category,
    price:    product.price,
    mrp:      product.mrp,
    rating:   product.rating || 0,
    reviews:  product.reviews || 0,
    image:    product.image,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/shop"
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-orange-500 mb-8 transition-colors gap-1"
      >
        <ArrowLeft size={16} /> Back to Shop
      </Link>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-10">
        {/* Image */}
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="w-full max-w-md aspect-square relative bg-slate-50 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 flex items-center justify-center">
            {product.image ? (
              <Image src={product.image} alt={product.name} fill className="object-cover" unoptimized />
            ) : (
              <Package size={80} className="text-slate-300" />
            )}
          </div>
        </div>

        {/* Details */}
        <div className="w-full md:w-1/2 flex flex-col">
          <span className="text-orange-500 text-sm font-bold uppercase tracking-wider mb-2">
            {product.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
            {product.name}
          </h1>

          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-850 flex-wrap">
            {product.rating > 0 && (
              <div className="flex items-center gap-1.5">
                <Star size={16} fill="#f59e0b" className="text-amber-400" />
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{product.rating.toFixed(1)}</span>
                <span className="text-sm text-slate-500">({product.reviews} reviews)</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-slate-500">
              Sold by:
              <span className="font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                {product.sellerName || 'DesiCart'}
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="mb-8">
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-4xl font-black text-slate-900 dark:text-white">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {discPct > 0 && (
                <>
                  <span className="text-lg text-slate-400 line-through">
                    ₹{product.mrp.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm font-bold text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-lg">
                    -{discPct}% OFF
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-slate-400">Inclusive of all taxes</p>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-8">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2 text-sm uppercase tracking-wider">Description</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-emerald-50 dark:bg-emerald-500/5 rounded-xl p-3 flex items-center gap-3 border border-emerald-100 dark:border-emerald-500/10">
              <ShieldCheck size={20} className="text-emerald-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-900 dark:text-emerald-400">1 Year Warranty</p>
                <p className="text-[10px] text-emerald-700 dark:text-emerald-500/80">Brand authorized</p>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-500/5 rounded-xl p-3 flex items-center gap-3 border border-blue-100 dark:border-blue-500/10">
              <Truck size={20} className="text-blue-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-blue-900 dark:text-blue-400">Free Delivery</p>
                <p className="text-[10px] text-blue-700 dark:text-blue-500/80">On orders above ₹1000</p>
              </div>
            </div>
          </div>

          {/* Add to Cart — client component */}
          <div className="mt-auto flex items-center gap-3">
            <div className="flex-1">
              <AddToCartButton product={cartProduct} />
            </div>
            <WishlistButton product={cartProduct} />
          </div>
        </div>
      </div>

      <ReviewSection productId={params.id} initialReviews={product.reviewList || []} initialRating={product.rating || 0} />
    </div>
  );
}
