"use client";

import { motion } from "framer-motion";
import { useT } from "@/hooks/useT";

interface OrderNumberProps {
  orderId: string;
}

export default function OrderNumber({ orderId }: OrderNumberProps) {
  const { t } = useT();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-olive/10 rounded-xl p-4 mb-6 border border-olive/20"
    >
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-olive/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-3 h-3 text-olive" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h3v-7h6v7h3a1 1 0 001-1V7l-7-5z" />
          </svg>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">{t.orderConfirmation.hero.orderNumber}</p>
          <p className="font-mono text-lg font-semibold text-olive bg-white px-3 py-1 rounded-lg inline-block">
            #{orderId}
          </p>
        </div>
      </div>
    </motion.div>
  );
}