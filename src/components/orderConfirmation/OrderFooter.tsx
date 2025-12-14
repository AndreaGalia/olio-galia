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
      <p className="text-sm text-nocciola bg-beige/50 p-4 border border-olive/10">
        {t.orderConfirmation.footer}
      </p>
    </motion.div>
  );
}