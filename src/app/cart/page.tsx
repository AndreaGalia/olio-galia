"use client";

import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';

// Stesso array prodotti (in un'app reale, questo verrebbe da un database)
const products = [
  {
    id: "1",
    name: "Bottiglia Premium Oil",
    price: 89.90,
    originalPrice: 99.90,
    size: "75ml",
    image: "/bottle-oil.png",
  },
  {
    id: "2",
    name: "Beauty Oil",
    price: 34.90,
    originalPrice: null,
    size: "100ml",
    image: "/bottle-oil.png",
  },
  {
    id: "3",
    name: "Latta Olio da 5L",
    price: 79.90,
    originalPrice: 89.90,
    size: "5L",
    image: "/bottle-oil.png",
  },
];

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, getTotalItems } = useCart();

  // Calcola il totale
  const calculateTotal = () => {
    return cart.reduce((total, cartItem) => {
      const product = products.find(p => p.id === cartItem.id);
      return total + (product ? product.price * cartItem.quantity : 0);
    }, 0);
  };

  // Calcola il risparmio totale
  const calculateSavings = () => {
    return cart.reduce((savings, cartItem) => {
      const product = products.find(p => p.id === cartItem.id);
      if (product && product.originalPrice) {
        return savings + ((product.originalPrice - product.price) * cartItem.quantity);
      }
      return savings;
    }, 0);
  };

  const total = calculateTotal();
  const savings = calculateSavings();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sabbia to-beige">
        {/* Breadcrumb */}
        <div className="bg-white/50 py-4">
          <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
            <nav className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-nocciola hover:text-olive transition-colors">Home</Link>
              <span className="text-nocciola/50">→</span>
              <span className="text-olive font-medium">Carrello</span>
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
            <h1 className="text-3xl sm:text-4xl font-serif text-olive mb-4">Il tuo carrello è vuoto</h1>
            <p className="text-nocciola mb-8 text-lg">Scopri i nostri oli extravergini di qualità!</p>
            <Link 
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-olive to-salvia text-beige rounded-full hover:shadow-xl transition-all duration-300 hover:scale-105 font-medium text-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              Scopri i Prodotti
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
            <Link href="/" className="text-nocciola hover:text-olive transition-colors">Home</Link>
            <span className="text-nocciola/50">→</span>
            <span className="text-olive font-medium">Carrello</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-6xl py-8 sm:py-12">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-olive">Il tuo carrello</h1>
          <span className="bg-olive text-beige px-3 py-1 rounded-full text-sm font-bold">
            {getTotalItems()} {getTotalItems() === 1 ? 'elemento' : 'elementi'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista prodotti */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((cartItem) => {
              const product = products.find(p => p.id === cartItem.id);
              if (!product) return null;

              const itemTotal = product.price * cartItem.quantity;
              const itemSavings = product.originalPrice 
                ? (product.originalPrice - product.price) * cartItem.quantity 
                : 0;

              return (
                <div key={cartItem.id} className="bg-white/90 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  {/* Mobile Layout */}
                  <div className="block sm:hidden">
                    <div className="flex gap-4 mb-4">
                      <div className="w-20 h-24 bg-gradient-to-br from-olive/10 to-salvia/10 rounded-xl p-2 flex-shrink-0">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-serif text-olive text-lg font-medium mb-1">{product.name}</h3>
                        <p className="text-nocciola text-sm mb-2">{product.size}</p>
                        <div className="flex items-end gap-2">
                          <span className="text-olive font-bold text-xl">€{product.price.toFixed(2)}</span>
                          {product.originalPrice && (
                            <span className="text-nocciola/60 line-through text-sm">€{product.originalPrice.toFixed(2)}</span>
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
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-olive font-bold text-xl">€{itemTotal.toFixed(2)}</div>
                        {itemSavings > 0 && (
                          <div className="text-green-600 text-sm font-medium">
                            Risparmi €{itemSavings.toFixed(2)}
                          </div>
                        )}
                      </div>
                      
                      <button 
                        onClick={() => removeFromCart(cartItem.id)}
                        className="text-red-500 hover:text-red-700 p-2 ml-2"
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
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-serif text-olive text-xl font-medium mb-1">{product.name}</h3>
                      <p className="text-nocciola text-sm mb-2">{product.size}</p>
                      <div className="flex items-end gap-3">
                        <span className="text-olive font-bold text-2xl">€{product.price.toFixed(2)}</span>
                        {product.originalPrice && (
                          <span className="text-nocciola/60 line-through text-lg">€{product.originalPrice.toFixed(2)}</span>
                        )}
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
                        className="w-12 h-12 rounded-full border border-olive/20 flex items-center justify-center hover:bg-olive hover:text-beige transition-colors text-lg font-medium cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right min-w-[120px]">
                      <div className="text-olive font-bold text-2xl">€{itemTotal.toFixed(2)}</div>
                      {itemSavings > 0 && (
                        <div className="text-green-600 text-sm font-medium">
                          Risparmi €{itemSavings.toFixed(2)}
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={() => removeFromCart(cartItem.id)}
                      className="text-red-500 hover:text-red-700 p-3 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
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
              <h2 className="text-xl font-serif text-olive mb-6">Riepilogo Ordine</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-nocciola">
                  <span>Subtotale ({getTotalItems()} {getTotalItems() === 1 ? 'articolo' : 'articoli'})</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
                
                {savings > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Risparmio totale</span>
                    <span>-€{savings.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-nocciola">
                  <span>Spedizione</span>
                  <span className="text-green-600 font-medium">Gratuita</span>
                </div>
                
                <hr className="border-olive/20" />
                
                <div className="flex justify-between text-olive font-bold text-xl">
                  <span>Totale</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-olive to-salvia text-beige py-4 rounded-full font-medium hover:shadow-xl transition-all duration-300 hover:scale-105 text-lg cursor-pointer">
                  Procedi al Checkout
                </button>
                
                <Link 
                  href="/products"
                  className="w-full block text-center py-3 border border-olive text-olive rounded-full hover:bg-olive/5 transition-colors font-medium"
                >
                  Continua Shopping
                </Link>
              </div>

              <div className="mt-6 pt-4 border-t border-olive/20">
                <button 
                  onClick={clearCart}
                  className="w-full text-center text-red-500 hover:text-red-700 text-sm font-medium py-2 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  Svuota Carrello
                </button>
              </div>

              {/* Info spedizione */}
              <div className="mt-6 p-4 bg-olive/5 rounded-xl">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-olive mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-nocciola">
                    <p className="font-medium text-olive mb-1">Spedizione gratuita</p>
                    <p>Consegna in 2-3 giorni lavorativi in tutta Italia</p>
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