"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, IndianRupee, Loader2, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";
import API from "../../lib/api";

interface TopUpModalProps {
  onClose: () => void;
  onSuccess: (balance: number) => void;
}

// Typed Razorpay response — replaces `any`
interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: new (options: object) => { open: () => void };
  }
}

export default function TopUpModal({ onClose, onSuccess }: TopUpModalProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleTopUp = async () => {
    if (!amount || isNaN(Number(amount))) return;

    setLoading(true);
    try {
      // 1. Create Order in Backend
      const orderRes = await fetch(`${API}/api/wallet/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount) }),
      });
      const orderData = await orderRes.json();

      if (orderData.error) {
        alert("Please add real Razorpay Keys in backend/.env to process payments.");
        setLoading(false);
        return;
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: orderData.key_id || "rzp_test_placeholder",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Desi Cart Wallet",
        description: "Add money to your Desi Cart Wallet",
        image: "/logo.png",
        order_id: orderData.id,
        prefill: {
          name: "Desi Cart User",
          email: "user@desicart.com",
          contact: "9999999999",
        },
        config: {
          display: {
            blocks: {
              utib: { name: "Pay via UPI", instruments: [{ method: "upi" }] },
              card: { name: "Pay via Card", instruments: [{ method: "card" }] },
              nb: { name: "Net Banking", instruments: [{ method: "netbanking" }] },
              wallet: { name: "Wallets", instruments: [{ method: "wallet" }] },
            },
            sequence: ["block.utib", "block.card", "block.nb", "block.wallet"],
            preferences: { show_default_blocks: true },
          },
        },
        handler: async (response: RazorpayResponse) => {
          // 3. Verify Payment
          const verifyRes = await fetch(`${API}/api/wallet/verify-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: Number(amount),
            }),
          });
          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            setSuccess(true);
            confetti({
              particleCount: 150,
              spread: 70,
              origin: { y: 0.6 },
              colors: ["#f97316", "#fbbf24", "#ffffff"],
            });
            setTimeout(() => {
              onSuccess(verifyData.balance);
            }, 2000);
          }
        },
        theme: { color: "#f97316" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="p-8">
          {success ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-green-500"
              >
                <CheckCircle2 size={80} />
              </motion.div>
              <h2 className="text-2xl font-bold dark:text-white">Top-up Successful!</h2>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Your wallet balance has been updated. Ready to shop!
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Top-up Wallet</h2>
                <p className="text-gray-500 dark:text-gray-400">Add funds to your Desi Cart wallet instantly.</p>
              </div>

              <div className="space-y-6">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <IndianRupee size={20} />
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount (e.g. 500)"
                    className="w-full bg-gray-100 dark:bg-gray-700/50 border-none rounded-2xl py-4 pl-12 pr-4 text-lg font-semibold focus:ring-2 focus:ring-orange-500 dark:text-white transition-all outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[100, 500, 1000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmount(amt.toString())}
                      className="py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:text-gray-300 hover:border-orange-500 hover:text-orange-500 transition-all font-medium"
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleTopUp}
                  disabled={loading || !amount}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>Proceed to Pay ₹{amount || "0"}</>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-4 border-t border-gray-100 dark:border-gray-700 text-center text-xs text-gray-400">
          Secured by Razorpay. 256-bit SSL encrypted.
        </div>
      </motion.div>
    </div>
  );
}
