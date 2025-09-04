import Link from 'next/link';
import { useT } from '@/hooks/useT';
import type { Product } from '@/types/products';

interface RelatedProductsSectionProps {
  products: Product[];
}

export default function RelatedProductsSection({ products }: RelatedProductsSectionProps) {
  const { t } = useT();

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-serif text-olive mb-8 text-center">
        {t.productDetailPage.product.relatedProducts}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {products.map((related) => {
          const relatedIsOutOfStock = !related.inStock || related.stockQuantity === 0;
          
          return (
            <Link key={related.id} href={`/products/${related.slug}`}>
              <div className={`bg-white/90 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer relative ${
                relatedIsOutOfStock ? 'opacity-75 grayscale' : ''
              }`}>
                {/* Badge SOLD OUT per prodotti correlati */}
                {relatedIsOutOfStock && (
                  <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-gradient-to-r from-red-600 to-red-700 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-bold z-10 shadow-lg">
                    SOLD OUT
                  </div>
                )}
                
                <div className={`w-16 sm:w-20 h-20 sm:h-24 bg-gradient-to-br from-olive/20 to-salvia/20 rounded-lg mx-auto mb-3 sm:mb-4 relative flex items-center justify-center ${
                  relatedIsOutOfStock ? 'opacity-60' : ''
                }`}>
                  <img 
                    src={related.images[0]} 
                    alt={related.name} 
                    className={`w-full h-full object-contain rounded-lg ${
                      relatedIsOutOfStock ? 'opacity-60' : ''
                    }`}
                  />
                  {/* Mini overlay per prodotti correlati */}
                  {relatedIsOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                      <span className="text-white text-xs font-bold">OUT</span>
                    </div>
                  )}
                </div>
                <h3 className={`font-serif text-olive text-center mb-2 text-sm sm:text-base ${
                  relatedIsOutOfStock ? 'opacity-60' : ''
                }`}>
                  {related.name}
                </h3>
                <p className={`text-center text-lg sm:text-2xl font-bold text-olive ${
                  relatedIsOutOfStock ? 'opacity-50' : ''
                }`}>
                  €{related.price}
                </p>
                {!relatedIsOutOfStock && related.originalPrice && related.originalPrice !== 'null' && (
                  <p className="text-center text-xs sm:text-sm text-gray-500 line-through">€{related.originalPrice}</p>
                )}
                
                {/* Stock status per prodotti correlati */}
                <div className="text-center text-xs mt-2">
                  {relatedIsOutOfStock ? (
                    <span className="text-red-600 font-bold bg-red-50 px-2 py-1 rounded-full">{t.productDetailPage.stockNotAvaible}</span>
                  ) : (
                    <span className="text-green-600 bg-green-50 px-2 py-1 rounded-full">{t.productDetailPage.stockAvaible}</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}