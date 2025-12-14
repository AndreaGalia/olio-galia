import { Category } from '@/types/products';
import styles from '../../styles/ProductsPage.module.css';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export default function CategoryFilter({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
      <div className={`grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-3 mb-16 sm:mb-20 ${styles.animateFadeInSlow}`}>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`px-4 sm:px-6 py-3 text-sm sm:text-base font-medium transition-all duration-300 cursor-pointer border ${
              selectedCategory === category.id
                ? 'bg-olive text-beige border-olive/20'
                : 'bg-white text-nocciola border-olive/10 hover:bg-olive/10 hover:text-olive'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}