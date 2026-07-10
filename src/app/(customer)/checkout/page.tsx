'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import Image from 'next/image';
import { ShieldCheck, Truck, Lock, ChevronRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [address, setAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Redirect if cart empty or not logged in
  useEffect(() => {
    if (!authLoading && !user) router.push('/login?redirect=/checkout');
    if (!authLoading && cart.length === 0 && !orderSuccess) router.push('/shop');
  }, [user, authLoading, cart, router, orderSuccess]);

  if (authLoading || (!user && !orderSuccess) || (cart.length === 0 && !orderSuccess)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    setErrorMsg('');
    try {
      const rzpRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/payment/razorpay-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: cartTotal })
      });
      if (!rzpRes.ok) throw new Error('Failed to initialize payment');
      const rzpOrder = await rzpRes.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: "DesiCart",
        description: "Secure Checkout",
        order_id: rzpOrder.id,
        handler: async function (response: any) {
           try {
             const payload = {
                email: user?.email,
                items: cart.map(c => ({
                  productId: c.id,
                  name: c.name,
                  price: c.price,
                  qty: c.qty,
                  image: c.image
                })),
                total: cartTotal,
                shippingAddress: address,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature
             };
             const headers: Record<string, string> = { 'Content-Type': 'application/json' };
             if (user?.role && user?.email) {
               headers['Authorization'] = `Bearer ${user.role}_${user.email}`;
             }
             const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/orders`, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
             });
             if (!res.ok) throw new Error('Order creation failed');
             const data = await res.json();
             setOrderId(data._id);
             setOrderSuccess(true);
             clearCart();
           } catch(e) {
             setErrorMsg('Payment verified but failed to save order. Please contact support.');
           } finally {
             setIsProcessing(false);
           }
        },
        prefill: {
          name: address.fullName,
          email: user?.email,
          contact: address.phone
        },
        theme: {
          color: "#f97316"
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
         setErrorMsg(`Payment failed: ${response.error.description}`);
         setIsProcessing(false);
      });
      rzp.open();
    } catch (err) {
      setErrorMsg('Failed to place order. Please try again.');
      setIsProcessing(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl">
          <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-6" />
          <h1 className="text-3xl font-black text-white mb-2">Order Confirmed!</h1>
          <p className="text-slate-400 mb-6">Your order <span className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">{orderId}</span> has been placed successfully.</p>
          <Link
            href="/orders"
            className="w-full flex items-center justify-center py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors mb-3"
          >
            View Order History
          </Link>
          <Link
            href="/shop"
            className="w-full flex items-center justify-center py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white pb-20">
        {/* Checkout Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-tight">
            Checkout <span className="text-orange-500">Securely</span>
          </h1>
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <Lock size={16} /> SSL Secured
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Checkout Area */}
          <div className="flex-1 space-y-6">
            
            {/* Step 1: Address */}
            <div className={`bg-white dark:bg-slate-900 rounded-3xl border ${step === 1 ? 'border-orange-500 shadow-lg shadow-orange-500/10' : 'border-slate-200 dark:border-slate-800'}`}>
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center cursor-pointer" onClick={() => setStep(1)}>
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step === 1 ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>1</span>
                  Delivery Address
                </h2>
                {step > 1 && <span className="text-orange-500 text-sm font-semibold">Change</span>}
              </div>
              
              {step === 1 && (
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Full Name</label>
                      <input type="text" value={address.fullName} onChange={e => setAddress({...address, fullName: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Phone Number</label>
                      <input type="tel" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors" placeholder="+91 9876543210" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Full Address</label>
                    <textarea value={address.address} onChange={e => setAddress({...address, address: e.target.value})} rows={3} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors resize-none" placeholder="123 Main Street, Apt 4B..."></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">City</label>
                      <input type="text" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors" placeholder="Mumbai" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">PIN Code</label>
                      <input type="text" value={address.postalCode} onChange={e => setAddress({...address, postalCode: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors" placeholder="400001" />
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      const missing = [];
                      if (!address.fullName) missing.push('Full Name');
                      if (!address.phone) missing.push('Phone');
                      if (!address.address) missing.push('Address');
                      if (!address.city) missing.push('City');
                      if (!address.postalCode) missing.push('PIN Code');
                      if (missing.length > 0) {
                        setErrorMsg(`Please fill in: ${missing.join(', ')}`);
                        return;
                      }
                      setErrorMsg('');
                      setStep(2);
                    }}
                    className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl transition-colors"
                  >
                    Deliver to this Address
                  </button>
                </div>
              )}
              {step > 1 && (
                <div className="p-6 bg-slate-50 dark:bg-slate-800/30 text-sm text-slate-600 dark:text-slate-400">
                  <p className="font-semibold text-slate-900 dark:text-white mb-1">{address.fullName} ({address.phone})</p>
                  <p>{address.address}</p>
                  <p>{address.city}, {address.postalCode}</p>
                </div>
              )}
            </div>

            {/* Step 2: Payment & Review */}
            <div className={`bg-white dark:bg-slate-900 rounded-3xl border ${step === 2 ? 'border-orange-500 shadow-lg shadow-orange-500/10' : 'border-slate-200 dark:border-slate-800'}`}>
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step === 2 ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>2</span>
                  Review & Payment
                </h2>
              </div>
              {step === 2 && (
                <div className="p-6 space-y-6">
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden relative shrink-0">
                          {item.image ? (
                            <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-2 mb-1">{item.name}</h4>
                          <div className="flex justify-between items-end">
                            <p className="text-sm text-slate-500 font-medium">Qty: {item.qty}</p>
                            <p className="font-black text-slate-900 dark:text-white">₹{(item.price * item.qty).toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl p-4 flex items-start gap-3">
                    <ShieldCheck className="text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-blue-900 dark:text-blue-400">Powered by Razorpay</p>
                      <p className="text-sm text-blue-700 dark:text-blue-500/80">Your payment is processed securely via Razorpay. We never store your card details.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:w-96 shrink-0">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sticky top-24 shadow-sm">
              <h3 className="text-xl font-bold mb-6">Order Summary</h3>
              
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Items ({cart.length}):</span>
                  <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Delivery:</span>
                  <span className="text-emerald-500 font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Taxes:</span>
                  <span>Inclusive</span>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mb-6">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-slate-900 dark:text-white">Order Total:</span>
                  <span className="text-3xl font-black text-slate-900 dark:text-white">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
                  {errorMsg}
                </div>
              )}
              <button
                onClick={handlePlaceOrder}
                disabled={step !== 2 || isProcessing}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-lg py-4 rounded-xl transition-colors shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
              >
                {isProcessing ? 'Processing...' : 'Place Order'}
              </button>
              
              <div className="mt-6 flex flex-col gap-3 text-xs text-slate-500">
                <div className="flex gap-2">
                  <ShieldCheck size={16} className="text-slate-400 shrink-0" />
                  <p>Secure checkout powered by industry standard encryption.</p>
                </div>
                <div className="flex gap-2">
                  <Truck size={16} className="text-slate-400 shrink-0" />
                  <p>Guaranteed delivery within 3-5 business days across India.</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
}
