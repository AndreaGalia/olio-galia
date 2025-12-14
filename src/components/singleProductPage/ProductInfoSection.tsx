import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BulkProposalSection } from '@/components/BulkProposalModal';
import { useCart } from '@/contexts/CartContext';
import AddToCartButton from '@/components/AddToCartButton';
import { useT } from '@/hooks/useT';
import type { Product } from '@/types/products';

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
          <span className="text-4xl font-serif font-bold text-olive">
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
    </div>
  );
}