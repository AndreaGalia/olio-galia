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
        className="px-8 py-3 bg-olive text-beige font-semibold transition-colors duration-300 border border-olive/20 uppercase tracking-wider cursor-pointer"
      >
        {t.orderConfirmation.navigation.backToShop}
      </button>
    </motion.div>
  );
}