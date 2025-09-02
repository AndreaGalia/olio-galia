"use client";
import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import CartIconButton from './CartIconButton';
import { useCart } from '@/contexts/CartContext';
import { useProducts } from '@/hooks/useProducts';
import type { Product } from '@/types/products';
import { useT } from '@/hooks/useT';

export default function ProductsSection() {
  const [activeProduct, setActiveProduct] = useState(0);
  
  const { addToCart } = useCart();
  const { t, translate } = useT();
  const { products, loading, error } = useProducts();

  const handleAddToCart = (product: Product) => {
    // Controllo aggiuntivo per sicurezza
    if (product.inStock && product.stockQuantity > 0) {
      addToCart(product.id, 1);
    }
  };

  // Loading state
  if (loading) {
    return (
      <section className="relative bg-gradient-to-br from-beige via-beige/80 to-olive/5 py-20 sm:py-24 lg:py-32 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-olive/20 border-t-olive rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-olive text-lg">{t.products.loading}</p>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="relative bg-gradient-to-br from-beige via-beige/80 to-olive/5 py-20 sm:py-24 lg:py-32 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
          <div className="text-center">
            <p className="text-red-600 text-lg mb-4">{translate('products.error', { error })}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-olive text-beige rounded-full hover:bg-olive/80 transition-colors"
            >
              {t.products.retry}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-gradient-to-br from-beige via-beige/80 to-olive/5 py-20 sm:py-24 lg:py-32 overflow-hidden">
      {/* Elementi decorativi di sfondo migliorati */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full bg-olive/10 blur-3xl"></div>
        <div className="absolute bottom-32 left-20 w-80 h-80 rounded-full bg-salvia/10 blur-3xl"></div>
        <div className="absolute top-1/2 right-1/3 w-40 h-40 rounded-full bg-nocciola/15 blur-2xl"></div>
        
        {/* Pattern decorativo */}
        <div className="absolute top-40 left-1/4 opacity-5">
          <svg width="120" height="120" viewBox="0 0 120 120" className="text-olive">
            <circle cx="60" cy="60" r="2" fill="currentColor" />
            <circle cx="80" cy="40" r="1.5" fill="currentColor" />
            <circle cx="40" cy="80" r="1.5" fill="currentColor" />
            <circle cx="90" cy="75" r="1" fill="currentColor" />
            <circle cx="30" cy="45" r="1" fill="currentColor" />
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
        
        {/* Header della sezione ridisegnato */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-olive/15 to-salvia/15 backdrop-blur-sm text-olive px-6 py-3 rounded-full text-sm font-semibold mb-8 border border-olive/20">
            <div className="w-2.5 h-2.5 bg-gradient-to-r from-olive to-salvia rounded-full animate-pulse"></div>
            {t.products.badge}
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-olive mb-8 leading-tight">
            {t.products.title.line1}
            <span className="block italic text-transparent bg-gradient-to-r from-salvia to-olive bg-clip-text">
              {t.products.title.line2}
            </span>
          </h2>
          
          <p className="text-xl text-nocciola max-w-3xl mx-auto leading-relaxed mb-4">
            {t.products.description}
          </p>
          
          <div className="flex justify-center items-center gap-4 text-sm text-nocciola/80">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-olive rounded-full"></div>
              {t.products.features.handPicked}
            </div>
            <div className="w-px h-4 bg-nocciola/30"></div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-salvia rounded-full"></div>
              {t.products.features.coldPressed}
            </div>
            <div className="w-px h-4 bg-nocciola/30"></div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-nocciola rounded-full"></div>
              {t.products.features.sicilian}
            </div>
          </div>
        </div>

        {/* Grid prodotti ridisegnata */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-nocciola text-lg">{t.products.noProducts}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {products.map((product, index) => {
              const isOutOfStock = !product.inStock || product.stockQuantity === 0;
              
              return (
                <div 
                  key={product.id}
                  className={`group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-700 hover:scale-[1.02] hover:-translate-y-2 border border-white/50 ${
                    activeProduct === index ? 'ring-2 ring-olive/30 bg-white/90' : ''
                  } ${isOutOfStock ? 'opacity-75 grayscale' : ''}`}
                  onClick={() => setActiveProduct(index)}
                >
                  {/* Badge migliorato */}
                  <div className={`absolute -top-4 -right-4 px-4 py-2 rounded-2xl text-sm font-bold text-white shadow-xl rotate-6 transform transition-transform group-hover:rotate-3 ${
                    product.color === 'olive' ? 'bg-gradient-to-r from-olive to-olive/80' : 
                    product.color === 'salvia' ? 'bg-gradient-to-r from-salvia to-salvia/80' : 'bg-gradient-to-r from-nocciola to-nocciola/80'
                  }`}>
                    {product.badge}
                  </div>

                  {/* SOLD OUT Badge - posizionato prominentemente */}
                  {isOutOfStock && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-full text-sm font-bold z-20 shadow-lg animate-pulse">
                      SOLD OUT
                    </div>
                  )}

                  {/* Sconto se presente e non è sold out */}
                  {!isOutOfStock && product.originalPrice && product.originalPrice !== 'null' && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
                      {t.products.product.discount}
                    </div>
                  )}

                  {/* Immagine prodotto con effetti */}
                  <div className={`relative mb-8 flex justify-center ${isOutOfStock ? 'relative' : ''}`}>
                    <div className="relative">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={180}
                        height={240}
                        className={`object-contain drop-shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-2 ${
                          isOutOfStock ? 'opacity-60' : ''
                        }`}
                      />
                      
                      {/* Overlay SOLD OUT sull'immagine */}
                      {isOutOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                          <div className="bg-red-600/90 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-xl transform -rotate-12">
                            SOLD OUT
                          </div>
                        </div>
                      )}
                      
                      {/* Riflessi multipli - solo se non sold out */}
                      {!isOutOfStock && (
                        <>
                          <div className="absolute top-1/4 left-1/2 w-3 h-20 bg-gradient-to-b from-white/60 to-transparent rounded-full blur-sm transform -translate-x-1/2"></div>
                          <div className="absolute top-1/3 left-1/3 w-1 h-12 bg-gradient-to-b from-white/40 to-transparent rounded-full blur-sm"></div>
                          
                          {/* Aura di luce */}
                          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Contenuto ridisegnato */}
                  <div className="text-center space-y-5">
                    <h3 className={`text-2xl sm:text-3xl font-serif text-olive group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-olive group-hover:to-salvia group-hover:bg-clip-text transition-all duration-300 ${
                      isOutOfStock ? 'opacity-60' : ''
                    }`}>
                      {product.name}
                    </h3>
                    
                    <p className={`text-base text-nocciola leading-relaxed px-2 ${
                      isOutOfStock ? 'opacity-60' : ''
                    }`}>
                      {product.description}
                    </p>
                    
                    <div className={`bg-gradient-to-r from-olive/5 to-salvia/5 rounded-2xl p-4 border border-olive/10 ${
                      isOutOfStock ? 'opacity-60' : ''
                    }`}>
                      <p className="text-sm text-nocciola/90 italic">
                        {product.details}
                      </p>
                    </div>

                    {/* Stock info */}
                    <div className="text-center text-xs">
                      {isOutOfStock ? (
                        <span className="text-red-600 font-bold bg-red-50 px-3 py-1 rounded-full border border-red-200">
                          {t.products.product.outOfStock}
                        </span>
                      ) : (
                        <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                          {translate('products.product.available', { count: product.stockQuantity })}
                        </span>
                      )}
                    </div>

                    {/* Sezione prezzo e pulsanti ridisegnata */}
                    <div className="flex justify-between items-center pt-6 border-t border-gradient-to-r from-olive/20 via-transparent to-olive/20">
                      <div className="text-left">
                        {!isOutOfStock && product.originalPrice && product.originalPrice !== 'null' && (
                          <div className="text-sm text-nocciola/60 line-through mb-1">
                            €{product.originalPrice}
                          </div>
                        )}
                        <div className={`text-3xl sm:text-4xl font-serif font-bold bg-gradient-to-r from-olive to-salvia bg-clip-text text-transparent ${
                          isOutOfStock ? 'opacity-50' : ''
                        }`}>
                          €{product.price}
                        </div>
                        <div className={`text-sm text-nocciola font-medium bg-olive/10 px-3 py-1 rounded-full inline-block ${
                          isOutOfStock ? 'opacity-50' : ''
                        }`}>
                          {product.size}
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        {/* Usa il componente AddToCartButton con size="icon" - disabilitato se sold out */}
                        <CartIconButton
                          onAddToCart={() => handleAddToCart(product)}
                          disabled={isOutOfStock}
                        />
                        
                        {/* Pulsante dettagli ridisegnato per essere coerente */}
                        <Link
                          href={`/products/${product.slug}`}
                          className={`bg-gradient-to-r from-nocciola to-nocciola/80 text-white px-6 py-3 rounded-2xl text-sm font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 text-center ${
                            isOutOfStock ? 'opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-lg' : ''
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {t.products.product.details}
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Overlay di hover ridisegnato - modificato per sold out */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-olive/5 via-transparent to-salvia/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none ${
                    isOutOfStock ? 'group-hover:opacity-30' : ''
                  }`}></div>
                </div>
              );
            })}
          </div>
        )}

        {/* Sezione informazioni completamente ridisegnata */}
        <div className="mt-24 sm:mt-28">
          <div className="text-center mb-16">
            <h3 className="text-2xl sm:text-3xl font-serif text-olive mb-4">
              {t.products.whyChoose.title} <span className="italic text-salvia">{t.products.whyChoose.subtitle}</span>
            </h3>
            <p className="text-nocciola max-w-2xl mx-auto">
              {t.products.whyChoose.description}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group text-center p-8 rounded-3xl bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-sm border border-white/50 hover:bg-white/70 transition-all duration-500 hover:scale-105">
              <div className="w-20 h-20 bg-gradient-to-br from-olive/20 to-olive/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-olive" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="text-xl font-serif text-olive mb-4">{t.products.whyChoose.quality.title}</h4>
              <p className="text-nocciola leading-relaxed">{t.products.whyChoose.quality.description}</p>
            </div>

            <div className="group text-center p-8 rounded-3xl bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-sm border border-white/50 hover:bg-white/70 transition-all duration-500 hover:scale-105">
              <div className="w-20 h-20 bg-gradient-to-br from-salvia/20 to-salvia/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-salvia" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <h4 className="text-xl font-serif text-olive mb-4">{t.products.whyChoose.shipping.title}</h4>
              <p className="text-nocciola leading-relaxed">
                {translate('products.whyChoose.shipping.description', { 
                  threshold: '50'
                })}
              </p>
            </div>

            <div className="group text-center p-8 rounded-3xl bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-sm border border-white/50 hover:bg-white/70 transition-all duration-500 hover:scale-105">
              <div className="w-20 h-20 bg-gradient-to-br from-nocciola/20 to-nocciola/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-nocciola" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="text-xl font-serif text-olive mb-4">{t.products.whyChoose.tradition.title}</h4>
              <p className="text-nocciola leading-relaxed">{t.products.whyChoose.tradition.description}</p>
            </div>
          </div>
        </div>

        {/* Call to action finale completamente ridisegnato */}
        <div className="text-center mt-20 sm:mt-24">
          <div className="inline-block p-1 rounded-full bg-gradient-to-r from-olive via-salvia to-nocciola">
            <Link 
              href="/products"
              className="bg-white hover:bg-transparent hover:text-white px-12 py-5 rounded-full text-lg font-semibold transition-all duration-500 hover:scale-105 inline-flex items-center gap-4 group text-olive hover:shadow-2xl"
            >
              {t.products.cta.button}
              <svg className="w-6 h-6 transition-transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          <p className="text-sm text-nocciola/70 mt-6 max-w-md mx-auto">
            {t.products.cta.description}
          </p>
        </div>

      </div>
    </section>
  );
}