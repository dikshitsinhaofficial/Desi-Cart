import Link from 'next/link';
export default function HelpPage() {
  const faqs = [
    { q: 'How do I track my order?', a: 'After placing an order, you will receive an email with a tracking link. You can also check your order status in your account.' },
    { q: 'What is the return policy?', a: 'We offer a 7-day no-questions-asked return policy on most items. Simply initiate a return from the Returns Centre.' },
    { q: 'How do I become a seller?', a: 'Register with the "Seller" role on our login page, then use the Seller Portal to list your products.' },
    { q: 'Is my payment information safe?', a: 'Yes! We use Razorpay, a PCI-DSS compliant payment gateway. We never store your card details.' },
    { q: 'How long does delivery take?', a: 'Standard delivery takes 3-5 business days. Express delivery (1-2 days) is available in select cities.' },
  ];
  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <Link href="/shop" className="text-sm text-slate-400 hover:text-orange-400 transition-colors mb-8 inline-block">← Back to Shop</Link>
        <h1 className="text-4xl font-black mb-2">Help <span className="text-orange-400">Centre</span></h1>
        <p className="text-slate-400 mb-10">Frequently asked questions</p>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="font-bold text-white mb-2">{faq.q}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
