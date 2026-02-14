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
    <div className="bg-white border border-olive/10 p-4 sm:p-6 transition-all duration-300">
      {/* Mobile Layout */}
      <div className="block sm:hidden">
        <div className="flex gap-4 mb-4">
          <div className="w-20 h-24 bg-beige/50 border border-olive/10 p-2 flex-shrink-0">
            <img
              src={displayImage}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-serif text-olive text-lg font-medium mb-1">{product.name}</h3>
            {variantLine && (
              <p className="text-nocciola text-xs mb-1">{variantLine}</p>
            )}
            <p className="text-nocciola text-sm mb-2">{product.size}</p>
            <div className="flex items-end gap-2">
              <span className="text-olive font-bold text-xl">€{price.toFixed(2)}</span>
              {originalPrice && (
                <span className="text-nocciola/60 line-through text-sm">€{originalPrice.toFixed(2)}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
              className="w-10 h-10 border border-olive/20 flex items-center justify-center hover:bg-olive hover:text-beige transition-colors"
            >
              −
            </button>
            <span className="w-12 text-center font-bold text-lg text-olive">{cartItem.quantity}</span>
            <button
              onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
              className="w-10 h-10 border border-olive/20 flex items-center justify-center hover:bg-olive hover:text-beige transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={cartItem.quantity >= resolved.stockQuantity}
            >
              +
            </button>
          </div>

          <div className="text-right">
            <div className="text-olive font-bold text-xl">€{itemTotal.toFixed(2)}</div>
            {itemSavings > 0 && (
              <div className="text-green-600 text-sm font-medium">
                {translate('cartPage.product.savings', { amount: itemSavings.toFixed(2) })}
              </div>
            )}
          </div>

          <button
            onClick={() => removeFromCart(cartItem.id)}
            className="text-red-500 hover:text-red-700 p-2 ml-2"
            aria-label={t.cartPage.product.remove}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:flex items-center gap-6">
        <div className="w-20 h-24 bg-beige/50 border border-olive/10 p-2 flex-shrink-0">
          <img
            src={displayImage}
            alt={product.name}
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex-1">
          <h3 className="font-serif text-olive text-xl font-medium mb-1">{product.name}</h3>
          {variantLine && (
            <p className="text-nocciola text-xs mb-1">{variantLine}</p>
          )}
          <p className="text-nocciola text-sm mb-2">{product.size}</p>
          <div className="flex items-end gap-3">
            <span className="text-olive font-bold text-2xl">€{price.toFixed(2)}</span>
            {originalPrice && (
              <span className="text-nocciola/60 line-through text-lg">€{originalPrice.toFixed(2)}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
            className="w-12 h-12 border border-olive/20 flex items-center justify-center hover:bg-olive hover:text-beige transition-colors text-lg font-medium"
          >
            −
          </button>
          <span className="w-16 text-center font-bold text-xl text-olive">{cartItem.quantity}</span>
          <button
            onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
            className="w-12 h-12 border border-olive/20 flex items-center justify-center hover:bg-olive hover:text-beige transition-colors text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={cartItem.quantity >= resolved.stockQuantity}
          >
            +
          </button>
        </div>

        <div className="text-right min-w-[120px]">
          <div className="text-olive font-bold text-2xl">€{itemTotal.toFixed(2)}</div>
          {itemSavings > 0 && (
            <div className="text-green-600 text-sm font-medium">
              {translate('cartPage.product.savings', { amount: itemSavings.toFixed(2) })}
            </div>
          )}
        </div>

        <button
          onClick={() => removeFromCart(cartItem.id)}
          className="text-red-500 hover:text-red-700 p-3 border border-transparent hover:border-red-200 transition-colors"
          aria-label={t.cartPage.product.remove}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
