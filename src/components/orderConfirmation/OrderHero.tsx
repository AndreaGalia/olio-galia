"use client";

import { motion } from "framer-motion";
import { useT } from "@/hooks/useT";

interface OrderHeroProps {
  orderId: string;
}

export default function OrderHero({ orderId }: OrderHeroProps) {
  const { t } = useT();

  return (
    <div className="bg-olive/5 p-8 text-center border-b border-olive/10">
      <h1 className="text-4xl font-serif text-olive mb-3">
        {t.orderConfirmation.hero.title}
      </h1>
      <p className="text-lg text-nocciola">
        {t.orderConfirmation.hero.subtitle}
      </p>
    </div>
  );
}