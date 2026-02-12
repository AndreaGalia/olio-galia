import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BulkProposalSection } from '@/components/BulkProposalModal';
import { useCart } from '@/contexts/CartContext';
import AddToCartButton from '@/components/AddToCartButton';
import { useT } from '@/hooks/useT';
import type { Product } from '@/types/products';
import type { RecurringPriceMap } from '@/types/subscription';

interface ProductInfoSectionProps {
  product: Product;
  isOutOfStock: boolean;
}

export default function ProductInfoSection({ 
  product, 
  isOutOfStock 
}: ProductInfoSectionProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  const { addToCart } = useCart();
  const { t, translate } = useT();
  const router = useRouter();

  const handleAddToCart = () => {
    if (product?.inStock && product.stockQuantity > 0 && !isAddingToCart) {
      setIsAddingToCart(true);
      addToCart(product.id, quantity);
      
      setTimeout(() => {
        setIsAddingToCart(false);
      }, 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Product header */}
      <div>
        <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
          <span className={`bg-olive/10 text-olive px-2 sm:px-3 py-1 border border-olive/20 text-xs sm:text-sm font-medium ${
            isOutOfStock ? 'opacity-50' : ''
          }`}>
            {product.categoryDisplay}
          </span>
          <span className={`bg-olive text-beige px-2 sm:px-3 py-1 border border-olive/20 text-xs sm:text-sm font-bold ${
            isOutOfStock ? 'opacity-50' : ''
          }`}>
            {product.badge}
          </span>
          {/* Custom Badge personalizzato */}
          {product.customBadge && (
            <span className={`bg-salvia text-beige px-2 sm:px-3 py-1 border border-salvia/20 text-xs sm:text-sm font-bold ${
              isOutOfStock ? 'opacity-50' : ''
            }`}>
              {product.customBadge}
            </span>
          )}
          {/* Badge SOLD OUT prominente accanto ai badge esistenti */}
          {isOutOfStock && (
            <span className="bg-red-600 text-white px-3 sm:px-4 py-1 border border-red-700 text-xs sm:text-sm font-bold">
              SOLD OUT
            </span>
          )}
        </div>
        
        <h1 className={`text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-serif text-olive mb-4 leading-tight ${
          isOutOfStock ? 'opacity-60' : ''
        }`}>
          {product.name}
        </h1>
        
        <p className={`text-base sm:text-lg text-nocciola leading-relaxed mb-6 ${
          isOutOfStock ? 'opacity-60' : ''
        }`}>
          {product.longDescription}
        </p>
      </div>

      {/* Price and quantity */}
      <div className="bg-white border border-olive/10 p-6">
        <div className="flex items-end gap-4 mb-4">
          {product.originalPrice && product.originalPrice !== 'null' && (
            <span className="text-xl text-nocciola/60 line-through">
              €{product.originalPrice}
            </span>
          )}
          <span className="text-4xl font-bold text-olive">
            €{product.price}
          </span>
          <span className="text-lg text-nocciola mb-1">
            {product.size}
          </span>
        </div>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-olive">{t.productDetailPage.product.quantity}</label>
            <div className={`flex items-center border border-olive/20 ${
              isOutOfStock ? 'opacity-50 pointer-events-none' : ''
            }`}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 hover:bg-olive/10 transition-colors cursor-pointer"
                disabled={isOutOfStock}
              >
                -
              </button>
              <span className="px-4 py-2 bg-olive/5 text-center min-w-[50px]">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                className="px-3 py-2 hover:bg-olive/10 transition-colors cursor-pointer"
                disabled={isOutOfStock || quantity >= product.stockQuantity}
              >
                +
              </button>
            </div>
          </div>
          
          <div className="text-sm text-nocciola">
            {product.inStock ? (
              <span className="text-green-600">
                {t.productDetailPage.product.available}
              </span>
            ) : (
              <span className="text-red-600">{t.productDetailPage.product.outOfStock}</span>
            )}
          </div>
        </div>
        
        <div className="flex gap-3">
          <AddToCartButton
            onAddToCart={handleAddToCart}
            disabled={isOutOfStock}
            quantity={quantity}
            size="full"
          />
          <Link
            href="/cart"
            onClick={(e) => {
              e.preventDefault();
              handleAddToCart();
              router.push('/cart');
            }}
            className={`px-6 py-4 bg-olive/10 text-olive hover:bg-olive hover:text-beige transition-all duration-300 border border-olive/20 cursor-pointer ${
              isOutOfStock ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Bulk proposal section */}
      <BulkProposalSection productName={product.name} />

      {/* Subscription CTA Banner */}
      {(product as Product & { isSubscribable?: boolean; stripeRecurringPriceIds?: RecurringPriceMap }).isSubscribable && (
        <div className="bg-white border-l-4 border-olive p-4 sm:p-6 animate-fadeIn">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-olive/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-olive mb-1">
                {t.subscription?.ctaBanner || 'Abbonati e Risparmia'}
              </h3>
              <p className="text-sm text-nocciola mb-3">
                {t.subscription?.ctaBannerDesc || 'Ricevi questo prodotto a casa tua con regolarità. Spedizione inclusa!'}
              </p>
              <Link
                href={`/products/${product.slug}/subscribe`}
                className="inline-block px-6 py-3 bg-olive text-beige font-medium hover:bg-salvia transition-all duration-300 border border-olive/20 text-sm uppercase tracking-wider"
              >
                {t.subscription?.ctaButton || "Scopri l'Abbonamento"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}