"use client";

import { motion } from "motion/react";

interface Props {
  title: { name: string; description: string };
  onClose: () => void;
}

export function TitleAward({ title, onClose }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 24, delay: 0.1 }}
        className="bg-[#FFFF00] rounded-3xl p-8 max-w-sm mx-4 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.3, stiffness: 400, damping: 15 }}
          className="text-6xl mb-4 select-none"
        >
          👑
        </motion.div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-600 mb-2">
          称号獲得
        </p>
        <h2
          className="text-3xl font-black text-black mb-3 leading-tight"
          style={{ fontFamily: "var(--font-bebas-neue), 'Bebas Neue', sans-serif" }}
        >
          {title.name}
        </h2>
        <p className="text-sm text-gray-700 mb-6 leading-relaxed">{title.description}</p>
        <button
          onClick={onClose}
          className="w-full py-3.5 bg-black text-[#FFFF00] font-black text-base rounded-2xl hover:bg-gray-900 transition-colors active:scale-95"
        >
          受け取る ✓
        </button>
      </motion.div>
    </motion.div>
  );
}
