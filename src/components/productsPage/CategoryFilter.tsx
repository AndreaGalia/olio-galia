import { Category } from '@/types/products';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export default function CategoryFilter({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
      <div className="flex justify-between overflow-x-auto mb-16 sm:mb-20 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`text-[11px] tracking-[0.2em] uppercase transition-colors duration-200 cursor-pointer ${
              selectedCategory === category.id
                ? 'text-black underline underline-offset-4 decoration-black'
                : 'text-black/40 hover:text-black'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}