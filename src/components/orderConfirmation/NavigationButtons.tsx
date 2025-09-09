"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useT } from "@/hooks/useT";

export default function NavigationButtons() {
  const router = useRouter();
  const { t } = useT();

  const handleBackToShop = () => {
    router.push("/");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
      className="flex justify-center"
    >
      <button
        onClick={handleBackToShop}
        className="px-8 py-3 rounded-xl bg-gradient-to-r from-olive to-salvia text-beige font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        {t.orderConfirmation.navigation.backToShop}
      </button>
    </motion.div>
  );
}