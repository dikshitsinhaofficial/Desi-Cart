'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, CheckCircle2, Trash2, Plus, Minus, CreditCard, Wallet as WalletIcon, Truck, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart, CartItem } from '@/lib/CartContext';
import API from '@/lib/api';

interface CartDrawerProps {
  showCart: boolean;
  setShowCart: (v: boolean) => void;
  walletBalance: number | null;
  fetchWallet: () => void;
}

export default function CartDrawer({ showCart, setShowCart, walletBalance, fetchWallet }: CartDrawerProps) {
  const { cart, cartTotal, cartCount, updateQty, removeFromCart, clearCart } = useCart();
  
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'payment' | 'success'>('cart');
  const [addressName, setAddressName] = useState('');
  const [addressEmail, setAddressEmail] = useState('');
  const [addressPhone, setAddressPhone] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressZip, setAddressZip] = useState('');
  
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'razorpay' | 'cod'>('wallet');
  const [formError, setFormError] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  const cartSubtotal = cart.reduce((sum, e) => sum + e.price * e.quantity, 0);
  const shippingFee = cartSubtotal > 1000 ? 0 : 49;

  const validateDetails = () => {
    if (!addressName || !addressEmail || !addressPhone || !addressStreet || !addressCity || !addressZip) {
      setFormError('Please fill out all delivery fields.');
      return false;
    }
    // Fixed phone validation using regex
    if (!/^[6-9]\d{9}$/.test(addressPhone)) {
      setFormError('Please enter a valid 10-digit Indian phone number.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(addressEmail)) {
      setFormError('Please enter a valid email address.');
      return false;
    }
    setFormError('');
    return true;
  };

  const handleCheckoutSubmit = async () => {
    if (cartTotal === 0) return;
    setCheckoutLoading(true);

    const addressObj = {
      name: addressName,
      email: addressEmail,
      phone: addressPhone,
      street: addressStreet,
      city: addressCity,
      zip: addressZip,
    };

    if (paymentMethod === 'cod') {
      setTimeout(() => {
        fireSuccessConfetti();
        setCompletedOrder({
          orderId: `DC-${Math.floor(100000 + Math.random() * 900000)}`,
          items: [...cart],
          total: cartTotal,
          shipping: shippingFee,
          address: addressObj,
          paymentMethod: 'Cash on Delivery (COD)',
          date: new Date().toLocaleDateString('en-IN', { dateStyle: 'long' }),
        });
        clearCart();
        setCheckoutStep('success');
        setCheckoutLoading(false);
      }, 1200);

    } else if (paymentMethod === 'wallet') {
      try {
        const walletRes = await fetch(`${API}/api/checkout/pay-with-wallet`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: cartTotal }),
        });
        const walletData = await walletRes.json();

        if (!walletData.success) {
          alert(walletData.message || 'Wallet transaction failed.');
          setCheckoutLoading(false);
          return;
        }

        fireSuccessConfetti();
        setCompletedOrder({
          orderId: `DC-${Math.floor(100000 + Math.random() * 900000)}`,
          items: [...cart],
          total: cartTotal,
          shipping: shippingFee,
          address: addressObj,
          paymentMethod: 'Desi Cart Wallet',
          date: new Date().toLocaleDateString('en-IN', { dateStyle: 'long' }),
        });
        fetchWallet();
        window.dispatchEvent(new Event('wallet-update'));

        clearCart();
        setCheckoutStep('success');
      } catch (err) {
        console.error(err);
        alert('Wallet payment error. Please try again.');
      } finally {
        setCheckoutLoading(false);
      }

    } else if (paymentMethod === 'razorpay') {
      try {
        const orderRes = await fetch(`${API}/api/checkout/create-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: cartTotal }),
        });
        const orderData = await orderRes.json();

        if (orderData.error) {
          alert('Please add real Razorpay Keys in backend/.env to process payments.');
          setCheckoutLoading(false);
          return;
        }

        const options = {
          key: orderData.key_id || 'rzp_test_placeholder',
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Desi Cart',
          description: 'Complete your purchase',
          image: '/logo.png',
          order_id: orderData.id,
          // Fixed hardcoded email
          prefill: { name: addressName, email: addressEmail, contact: addressPhone },
          theme: { color: '#f97316' },
          handler: async (response: any) => {
            const verifyRes = await fetch(`${API}/api/checkout/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: cartTotal,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              fireSuccessConfetti();
              setCompletedOrder({
                orderId: `DC-${Math.floor(100000 + Math.random() * 900000)}`,
                items: [...cart],
                total: cartTotal,
                shipping: shippingFee,
                address: addressObj,
                paymentMethod: 'Razorpay Online',
                date: new Date().toLocaleDateString('en-IN', { dateStyle: 'long' }),
              });
              clearCart();
              setCheckoutStep('success');
            } else {
              alert('Payment verification failed.');
            }
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', () => alert('Payment failed!'));
        rzp.open();
      } catch (err) {
        console.error(err);
      } finally {
        setCheckoutLoading(false);
      }
    }
  };

  const fireSuccessConfetti = () => {
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#f97316', '#fbbf24', '#22c55e'] });
  };

  // Keep internal drawer open state synced with prop
  if (!showCart) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={() => {
          if (checkoutStep !== 'success') setShowCart(false);
        }} 
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {checkoutStep !== 'cart' && checkoutStep !== 'success' && (
              <button onClick={() => setCheckoutStep(checkoutStep === 'payment' ? 'details' : 'cart')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors mr-1">
                ←
              </button>
            )}
            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Your Cart</h2>
              {checkoutStep === 'cart' && <p className="text-xs text-slate-500 font-medium">{cartCount} items</p>}
            </div>
          </div>
          <button onClick={() => setShowCart(false)} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Stepper logic */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          {cart.length === 0 && checkoutStep !== 'success' ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag size={40} className="text-orange-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">Your cart is empty</h3>
              <p className="text-slate-500 text-sm mb-8">Looks like you haven't added anything yet.</p>
              <button onClick={() => setShowCart(false)} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="p-6">
              {/* STEP 1: CART */}
              {checkoutStep === 'cart' && (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex gap-4">
                      <div className="w-20 h-20 bg-slate-50 rounded-xl overflow-hidden shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 py-1">
                        <p className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug mb-1">{item.name}</p>
                        <p className="text-xs text-orange-500 font-medium mb-2">{item.category}</p>
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-slate-900">₹{item.price.toLocaleString('en-IN')}</p>
                          <div className="flex items-center gap-3 bg-slate-100 px-2 py-1 rounded-lg">
                            <button onClick={() => updateQty(item.id, item.quantity - 1)} className="p-1 hover:bg-white rounded text-slate-600 shadow-sm transition-colors"><Minus size={14} /></button>
                            <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQty(item.id, item.quantity + 1)} className="p-1 hover:bg-white rounded text-slate-600 shadow-sm transition-colors"><Plus size={14} /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 2: DETAILS */}
              {checkoutStep === 'details' && (
                <div className="space-y-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                      <Truck size={20} className="text-orange-500" /> Delivery Address
                    </h3>
                    
                    {formError && (
                      <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100">
                        {formError}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Full Name</label>
                        <input value={addressName} onChange={e=>setAddressName(e.target.value)} placeholder="Raj Kumar" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all" />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Email</label>
                        <input value={addressEmail} onChange={e=>setAddressEmail(e.target.value)} type="email" placeholder="raj@example.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all" />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Phone Number</label>
                        <input value={addressPhone} onChange={e=>setAddressPhone(e.target.value)} placeholder="9876543210" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all" />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Street Address</label>
                        <textarea value={addressStreet} onChange={e=>setAddressStreet(e.target.value)} placeholder="123 Main St, Apt 4B" rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all resize-none" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">City</label>
                        <input value={addressCity} onChange={e=>setAddressCity(e.target.value)} placeholder="Mumbai" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">PIN Code</label>
                        <input value={addressZip} onChange={e=>setAddressZip(e.target.value)} placeholder="400001" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: PAYMENT */}
              {checkoutStep === 'payment' && (
                <div className="space-y-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                      <CreditCard size={20} className="text-orange-500" /> Payment Method
                    </h3>
                    
                    <div className="space-y-3">
                      {/* Wallet */}
                      <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'wallet' ? 'border-orange-500 bg-orange-50/50' : 'border-slate-100 hover:border-slate-200 bg-white'}`}>
                        <div className="pt-0.5">
                          <input type="radio" name="payment" value="wallet" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} className="w-4 h-4 text-orange-500 focus:ring-orange-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <WalletIcon size={18} className={paymentMethod === 'wallet' ? 'text-orange-600' : 'text-slate-500'} />
                            <span className="font-bold text-slate-800">Desi Cart Wallet</span>
                          </div>
                          <p className="text-xs text-slate-500">Pay using your platform wallet balance.</p>
                          <div className="mt-3 p-3 bg-slate-50 rounded-lg flex justify-between items-center border border-slate-100">
                            <span className="text-xs font-semibold text-slate-600">Available Balance:</span>
                            <span className={`text-sm font-bold ${walletBalance !== null && walletBalance >= cartTotal ? 'text-emerald-600' : 'text-red-500'}`}>
                              ₹{walletBalance?.toLocaleString('en-IN') ?? '0'}
                            </span>
                          </div>
                          {paymentMethod === 'wallet' && walletBalance !== null && walletBalance < cartTotal && (
                            <p className="text-xs text-red-500 mt-2 font-medium bg-red-50 px-2 py-1 rounded">Insufficient balance. Please top up or choose another method.</p>
                          )}
                        </div>
                      </label>

                      {/* Razorpay (Removed animate-pulse) */}
                      <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'razorpay' ? 'border-orange-500 bg-orange-50/50' : 'border-slate-100 hover:border-slate-200 bg-white'}`}>
                        <div className="pt-0.5">
                          <input type="radio" name="payment" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="w-4 h-4 text-orange-500 focus:ring-orange-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CreditCard size={18} className={paymentMethod === 'razorpay' ? 'text-orange-600' : 'text-slate-500'} />
                            <span className="font-bold text-slate-800">Online Payment</span>
                          </div>
                          <p className="text-xs text-slate-500">UPI, Credit/Debit Cards, NetBanking.</p>
                        </div>
                      </label>

                      {/* COD */}
                      <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-orange-500 bg-orange-50/50' : 'border-slate-100 hover:border-slate-200 bg-white'}`}>
                        <div className="pt-0.5">
                          <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-4 h-4 text-orange-500 focus:ring-orange-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Truck size={18} className={paymentMethod === 'cod' ? 'text-orange-600' : 'text-slate-500'} />
                            <span className="font-bold text-slate-800">Cash on Delivery</span>
                          </div>
                          <p className="text-xs text-slate-500">Pay in cash or UPI when your order arrives.</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: SUCCESS */}
              {checkoutStep === 'success' && completedOrder && (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-2 shadow-inner">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Order Confirmed!</h3>
                  <p className="text-slate-500 text-sm">Thank you for your purchase. We've received your order and will begin processing it right away.</p>
                  
                  <div className="w-full bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-left mt-6">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
                      <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Order ID</span>
                      <span className="text-sm font-bold text-slate-800">{completedOrder.orderId}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
                      <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Payment</span>
                      <span className="text-sm font-bold text-slate-800">{completedOrder.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Total Amount</span>
                      <span className="text-lg font-black text-emerald-600">₹{completedOrder.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <button onClick={() => { setShowCart(false); setCheckoutStep('cart'); }} className="w-full mt-6 px-6 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-lg">
                    Continue Shopping
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        {cart.length > 0 && checkoutStep !== 'success' && (
          <div className="px-6 py-5 bg-white border-t border-slate-100 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] shrink-0">
            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">₹{cartSubtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Shipping</span>
                <span className="font-semibold text-slate-800">
                  {shippingFee === 0 ? <span className="text-emerald-500 font-bold tracking-wide uppercase text-xs">Free</span> : `₹${shippingFee}`}
                </span>
              </div>
              {shippingFee > 0 && (
                <div className="text-[10px] text-orange-500 font-medium bg-orange-50 px-2 py-1 rounded text-center">
                  Add ₹{1000 - cartSubtotal} more for FREE shipping!
                </div>
              )}
              <div className="pt-3 border-t border-slate-100 flex justify-between items-end">
                <span className="text-base font-bold text-slate-800">Total</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-slate-900 leading-none">₹{cartTotal.toLocaleString('en-IN')}</span>
                  <p className="text-[10px] text-slate-400 mt-1">Inclusive of all taxes</p>
                </div>
              </div>
            </div>

            {checkoutStep === 'cart' && (
              <button onClick={() => setCheckoutStep('details')} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/30 transition-all text-sm tracking-wide">
                Proceed to Checkout
              </button>
            )}

            {checkoutStep === 'details' && (
              <button onClick={() => { if (validateDetails()) setCheckoutStep('payment'); }} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-900/20 transition-all text-sm tracking-wide">
                Continue to Payment
              </button>
            )}

            {checkoutStep === 'payment' && (
              <button 
                onClick={handleCheckoutSubmit}
                disabled={checkoutLoading || (paymentMethod === 'wallet' && walletBalance !== null && walletBalance < cartTotal)}
                className="w-full flex justify-center items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/30 transition-all text-sm tracking-wide"
              >
                {checkoutLoading ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Order'}
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
