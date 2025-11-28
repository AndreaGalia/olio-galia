import ProductCard from './ProductCard';
import { Product } from '@/types/products';
import { useT } from '@/hooks/useT';

interface ProductsGridProps {
  products: Product[];
  onAddToCart: (productId: string) => void;
}

interface ProductsGridProps {
  products: Product[];
  onAddToCart: (productId: string) => void;
}

export default function ProductsGrid({ products, onAddToCart }: ProductsGridProps) {
  const { t } = useT();

  return (
    <section className="pb-10 sm:pb-12 lg:pb-16">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-nocciola text-lg">{t.productsPage.noProducts}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {products.map((product, index) => (
              <ProductCard 
                key={product.id}
                product={product}
                index={index}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}