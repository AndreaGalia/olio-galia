"use client";

import { PointOfSalePublic, POSCategoryPublic } from '@/types/pointOfSale';
import PointOfSaleCard from './PointOfSaleCard';

interface PointOfSaleListProps {
  pointsOfSale: PointOfSalePublic[];
  categories: POSCategoryPublic[];
  selectedId: string | null;
  labels: {
    productsHere: string;
    directions: string;
    showOnMap: string;
  };
  onSelect: (id: string) => void;
  /** Registra il nodo della card per poterla portare in vista dalla mappa */
  registerCardRef: (id: string, node: HTMLDivElement | null) => void;
}

export default function PointOfSaleList({
  pointsOfSale,
  categories,
  selectedId,
  labels,
  onSelect,
  registerCardRef,
}: PointOfSaleListProps) {
  const categoryName = (categoryId: string) =>
    categories.find(category => category.id === categoryId)?.name;

  return (
    <div>
      {pointsOfSale.map(pointOfSale => (
        <PointOfSaleCard
          key={pointOfSale.id}
          ref={node => registerCardRef(pointOfSale.id, node)}
          pointOfSale={pointOfSale}
          categoryName={categoryName(pointOfSale.categoryId)}
          isSelected={selectedId === pointOfSale.id}
          labels={labels}
          onSelect={() => onSelect(pointOfSale.id)}
        />
      ))}
      <div className="border-t border-olive/20" />
    </div>
  );
}
