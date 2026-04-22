import HomepageProductCard from '@/components/homepage/sections/products/HomepageProductCard';
import { Product } from '@/types/products';
import { useT } from '@/hooks/useT';

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
            <p className="text-black text-lg">{t.productsPage.noProducts}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
            {products.map((product) => (
              <HomepageProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                compact
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}