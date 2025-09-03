import Image from "next/image";
import Link from 'next/link';
import AddToCartButton from '@/components/AddToCartButton';
import { Product } from '@/types/products';
import { useT } from '@/hooks/useT';
import styles from '../../styles/ProductsPage.module.css';

interface ProductCardProps {
  product: Product;
  index: number;
  onAddToCart: (productId: string) => void;
}

export default function ProductCard({ product, index, onAddToCart }: ProductCardProps) {
  const { t, translate } = useT();
  const isOutOfStock = !product.inStock || product.stockQuantity === 0;

  return (
    <div 
      className={`group relative bg-white/95 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-olive/5 ${styles.animateFadeInCard} ${
        isOutOfStock ? 'opacity-75 grayscale' : ''
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Badge */}
      <div className={`absolute -top-2 -right-2 px-3 py-1 rounded-full text-xs font-bold text-white shadow-md rotate-12 z-10 ${
        product.color === 'olive' ? 'bg-olive' : 
        product.color === 'salvia' ? 'bg-salvia' : 'bg-nocciola'
      } ${isOutOfStock ? 'opacity-50' : ''}`}>
        {product.badge}
      </div>

      {/* SOLD OUT Badge */}
      {isOutOfStock && (
        <div className="absolute top-4 left-4 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-full text-sm font-bold z-20 shadow-lg animate-pulse">
          SOLD OUT
        </div>
      )}

      {/* Sconto */}
      {!isOutOfStock && product.originalPrice && product.originalPrice !== 'null' && (
        <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
          {t.productsPage.product.discount}
        </div>
      )}

      {/* Immagine prodotto */}
      <ProductImage product={product} isOutOfStock={isOutOfStock} />

      {/* Contenuto */}
      <div className="space-y-4">
        <ProductInfo product={product} isOutOfStock={isOutOfStock} />
        <ProductPrice product={product} isOutOfStock={isOutOfStock} />
        <StockInfo product={product} isOutOfStock={isOutOfStock} />
        <ProductActions 
          product={product} 
          isOutOfStock={isOutOfStock} 
          onAddToCart={() => onAddToCart(product.id)} 
        />
      </div>
    </div>
  );
}

// Sotto-componenti per ProductCard con interfacce tipizzate
interface ProductSubComponentProps {
  product: Product;
  isOutOfStock: boolean;
}

function ProductImage({ product, isOutOfStock }: ProductSubComponentProps) {
  return (
    <div className="relative mb-6 flex justify-center">
      <div className={`w-full h-48 relative rounded-xl overflow-hidden bg-gradient-to-br from-sabbia/30 to-beige/50 ${
        isOutOfStock ? 'opacity-60' : ''
      }`}>
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className={`object-contain group-hover:scale-105 transition-transform duration-300 ${
            isOutOfStock ? 'opacity-60' : ''
          }`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
            <div className="bg-red-600/90 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-xl transform -rotate-12">
              SOLD OUT
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductInfo({ product, isOutOfStock }: ProductSubComponentProps) {
  return (
    <div className="text-center">
      <h3 className={`text-lg sm:text-xl font-serif text-olive mb-2 leading-tight ${
        isOutOfStock ? 'opacity-60' : ''
      }`}>
        {product.name}
      </h3>
      <p className={`text-sm text-nocciola leading-relaxed px-2 ${
        isOutOfStock ? 'opacity-60' : ''
      }`}>
        {product.description}
      </p>
      <div className={`text-xs text-nocciola/80 italic border-t border-olive/10 pt-3 px-2 mt-4 ${
        isOutOfStock ? 'opacity-60' : ''
      }`}>
        {product.details}
      </div>
    </div>
  );
}

function ProductPrice({ product, isOutOfStock }: ProductSubComponentProps) {
  return (
    <div className="flex justify-center items-center gap-2 pt-3 border-t border-olive/10">
      <div className="text-center">
        {!isOutOfStock && product.originalPrice && product.originalPrice !== 'null' && (
          <div className="text-sm text-nocciola/60 line-through mb-1">
            €{product.originalPrice}
          </div>
        )}
        <div className={`text-2xl font-serif font-bold text-olive ${
          isOutOfStock ? 'opacity-50' : ''
        }`}>
          €{product.price}
        </div>
        <div className={`text-sm text-nocciola mt-1 ${
          isOutOfStock ? 'opacity-50' : ''
        }`}>
          {product.size}
        </div>
      </div>
    </div>
  );
}

function StockInfo({ product, isOutOfStock }: ProductSubComponentProps) {
  const { t, translate } = useT();

  return (
    <div className="text-center text-xs">
      {isOutOfStock ? (
        <span className="text-red-600 font-bold bg-red-50 px-3 py-1 rounded-full border border-red-200">
          {t.productsPage.product.outOfStock}
        </span>
      ) : (
        <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
          {translate('productsPage.product.available', { count: product.stockQuantity })}
        </span>
      )}
    </div>
  );
}

interface ProductActionsProps extends ProductSubComponentProps {
  onAddToCart: () => void;
}

function ProductActions({ product, isOutOfStock, onAddToCart }: ProductActionsProps) {
  const { t } = useT();

  return (
    <div className={`flex gap-2 ${styles.animateSlideUpButtons}`}>
      <AddToCartButton
        onAddToCart={onAddToCart}
        disabled={isOutOfStock}
        quantity={1}
        size="compact"
      />
      
      <Link 
        href={`/products/${product.slug}`}
        className={`flex-1 bg-olive/10 text-olive py-3 px-4 rounded-full font-medium hover:bg-olive/20 hover:shadow-lg transition-all duration-300 text-base border border-olive/20 hover:border-olive/40 flex items-center justify-center hover:scale-105 ${
          isOutOfStock ? 'opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-none hover:bg-olive/10' : ''
        }`}
      >
        {t.productsPage.product.details}
      </Link>
    </div>
  );
}