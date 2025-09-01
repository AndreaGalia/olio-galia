// app/cart/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useCheckout } from '@/hooks/useCheckout';
import Link from 'next/link';
import { useProducts } from '@/hooks/useProducts';
import { useT } from '@/hooks/useT';

interface Product {
  id: string;
  name: string;
  price: string;
  originalPrice?: string | null;
  size: string;
  images: string[];
  stockQuantity: number;
}

interface ShopConfig {
  freeShippingThreshold: number;
  shippingCosts: {
    eu: number;
    world: number;
  };
  euCountries: string[];
}

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, getTotalItems } = useCart();
  const { products, loading, error } = useProducts();
  const { startCheckout, loading: checkoutLoading, error: checkoutError, clearError } = useCheckout();
  const { t, translate } = useT();
  
  // Stati per la configurazione shop e fattura
  const [shopConfig, setShopConfig] = useState<ShopConfig>({ 
    freeShippingThreshold: 100, 
    shippingCosts: { eu: 8.90, world: 25.00 },
    euCountries: []
  });
  const [needsInvoice, setNeedsInvoice] = useState<boolean>(false);
  const [showCheckoutError, setShowCheckoutError] = useState<boolean>(false);

  // Carica configurazione shop al mount
  useEffect(() => {
    fetch('/api/shop-config')
      .then(res => res.json())
      .then(config => {
        setShopConfig({
          freeShippingThreshold: config.freeShippingThreshold || 100,
          shippingCosts: config.shippingCosts || { eu: 8.90, world: 25.00 },
          euCountries: config.euCountries || []
        });
      })
      .catch(err => {
        console.error('Errore nel caricare la configurazione:', err);
        // Mantieni valori di default
      });
  }, []);

  // Calcola il totale usando i prodotti tradotti
  const calculateTotal = (): number => {
    return cart.reduce((total, cartItem) => {
      const product = products.find((p: Product) => p.id === cartItem.id);
      if (product) {
        const price = parseFloat(product.price);
        return total + (price * cartItem.quantity);
      }
      return total;
    }, 0);
  };

  // Calcola il risparmio totale
  const calculateSavings = (): number => {
    return cart.reduce((savings, cartItem) => {
      const product = products.find((p: Product) => p.id === cartItem.id);
      if (product && product.originalPrice && product.originalPrice !== 'null') {
        const currentPrice = parseFloat(product.price);
        const originalPrice = parseFloat(product.originalPrice);
        return savings + ((originalPrice - currentPrice) * cartItem.quantity);
      }
      return savings;
    }, 0);
  };

  const total = calculateTotal();
  const savings = calculateSavings();
  const { freeShippingThreshold, shippingCosts } = shopConfig;
  // Per semplicità nel riepilogo, mostra il prezzo EU (l'utente sceglierà durante il checkout)
  const displayShippingCost = total >= freeShippingThreshold ? 0 : shippingCosts.eu;
  const finalTotal = total + displayShippingCost;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - total);
  
  const totalItems = getTotalItems();
  const itemCountLabel = totalItems === 1 ? t.cartPage.itemCount.single : t.cartPage.itemCount.plural;
  const itemLabel = totalItems === 1 ? t.cartPage.itemLabel.single : t.cartPage.itemLabel.plural;

  // Gestione del checkout con fattura
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    clearError();
    setShowCheckoutError(false);
    
    try {
      // Modifica la chiamata per includere needsInvoice
      await startCheckout(cart, needsInvoice);
      // Il carrello si svuoterà SOLO dopo il pagamento completato
    } catch (err) {
      setShowCheckoutError(true);
    }
  };

  // Componente per mostrare errori di checkout
  const CheckoutErrorModal = () => {
    if (!showCheckoutError || !checkoutError) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-serif text-olive">{t.cartPage.checkoutError.title}</h3>
          </div>
          
          <div className="mb-6 text-nocciola whitespace-pre-line">
            {checkoutError}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowCheckoutError(false)}
              className="flex-1 px-4 py-2 border border-olive text-olive rounded-full hover:bg-olive/5 transition-colors"
            >
              {t.cartPage.checkoutError.close}
            </button>
            <button
              onClick={() => {
                setShowCheckoutError(false);
                clearError();
              }}
              className="flex-1 px-4 py-2 bg-olive text-beige rounded-full hover:bg-olive/80 transition-colors"
            >
              {t.cartPage.checkoutError.retry}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sabbia to-beige">
        <div className="bg-white/50 py-4">
          <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
            <nav className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-nocciola hover:text-olive transition-colors">{t.cartPage.breadcrumb.home}</Link>
              <span className="text-nocciola/50">→</span>
              <span className="text-olive font-medium">{t.cartPage.breadcrumb.cart}</span>
            </nav>
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl py-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-olive/20 border-t-olive rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-olive text-lg">{t.cartPage.loading}</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sabbia to-beige">
        <div className="bg-white/50 py-4">
          <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
            <nav className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-nocciola hover:text-olive transition-colors">{t.cartPage.breadcrumb.home}</Link>
              <span className="text-nocciola/50">→</span>
              <span className="text-olive font-medium">{t.cartPage.breadcrumb.cart}</span>
            </nav>
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl py-12">
          <div className="text-center">
            <p className="text-red-600 text-lg mb-4">{translate('cartPage.error', { error })}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-olive text-beige rounded-full hover:bg-olive/80 transition-colors"
            >
              {t.cartPage.retry}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sabbia to-beige">
        <div className="bg-white/50 py-4">
          <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
            <nav className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-nocciola hover:text-olive transition-colors">{t.cartPage.breadcrumb.home}</Link>
              <span className="text-nocciola/50">→</span>
              <span className="text-olive font-medium">{t.cartPage.breadcrumb.cart}</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 max-w-4xl py-12">
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-8 bg-white/60 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-16 h-16 text-olive/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif text-olive mb-4">{t.cartPage.empty.title}</h1>
            <p className="text-nocciola mb-8 text-lg">{t.cartPage.empty.description}</p>
            <Link 
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-olive to-salvia text-beige rounded-full hover:shadow-xl transition-all duration-300 hover:scale-105 font-medium text-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              {t.cartPage.empty.button}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Main cart content
  return (
    <div className="min-h-screen bg-gradient-to-br from-sabbia to-beige">
      {/* Modal per errori di checkout */}
      <CheckoutErrorModal />

      {/* Breadcrumb */}
      <div className="bg-white/50 py-4">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-nocciola hover:text-olive transition-colors">{t.cartPage.breadcrumb.home}</Link>
            <span className="text-nocciola/50">→</span>
            <span className="text-olive font-medium">{t.cartPage.breadcrumb.cart}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-6xl py-8 sm:py-12">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-olive">{t.cartPage.title}</h1>
          <span className="bg-olive text-beige px-3 py-1 rounded-full text-sm font-bold">
            {totalItems} {itemCountLabel}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista prodotti */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((cartItem) => {
              const product = products.find((p: Product) => p.id === cartItem.id);
              if (!product) return null;

              const price = parseFloat(product.price);
              const originalPrice = product.originalPrice && product.originalPrice !== 'null' 
                ? parseFloat(product.originalPrice) 
                : null;
              
              const itemTotal = price * cartItem.quantity;
              const itemSavings = originalPrice 
                ? (originalPrice - price) * cartItem.quantity 
                : 0;

              return (
                <div key={cartItem.id} className="bg-white/90 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  {/* Mobile Layout */}
                  <div className="block sm:hidden">
                    <div className="flex gap-4 mb-4">
                      <div className="w-20 h-24 bg-gradient-to-br from-olive/10 to-salvia/10 rounded-xl p-2 flex-shrink-0">
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-serif text-olive text-lg font-medium mb-1">{product.name}</h3>
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
                          className="w-10 h-10 rounded-full border border-olive/20 flex items-center justify-center hover:bg-olive hover:text-beige transition-colors"
                        >
                          −
                        </button>
                        <span className="w-12 text-center font-bold text-lg text-olive">{cartItem.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                          className="w-10 h-10 rounded-full border border-olive/20 flex items-center justify-center hover:bg-olive hover:text-beige transition-colors"
                          disabled={cartItem.quantity >= product.stockQuantity}
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
                    <div className="w-20 h-24 bg-gradient-to-br from-olive/10 to-salvia/10 rounded-xl p-2 flex-shrink-0">
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-serif text-olive text-xl font-medium mb-1">{product.name}</h3>
                      <p className="text-nocciola text-sm mb-2">{product.size}</p>
                      <div className="flex items-end gap-3">
                        <span className="text-olive font-bold text-2xl">€{price.toFixed(2)}</span>
                        {originalPrice && (
                          <span className="text-nocciola/60 line-through text-lg">€{originalPrice.toFixed(2)}</span>
                        )}
                      </div>
                      <div className="text-xs text-nocciola/70 mt-1">
                        {translate('cartPage.product.stock', { count: product.stockQuantity })}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
                        className="w-12 h-12 rounded-full border border-olive/20 flex items-center justify-center hover:bg-olive hover:text-beige transition-colors text-lg font-medium"
                      >
                        −
                      </button>
                      <span className="w-16 text-center font-bold text-xl text-olive">{cartItem.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                        className="w-12 h-12 rounded-full border border-olive/20 flex items-center justify-center hover:bg-olive hover:text-beige transition-colors text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={cartItem.quantity >= product.stockQuantity}
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
                      className="text-red-500 hover:text-red-700 p-3 hover:bg-red-50 rounded-full transition-colors"
                      aria-label={t.cartPage.product.remove}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Riepilogo ordine */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 rounded-2xl p-6 shadow-lg sticky top-4">
              <h2 className="text-xl font-serif text-olive mb-6">{t.cartPage.summary.title}</h2>
              
              {/* Indicatore spedizione gratuita */}
              {remainingForFreeShipping > 0 ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-yellow-800 font-medium text-sm">{t.cartPage.freeShipping.title}</span>
                  </div>
                  <p className="text-yellow-800 text-sm">
                    {translate('cartPage.freeShipping.remaining', { amount: remainingForFreeShipping.toFixed(2) })}
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-800 font-medium text-sm">
                      {t.cartPage.freeShipping.qualified}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-nocciola">
                  <span>{translate('cartPage.summary.subtotal', { count: totalItems, itemLabel })}</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
                
                {savings > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>{t.cartPage.summary.totalSavings}</span>
                    <span>-€{savings.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-nocciola">
                  <span>{t.cartPage.summary.shipping}</span>
                  <span className={displayShippingCost === 0 ? "text-green-600 font-medium" : "text-nocciola"}>
                    {displayShippingCost === 0 ? t.cartPage.summary.free : `€${displayShippingCost.toFixed(2)}*`}
                  </span>
                </div>
                
                {displayShippingCost > 0 && (
                  <div className="text-xs text-nocciola/70 bg-blue-50 p-3 rounded-lg">
                    {translate('cartPage.shippingNote', { worldPrice: shippingCosts.world.toFixed(2) })}
                  </div>
                )}
                
                <hr className="border-olive/20" />
                
                <div className="flex justify-between text-olive font-bold text-xl">
                  <span>{t.cartPage.summary.total}</span>
                  <span>€{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkbox per fattura */}
              <div className="mb-4 p-4 bg-olive/5 rounded-xl">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={needsInvoice}
                    onChange={(e) => setNeedsInvoice(e.target.checked)}
                    className="mt-1 rounded border-olive/30 text-olive focus:ring-olive focus:ring-offset-0"
                  />
                  <div>
                    <span className="text-olive font-medium text-sm block">
                      {t.cartPage.invoice.title}
                    </span>
                    <span className="text-nocciola text-xs">
                      {t.cartPage.invoice.description}
                    </span>
                  </div>
                </label>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handleCheckout}
                  disabled={checkoutLoading || cart.length === 0}
                  className="w-full cursor-pointer bg-gradient-to-r from-olive to-salvia text-beige py-4 rounded-full font-medium hover:shadow-xl transition-all duration-300 hover:scale-105 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {checkoutLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-beige/30 border-t-beige rounded-full animate-spin"></div>
                      {t.cartPage.summary.processing}
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      {t.cartPage.summary.checkout}
                    </>
                  )}
                </button>
                
                <Link 
                  href="/products"
                  className="w-full block text-center py-3 border border-olive text-olive rounded-full hover:bg-olive/5 transition-colors font-medium"
                >
                  {t.cartPage.summary.continueShopping}
                </Link>
              </div>

              {needsInvoice && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 text-xs">
                    {t.cartPage.invoice.checkoutNote}
                  </p>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-olive/20">
                <button 
                  onClick={clearCart}
                  className="w-full cursor-pointer text-center text-red-500 hover:text-red-700 text-sm font-medium py-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  {t.cartPage.summary.clearCart}
                </button>
              </div>

              {/* Info spedizione */}
              <div className="mt-6 p-4 bg-olive/5 rounded-xl">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-olive mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-nocciola">
                    <p className="font-medium text-olive mb-1">
                      {displayShippingCost === 0 ? t.cartPage.shipping.free : t.cartPage.shipping.paid}
                    </p>
                    <p>{t.cartPage.shipping.delivery}</p>
                  </div>
                </div>
              </div>

              {/* Sicurezza checkout */}
              <div className="mt-4 p-4 bg-green-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-green-800 font-medium text-sm">{t.cartPage.security.title}</span>
                </div>
                <p className="text-green-700 text-xs">
                  {t.cartPage.security.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}