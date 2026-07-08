"use client";
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useT } from '@/hooks/useT';
import type { ActivePromotion } from '@/types/promotionCampaign';

// Striscia promozionale sotto la hero: visibile solo se almeno un prodotto
// ha una campagna attiva. Con più campagne mostra quella che termina prima.
export default function PromoBanner() {
  const { products } = useProducts();
  const { t } = useT();
  const [now, setNow] = useState(() => Date.now());

  const promo = useMemo<ActivePromotion | null>(() => {
    const byCampaign = new Map<string, ActivePromotion>();
    for (const product of products) {
      if (product.activePromotion) {
        byCampaign.set(product.activePromotion.campaignId, product.activePromotion);
      }
    }
    const promotions = [...byCampaign.values()];
    if (promotions.length === 0) return null;
    return promotions.reduce((soonest, candidate) =>
      new Date(candidate.endsAt) < new Date(soonest.endsAt) ? candidate : soonest
    );
  }, [products]);

  // Aggiorna il countdown ogni 30 secondi
  useEffect(() => {
    if (!promo) return;
    const interval = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, [promo]);

  if (!promo) return null;

  const remainingMs = new Date(promo.endsAt).getTime() - now;
  if (remainingMs <= 0) return null;

  const totalMinutes = Math.floor(remainingMs / 60_000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  const countdown =
    days > 0
      ? `${t.promo.endsIn} ${days}${t.promo.days} ${hours}${t.promo.hours}`
      : hours > 0
        ? `${t.promo.endsIn} ${hours}${t.promo.hours} ${minutes}${t.promo.minutes}`
        : minutes > 0
          ? `${t.promo.endsIn} ${minutes}${t.promo.minutes}`
          : t.promo.lastDay;

  return (
    <Link
      href="/products"
      className="block bg-olive hover:bg-sabbia transition-colors duration-300 group"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-[var(--container-wide)] py-4 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-6 text-center">
        <span className="font-serif termina-11 tracking-[1px] sm:tracking-[3.4px] uppercase text-beige group-hover:text-olive transition-colors duration-300">
          {promo.label}
        </span>
        <span className="font-serif termina-9 tracking-[1px] sm:tracking-[3.4px] uppercase text-beige/70 group-hover:text-olive/70 transition-colors duration-300">
          {countdown}
        </span>
      </div>
    </Link>
  );
}
