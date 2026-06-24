import { Suspense } from 'react';
import ShopClient from './ShopClient';

export const dynamic = 'force-dynamic';

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200">
        <div className="flex flex-col items-center gap-4">
          <span className="animate-spin inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
          <p className="text-sm font-bold animate-pulse text-slate-500">Loading Desi-Cart Shop...</p>
        </div>
      </div>
    }>
      <ShopClient />
    </Suspense>
  );
}
