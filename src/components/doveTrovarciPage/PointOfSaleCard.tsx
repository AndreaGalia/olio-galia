"use client";

import { forwardRef } from 'react';
import Link from 'next/link';
import { PointOfSalePublic } from '@/types/pointOfSale';

interface PointOfSaleCardProps {
  pointOfSale: PointOfSalePublic;
  categoryName?: string;
  isSelected: boolean;
  labels: {
    productsHere: string;
    directions: string;
    showOnMap: string;
  };
  onSelect: () => void;
}

/**
 * Link a Google Maps sulle coordinate esatte: apre l'app su mobile e il sito su
 * desktop. Usiamo lat/lng e non il nome per non rischiare che risolva il negozio
 * sbagliato.
 */
function directionsUrl(pointOfSale: PointOfSalePublic): string {
  const { lat, lng } = pointOfSale.coordinates;
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

const PointOfSaleCard = forwardRef<HTMLDivElement, PointOfSaleCardProps>(function PointOfSaleCard(
  { pointOfSale, categoryName, isSelected, labels, onSelect },
  ref
) {
  const { address } = pointOfSale;
  const addressLine = [
    address.street,
    [address.postalCode, address.city].filter(Boolean).join(' '),
    address.province ? `(${address.province})` : '',
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div
      ref={ref}
      className={`border-t transition-colors duration-300 ${
        isSelected ? 'border-olive bg-olive/5' : 'border-olive/20'
      }`}
    >
      {/* L'intera card è cliccabile: seleziona il punto e muove la mappa */}
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={isSelected}
        className="w-full text-left px-1 py-6 cursor-pointer group"
      >
        {categoryName && (
          <p className="text-[11px] tracking-[0.2em] uppercase text-black/40">{categoryName}</p>
        )}

        <h3
          className="mt-2 group-hover:text-olive transition-colors"
          style={{ fontSize: '15px', lineHeight: '1.4', letterSpacing: '0.12em' }}
        >
          {pointOfSale.name}
        </h3>

        <p className="mt-2 text-sm text-black/60 leading-relaxed">{addressLine}</p>

        {pointOfSale.notes && (
          <p className="mt-1 text-xs text-black/40 leading-relaxed">{pointOfSale.notes}</p>
        )}

        <span className="mt-3 inline-block text-[11px] tracking-[0.15em] uppercase text-black/40 underline underline-offset-2 group-hover:text-black transition-colors">
          {labels.showOnMap}
        </span>
      </button>

      {/* Prodotti disponibili e indicazioni: link veri, fuori dal button */}
      <div className="px-1 pb-6 space-y-4">
        {pointOfSale.products.length > 0 && (
          <div>
            <p className="text-[11px] tracking-[0.2em] uppercase text-black/40 mb-2">
              {labels.productsHere}
            </p>
            <div className="flex flex-wrap gap-2">
              {pointOfSale.products.map(product => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="px-3 py-1 border border-olive/20 text-xs tracking-wider text-black/70 hover:border-olive hover:text-olive transition-colors cursor-pointer"
                >
                  {product.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        <a
          href={directionsUrl(pointOfSale)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-xs tracking-wider text-black/40 underline underline-offset-2 hover:text-black transition-colors cursor-pointer"
        >
          {labels.directions}
        </a>
      </div>
    </div>
  );
});

export default PointOfSaleCard;
