"use client";

import { motion } from "framer-motion";
import { useT } from "@/hooks/useT";

interface OrderHeroProps {
  orderId: string;
}

export default function OrderHero({ orderId }: OrderHeroProps) {
  const { t } = useT();

  return (
    <div className="bg-gradient-to-r from-olive/5 to-salvia/5 p-8 text-center border-b border-nocciola/20">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
        className="w-16 h-16 bg-gradient-to-r from-olive to-salvia rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <svg className="w-8 h-8 text-beige" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </motion.div>
      
      <h1 className="text-4xl font-serif text-olive mb-3">
        {t.orderConfirmation.hero.title}
      </h1>
      <div className="w-24 h-0.5 bg-gradient-to-r from-olive to-salvia rounded-full mx-auto mb-4"></div>
      <p className="text-lg text-gray-600">
        {t.orderConfirmation.hero.subtitle}
      </p>
    </div>
  );
}