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
      className={`relative bg-beige/30 border border-olive/10 transition-all duration-300 ${styles.animateFadeInCard} ${
        isOutOfStock ? 'opacity-60' : ''
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Immagine prodotto */}
      <ProductImage product={product} isOutOfStock={isOutOfStock} />

      {/* Contenuto */}
      <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
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
  const { t } = useT();
  return (
    <div className="relative w-full bg-white border-b border-olive/10">
      <div className="relative w-full h-56 sm:h-64 md:h-72">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className={`object-contain ${isOutOfStock ? 'grayscale opacity-50' : ''}`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Sconto badge - sinistra */}
        {!isOutOfStock && product.originalPrice && product.originalPrice !== 'null' && (
          <div className="absolute top-3 left-3 bg-olive text-beige px-3 py-1 text-xs font-bold tracking-wider z-10">
            {t.productsPage.product.discount}
          </div>
        )}

        {/* Custom badge - destra */}
        {!isOutOfStock && product.customBadge && (
          <div className="absolute top-3 right-3 bg-salvia text-beige px-3 py-1 text-xs font-bold tracking-wider z-10">
            {product.customBadge}
          </div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-olive/80">
            <div className="text-beige px-6 py-3 text-base sm:text-lg font-bold tracking-widest">
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
    <div className="space-y-1">
      <h3 className={`text-base sm:text-lg text-olive leading-tight tracking-wide ${
        isOutOfStock ? 'opacity-50' : ''
      }`}>
        {product.name}
      </h3>
      <p className={`text-xs sm:text-sm text-olive ${
        isOutOfStock ? 'opacity-50' : ''
      }`}>
        {product.size}
      </p>
    </div>
  );
}

function ProductPrice({ product, isOutOfStock }: ProductSubComponentProps) {
  return (
    <div className="flex items-baseline gap-2 border-t border-olive/10 pt-3">
      <div className={`text-2xl sm:text-3xl font-bold text-olive ${
        isOutOfStock ? 'opacity-50' : ''
      }`}>
        €{product.price}
      </div>
      {!isOutOfStock && product.originalPrice && product.originalPrice !== 'null' && (
        <div className="text-sm sm:text-base text-olive/60 line-through">
          €{product.originalPrice}
        </div>
      )}
    </div>
  );
}

function StockInfo({ isOutOfStock }: ProductSubComponentProps) {
  const { t } = useT();

  return (
    <div className="text-xs sm:text-sm">
      {isOutOfStock ? (
        <div className="text-red-700 bg-red-50 px-3 py-1.5 border-l-2 border-red-700">
          {t.productsPage.product.outOfStock}
        </div>
      ) : (
        <div className="text-olive bg-olive/5 px-3 py-1.5 border-l-2 border-olive">
          {t.productDetailPage.stockAvaible}
        </div>
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
    <div className="grid grid-cols-2 gap-2 sm:gap-3">
      <AddToCartButton
        onAddToCart={onAddToCart}
        disabled={isOutOfStock}
        quantity={1}
        size="compact"
      />

      <Link
        href={`/products/${product.slug}`}
        className={`bg-white text-olive py-3 px-4 font-medium transition-all duration-300 text-sm sm:text-base border border-olive/30 flex items-center justify-center ${
          isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'hover:bg-olive hover:text-beige'
        }`}
      >
        {t.productsPage.product.details}
      </Link>
    </div>
  );
}