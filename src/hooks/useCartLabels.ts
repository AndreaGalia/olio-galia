// hooks/useCartLabels.ts
import { useMemo } from 'react';
import { useT } from '@/hooks/useT';

export function useCartLabels(totalItems: number) {
  const { t } = useT();

  return useMemo(() => ({
    itemCountLabel: totalItems === 1 ? t.cartPage.itemCount.single : t.cartPage.itemCount.plural,
    itemLabel: totalItems === 1 ? t.cartPage.itemLabel.single : t.cartPage.itemLabel.plural
  }), [totalItems, t.cartPage]);
}