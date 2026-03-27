"use client";

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
    <div className="mb-6">
      <p className="text-[11px] tracking-[0.2em] uppercase text-black/40 mb-3">
        {t.torinoCheckout.modal.cartSummary.title}
      </p>
      <div className="border-t border-black/10">
        {cartItems.map((item, idx) =>
          item ? (
            <div
              key={idx}
              className="flex justify-between items-center py-3 border-b border-black/10"
            >
              <span className="text-sm text-black/70">{item.name}</span>
              <span className="text-xs text-black/40">
                {t.torinoCheckout.modal.cartSummary.quantity} {item.quantity}
              </span>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
