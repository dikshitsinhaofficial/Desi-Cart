"use client";

import React, { useState, useEffect } from "react";
import { Wallet as WalletIcon, Plus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TopUpModal from "./TopUpModal";
import API from "../../lib/api";

export default function Wallet() {
  const [balance, setBalance] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchBalance = async () => {
    try {
      const res = await fetch(`${API}/api/wallet`);
      const data = await res.json();
      setBalance(data.balance);
    } catch (err) {
      console.error("Failed to fetch wallet", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    window.addEventListener("wallet-update", fetchBalance);
    return () => {
      window.removeEventListener("wallet-update", fetchBalance);
    };
  }, []);

  return (
    <div className="relative">
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="flex items-center gap-3 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700 p-1.5 pr-4 rounded-full shadow-lg"
      >
        <div className="bg-violet-650 p-2 rounded-full text-white shadow-inner">
          <WalletIcon size={18} />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">
            Wallet Balance
          </span>
          <div className="flex items-center gap-2">
            {loading ? (
              <Loader2 size={14} className="animate-spin text-violet-500" />
            ) : (
              <span className="font-bold text-gray-800 dark:text-white">
                ₹{balance?.toLocaleString() ?? '0'}
              </span>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-violet-600 hover:bg-violet-700 p-0.5 rounded-full text-white transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <TopUpModal
            onClose={() => setIsModalOpen(false)}
            onSuccess={(newBalance) => {
              setBalance(newBalance);
              setIsModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
