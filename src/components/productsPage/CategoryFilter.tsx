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
      <div className={`flex flex-wrap justify-center gap-3 mb-8 sm:mb-10 ${styles.animateFadeInSlow}`}>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-medium transition-all duration-300 cursor-pointer hover:scale-105 ${
              selectedCategory === category.id
                ? 'bg-olive text-beige shadow-lg scale-105'
                : 'bg-white/80 text-nocciola hover:bg-olive/10 hover:text-olive'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}