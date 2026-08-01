"use client";

import { POSCategoryPublic } from '@/types/pointOfSale';

interface CategoryFilterProps {
  categories: POSCategoryPublic[];
  activeCategory: string | null;
  allLabel: string;
  totalCount: number;
  onSelect: (categoryId: string | null) => void;
}

export default function CategoryFilter({
  categories,
  activeCategory,
  allLabel,
  totalCount,
  onSelect,
}: CategoryFilterProps) {
  const buttonClass = (isActive: boolean) =>
    `px-4 py-1.5 font-serif termina-11 tracking-[0.2em] uppercase transition-colors duration-200 cursor-pointer border ${
      isActive
        ? 'border-olive bg-olive text-beige'
        : 'border-olive/20 text-black hover:border-olive/40'
    }`;

  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={() => onSelect(null)} className={buttonClass(activeCategory === null)}>
        {allLabel} ({totalCount})
      </button>

      {categories.map(category => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={buttonClass(activeCategory === category.id)}
        >
          {category.name} ({category.count})
        </button>
      ))}
    </div>
  );
}
