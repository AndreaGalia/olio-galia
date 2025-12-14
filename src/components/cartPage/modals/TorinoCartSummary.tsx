"use client";

import { motion } from "framer-motion";
import { useT } from "@/hooks/useT";
import { Product } from "@/types/products";

interface TorinoCartSummaryProps {
  cart: { id: string; quantity: number }[];
  products: Product[];
}

export default function TorinoCartSummary({ cart, products }: TorinoCartSummaryProps) {
  const { t } = useT();

  const cartItems = cart.map((c) => {
    const product = products.find((p) => p.id === c.id);
    return { ...product, quantity: c.quantity };
  });

  return (
    <div className="mb-8">
      <h3 className="text-xl font-serif text-olive mb-4 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
        </svg>
        {t.torinoCheckout.modal.cartSummary.title}
      </h3>
      <div className="bg-white border border-nocciola/20 overflow-hidden">
        {cartItems.map((item, idx) =>
          item ? (
            <motion.div
              key={idx}
              className="flex justify-between items-center p-4 hover:bg-beige/50 transition-colors border-b border-nocciola/10 last:border-b-0"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <span className="text-gray-800 font-medium">{item.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t.torinoCheckout.modal.cartSummary.quantity}</span>
                <span className="bg-olive/10 text-olive px-2 py-1 border border-olive/20 text-sm font-semibold">
                  {item.quantity}
                </span>
              </div>
            </motion.div>
          ) : null
        )}
      </div>
    </div>
  );
}