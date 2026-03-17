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
    <div className="flex flex-wrap gap-2 sm:gap-3 mb-8 sm:mb-10">
      <button
        onClick={() => onSelect(null)}
        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors duration-200 cursor-pointer ${
          activeCategory === null
            ? 'bg-olive text-white'
            : 'bg-white/80 text-black border border-olive/10 hover:bg-olive/10'
        }`}
      >
        {allLabel}
      </button>

      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors duration-200 cursor-pointer ${
            activeCategory === category
              ? 'bg-olive text-white'
              : 'bg-white/80 text-black border border-olive/10 hover:bg-olive/10'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
