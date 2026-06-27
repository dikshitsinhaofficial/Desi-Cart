import Link from 'next/link';
export default function ProtectionPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <Link href="/shop" className="text-sm text-slate-400 hover:text-orange-400 transition-colors mb-8 inline-block">← Back to Shop</Link>
        <h1 className="text-4xl font-black mb-2">100% Purchase <span className="text-orange-400">Protection</span></h1>
        <p className="text-slate-400 mb-10">Shop with complete confidence.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { icon: '🔒', title: 'Secure Payments', desc: 'All transactions are encrypted and processed through Razorpay — a PCI-DSS Level 1 certified gateway.' },
            { icon: '✅', title: 'Verified Sellers', desc: 'Every seller on DesiCart goes through identity verification before listing products.' },
            { icon: '↩️', title: '7-Day Returns', desc: 'Not happy with your purchase? Return it within 7 days for a full refund — no questions asked.' },
            { icon: '📞', title: '24/7 Support', desc: 'Our customer support team is available around the clock to help you with any issue.' },
          ].map(card => (
            <div key={card.title} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="text-4xl mb-4">{card.icon}</div>
              <h3 className="font-bold text-white mb-2">{card.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
