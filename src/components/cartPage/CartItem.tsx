import { useCart } from '@/contexts/CartContext';
import { useT } from '@/hooks/useT';
import { useLocale } from '@/contexts/LocaleContext';
import { Product } from '@/types/products';
import { parseCartItemId, getVariantOrProduct } from '@/utils/variantHelpers';

interface CartItemData {
  id: string;
  quantity: number;
}

interface CartItemProps {
  cartItem: CartItemData;
  product: Product;
}

export default function CartItem({ cartItem, product }: CartItemProps) {
  const { removeFromCart, updateQuantity } = useCart();
  const { t, translate } = useT();
  const { locale } = useLocale();

  const { variantId } = parseCartItemId(cartItem.id);
  const resolved = getVariantOrProduct(product, variantId);

  const price = parseFloat(resolved.price);
  const originalPrice = resolved.originalPrice && resolved.originalPrice !== 'null'
    ? parseFloat(resolved.originalPrice)
    : null;

  const itemTotal = price * cartItem.quantity;
  const itemSavings = originalPrice
    ? (originalPrice - price) * cartItem.quantity
    : 0;

  // Get variant display name
  const variant = variantId && product.variants
    ? product.variants.find(v => v.variantId === variantId)
    : null;

  const variantDisplayName = variant
    ? variant.translations[locale]?.name || variant.translations.it?.name
    : null;

  const variantLabelText = product.variantLabel?.[locale] || product.variantLabel?.it;

  const variantLine = variantDisplayName && variantLabelText
    ? translate('cartPage.product.variant', { label: variantLabelText, name: variantDisplayName })
    : variantDisplayName;

  const displayImage = resolved.images[0] || product.images[0];

  return (
    <div className="border-t border-black/10 py-4 sm:py-6 transition-all duration-300">
      {/* Mobile Layout */}
      <div className="block sm:hidden">
        <div className="flex gap-4 mb-4">
          <div className="w-20 h-24 bg-sabbia/20 p-2 flex-shrink-0">
            <img
              src={displayImage}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-black text-base mb-1">{product.name}</h3>
            {variantLine && (
              <p className="text-black/60 text-xs mb-1">{variantLine}</p>
            )}
            <p className="text-black/60 text-xs mb-2">{product.size}</p>
            <div className="flex items-end gap-2">
              <span className="text-black font-light text-lg">€{price.toFixed(2)}</span>
              {originalPrice && (
                <span className="text-black/40 line-through text-sm">€{originalPrice.toFixed(2)}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
              className="w-9 h-9 flex items-center justify-center border border-black/15 hover:bg-black/5 transition-colors cursor-pointer"
            >
              −
            </button>
            <span className="w-10 text-center text-black">{cartItem.quantity}</span>
            <button
              onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
              className="w-9 h-9 flex items-center justify-center border border-black/15 hover:bg-black/5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={cartItem.quantity >= resolved.stockQuantity}
            >
              +
            </button>
          </div>

          <div className="text-right">
            <div className="text-black font-light text-lg">€{itemTotal.toFixed(2)}</div>
            {itemSavings > 0 && (
              <div className="text-olive text-xs">
                {translate('cartPage.product.savings', { amount: itemSavings.toFixed(2) })}
              </div>
            )}
          </div>

          <button
            onClick={() => removeFromCart(cartItem.id)}
            className="text-black/30 hover:text-black transition-colors p-2 ml-2"
            aria-label={t.cartPage.product.remove}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:flex items-center gap-6">
        <div className="w-20 h-24 bg-sabbia/20 p-2 flex-shrink-0">
          <img
            src={displayImage}
            alt={product.name}
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex-1">
          <h3 className="text-black text-lg mb-1">{product.name}</h3>
          {variantLine && (
            <p className="text-black/60 text-xs mb-1">{variantLine}</p>
          )}
          <p className="text-black/60 text-xs mb-2">{product.size}</p>
          <div className="flex items-end gap-3">
            <span className="text-black font-light text-xl">€{price.toFixed(2)}</span>
            {originalPrice && (
              <span className="text-black/40 line-through text-base">€{originalPrice.toFixed(2)}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
            className="w-9 h-9 flex items-center justify-center border border-black/15 hover:bg-black/5 transition-colors cursor-pointer"
          >
            −
          </button>
          <span className="w-10 text-center text-black">{cartItem.quantity}</span>
          <button
            onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
            className="w-9 h-9 flex items-center justify-center border border-black/15 hover:bg-black/5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={cartItem.quantity >= resolved.stockQuantity}
          >
            +
          </button>
        </div>

        <div className="text-right min-w-[100px]">
          <div className="text-black font-light text-xl">€{itemTotal.toFixed(2)}</div>
          {itemSavings > 0 && (
            <div className="text-olive text-xs">
              {translate('cartPage.product.savings', { amount: itemSavings.toFixed(2) })}
            </div>
          )}
        </div>

        <button
          onClick={() => removeFromCart(cartItem.id)}
          className="text-black/30 hover:text-black transition-colors p-2"
          aria-label={t.cartPage.product.remove}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
