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
      className="bg-olive/10 p-4 mb-6 border border-olive/20 text-center"
    >
      <p className="text-sm text-nocciola mb-2">{t.orderConfirmation.hero.orderNumber}</p>
      <p className="font-mono text-sm sm:text-lg font-semibold text-olive bg-beige px-3 py-1 inline-block border border-olive/10 break-all">
        #{orderId}
      </p>
    </motion.div>
  );
}