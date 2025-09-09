"use client";

import { motion } from "framer-motion";
import { useT } from "@/hooks/useT";

export default function OrderFooter() {
  const { t } = useT();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2 }}
      className="mt-8 text-center"
    >
      <p className="text-sm text-gray-500 bg-white/50 rounded-xl p-4 border border-nocciola/20">
        💚 {t.orderConfirmation.footer}
      </p>
    </motion.div>
  );
}