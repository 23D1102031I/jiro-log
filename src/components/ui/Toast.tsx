"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

const typeConfig: Record<
  ToastType,
  { bg: string; icon: React.ReactNode; border: string }
> = {
  success: {
    bg: "bg-green-500",
    border: "border-green-600",
    icon: <CheckCircle className="w-5 h-5 text-white" />,
  },
  error: {
    bg: "bg-red-500",
    border: "border-red-600",
    icon: <AlertCircle className="w-5 h-5 text-white" />,
  },
  info: {
    bg: "bg-[#FFFF00]",
    border: "border-yellow-400",
    icon: <Info className="w-5 h-5 text-black" />,
  },
};

export function Toast({ toasts, onRemove }: ToastProps) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const config = typeConfig[toast.type];
          const isInfo = toast.type === "info";
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${config.bg} ${config.border} min-w-[260px] max-w-sm`}
            >
              {config.icon}
              <span
                className={`flex-1 text-sm font-medium ${
                  isInfo ? "text-black" : "text-white"
                }`}
              >
                {toast.message}
              </span>
              <button
                onClick={() => onRemove(toast.id)}
                className={`ml-1 rounded-full p-0.5 transition-colors ${
                  isInfo
                    ? "hover:bg-yellow-300 text-black"
                    : "hover:bg-white/20 text-white"
                }`}
                aria-label="閉じる"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
