// components/FAQ/CategoryPills.tsx
interface CategoryPillsProps {
  categories: string[];
}

export default function CategoryPills({ categories }: CategoryPillsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12">
      {categories.map((category) => (
        <div 
          key={category}
          className="bg-white/80 text-nocciola px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium shadow-sm border border-olive/10"
        >
          {category}
        </div>
      ))}
    </div>
  );
}