import { useT } from '@/hooks/useT';
import type { Product } from '@/types/products';

interface ProductDetailsCardsProps {
  product: Product;
  isOutOfStock: boolean;
}

export default function ProductDetailsCards({ 
  product, 
  isOutOfStock 
}: ProductDetailsCardsProps) {
  const { t } = useT();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
      
      {/* Caratteristiche */}
      <div className={`bg-white/90 rounded-2xl p-6 shadow-lg ${
        isOutOfStock ? 'opacity-75' : ''
      }`}>
        <h3 className="text-xl font-serif text-olive mb-4">{t.productDetailPage.product.characteristics}</h3>
        <ul className="space-y-2">
          {product.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-nocciola">
              <svg className="w-4 h-4 text-salvia flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* Valori nutrizionali */}
      <div className={`bg-white/90 rounded-2xl p-6 shadow-lg ${
        isOutOfStock ? 'opacity-75' : ''
      }`}>
        <h3 className="text-xl font-serif text-olive mb-4">{t.productDetailPage.product.nutritionalInfo}</h3>
        <div className="text-sm text-nocciola">
          <p className="mb-2 font-medium">{t.productDetailPage.product.nutritionalPer100g}</p>
          {product.nutritionalInfo
            ? Object.entries(product.nutritionalInfo).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b border-olive/10 py-1">
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span>{value}</span>
                </div>
              ))
            : <div className="text-nocciola">{t.productDetailPage.product.nutritionalNotAvailable}</div>
          }
        </div>
      </div>

      {/* Premi e riconoscimenti */}
      <div className={`bg-white/90 rounded-2xl p-6 shadow-lg ${
        isOutOfStock ? 'opacity-75' : ''
      }`}>
        <h3 className="text-xl font-serif text-olive mb-4">{t.productDetailPage.product.awards}</h3>
        <div className="space-y-3">
          {product.awards && product.awards.length > 0 ? (
            product.awards.map((award, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-nocciola">
                <svg className="w-5 h-5 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {award}
              </div>
            ))
          ) : (
            <p className="text-sm text-nocciola/70">{t.productDetailPage.product.noAwards}</p>
          )}
        </div>
      </div>
    </div>
  );
}