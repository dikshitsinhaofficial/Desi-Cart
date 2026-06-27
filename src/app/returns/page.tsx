import Link from 'next/link';
export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <Link href="/shop" className="text-sm text-slate-400 hover:text-orange-400 transition-colors mb-8 inline-block">← Back to Shop</Link>
        <h1 className="text-4xl font-black mb-2">Returns <span className="text-orange-400">Centre</span></h1>
        <p className="text-slate-400 mb-10">Easy, hassle-free returns within 7 days.</p>
        <div className="space-y-6">
          {[
            { step: '1', title: 'Initiate Return', desc: 'Go to your order history and click "Return Item" next to the product.' },
            { step: '2', title: 'Pack the Item', desc: 'Pack the product securely in its original packaging with all accessories.' },
            { step: '3', title: 'Schedule Pickup', desc: 'Our delivery partner will pick up the package from your address.' },
            { step: '4', title: 'Get Refund', desc: 'Refund is processed within 3-5 business days after we receive the item.' },
          ].map(step => (
            <div key={step.step} className="flex gap-5 items-start bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center font-black text-white shrink-0">{step.step}</div>
              <div>
                <h3 className="font-bold text-white mb-1">{step.title}</h3>
                <p className="text-slate-400 text-sm">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
