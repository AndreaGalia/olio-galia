"use client";

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import { useProducts } from '@/hooks/useProducts';
import { useT } from '@/hooks/useT';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, getTotalItems } = useCart();
  const { products, loading, error } = useProducts();
  const { t, translate } = useT();

  // Calcola il totale usando i prodotti tradotti
  const calculateTotal = () => {
    return cart.reduce((total, cartItem) => {
      const product = products.find(p => p.id === cartItem.id);
      if (product) {
        const price = parseFloat(product.price);
        return total + (price * cartItem.quantity);
      }
      return total;
    }, 0);
  };

  // Calcola il risparmio totale
  const calculateSavings = () => {
    return cart.reduce((savings, cartItem) => {
      const product = products.find(p => p.id === cartItem.id);
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
  const freeShippingThreshold = 50; // Valore fisso o da configurazione
  
  const totalItems = getTotalItems();
  const itemCountLabel = totalItems === 1 ? t.cartPage.itemCount.single : t.cartPage.itemCount.plural;
  const itemLabel = totalItems === 1 ? t.cartPage.itemLabel.single : t.cartPage.itemLabel.plural;

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

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sabbia to-beige">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-sabbia to-beige">
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
              const product = products.find(p => p.id === cartItem.id);
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
                        className="w-12 h-12 rounded-full border border-olive/20 flex items-center justify-center hover:bg-olive hover:text-beige transition-colors text-lg font-medium cursor-pointer"
                      >
                        −
                      </button>
                      <span className="w-16 text-center font-bold text-xl text-olive">{cartItem.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                        className="w-12 h-12 rounded-full border border-olive/20 flex items-center justify-center hover:bg-olive hover:text-beige transition-colors text-lg font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="text-red-500 hover:text-red-700 p-3 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
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
                  <span className={total >= freeShippingThreshold ? "text-green-600 font-medium" : "text-nocciola"}>
                    {total >= freeShippingThreshold ? t.cartPage.summary.free : "€8,90"}
                  </span>
                </div>
                
                {total < freeShippingThreshold && (
                  <div className="text-xs text-nocciola/70 bg-olive/5 p-3 rounded-lg">
                    {translate('cartPage.summary.freeShippingNote', { amount: (freeShippingThreshold - total).toFixed(2) })}
                  </div>
                )}
                
                <hr className="border-olive/20" />
                
                <div className="flex justify-between text-olive font-bold text-xl">
                  <span>{t.cartPage.summary.total}</span>
                  <span>€{(total + (total >= freeShippingThreshold ? 0 : 8.90)).toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-olive to-salvia text-beige py-4 rounded-full font-medium hover:shadow-xl transition-all duration-300 hover:scale-105 text-lg cursor-pointer">
                  {t.cartPage.summary.checkout}
                </button>
                
                <Link 
                  href="/products"
                  className="w-full block text-center py-3 border border-olive text-olive rounded-full hover:bg-olive/5 transition-colors font-medium"
                >
                  {t.cartPage.summary.continueShopping}
                </Link>
              </div>

              <div className="mt-6 pt-4 border-t border-olive/20">
                <button 
                  onClick={clearCart}
                  className="w-full text-center text-red-500 hover:text-red-700 text-sm font-medium py-2 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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
                      {total >= freeShippingThreshold ? t.cartPage.shipping.free : t.cartPage.shipping.paid}
                    </p>
                    <p>{t.cartPage.shipping.delivery}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}