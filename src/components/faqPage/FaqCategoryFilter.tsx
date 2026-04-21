interface FaqCategoryFilterProps {
  categories: string[];
  activeCategory: string | null;
  allLabel: string;
  onSelect: (category: string | null) => void;
}

export default function FaqCategoryFilter({
  categories,
  activeCategory,
  allLabel,
  onSelect,
}: FaqCategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <button
        onClick={() => onSelect(null)}
        className={`px-4 py-1.5 font-serif termina-11 tracking-[0.2em] uppercase transition-colors duration-200 cursor-pointer border ${
          activeCategory === null
            ? 'border-olive bg-olive text-beige'
            : 'border-olive/20 text-black hover:border-olive/40'
        }`}
      >
        {allLabel}
      </button>

      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={`px-4 py-1.5 font-serif termina-11 tracking-[0.2em] uppercase transition-colors duration-200 cursor-pointer border ${
            activeCategory === category
              ? 'border-olive bg-olive text-beige'
              : 'border-olive/20 text-black hover:border-olive/40'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
