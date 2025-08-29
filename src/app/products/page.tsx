"use client";
import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import AddToCartButton from '@/components/AddToCartButton';
import type { Product, ProductsData, Category } from '@/types/products';
import { useT } from '@/hooks/useT';

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('tutti');
  const [productsData, setProductsData] = useState<ProductsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { addToCart } = useCart();
  const { t, translate } = useT();

  // Carica i prodotti dall'API
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data: ProductsData = await response.json();
        setProductsData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Categorie con "tutti" aggiunto
  const allCategories = [
    { id: 'tutti', name: t.productsPage.categories.all, description: '' },
    ...(productsData?.categories || [])
  ];

  const filteredProducts = selectedCategory === 'tutti' 
    ? productsData?.products || []
    : productsData?.products.filter(product => product.category === selectedCategory) || [];

  const handleAddToCart = (productId: string) => {
    addToCart(productId, 1);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sabbia to-beige flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-olive/20 border-t-olive rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-olive text-lg">{t.productsPage.loading}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sabbia to-beige flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{translate('productsPage.error', { error })}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-olive text-beige rounded-full hover:bg-olive/80 transition-colors"
          >
            {t.productsPage.retry}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sabbia to-beige">
      {/* Header della pagina */}
      <section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden">
        {/* Elementi decorativi sottili */}
        <div className="absolute inset-0 opacity-3">
          <div className="absolute top-20 left-12 w-32 h-32 rounded-full bg-olive animate-pulse" style={{animationDuration: '4s'}}></div>
          <div className="absolute bottom-32 right-16 w-24 h-24 rounded-full bg-salvia animate-pulse" style={{animationDuration: '6s'}}></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
          <div className="text-center mb-12 sm:mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-olive/10 text-olive px-4 py-2 rounded-full text-sm font-medium mb-6 hover:scale-105 transition-transform duration-300">
              <div className="w-2 h-2 bg-olive rounded-full animate-pulse"></div>
              {t.productsPage.hero.badge}
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-olive mb-6 leading-tight animate-slide-up">
              {t.productsPage.hero.title.main} <span className="italic text-salvia">{t.productsPage.hero.title.highlight}</span>
            </h1>
            
            <p className="text-lg text-nocciola max-w-3xl mx-auto leading-relaxed animate-slide-up-delay">
              {t.productsPage.hero.description}
            </p>
          </div>

          {/* Filtri categoria */}
          <div className="flex flex-wrap justify-center gap-3 mb-12 sm:mb-16 animate-fade-in-slow">
            {allCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-medium transition-all duration-300 cursor-pointer hover:scale-105 ${
                  selectedCategory === category.id
                    ? 'bg-olive text-beige shadow-lg scale-105'
                    : 'bg-white/80 text-nocciola hover:bg-olive/10 hover:text-olive'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Griglia prodotti */}
      <section className="pb-16 sm:pb-20 lg:pb-24">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-nocciola text-lg">{t.productsPage.noProducts}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredProducts.map((product, index) => (
                <div 
                  key={product.id}
                  className="group relative bg-white/95 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-olive/5 animate-fade-in-card"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Badge */}
                  <div className={`absolute -top-2 -right-2 px-3 py-1 rounded-full text-xs font-bold text-white shadow-md rotate-12 z-10 ${
                    product.color === 'olive' ? 'bg-olive' : 
                    product.color === 'salvia' ? 'bg-salvia' : 'bg-nocciola'
                  }`}>
                    {product.badge}
                  </div>

                  {/* Sconto se presente */}
                  {product.originalPrice && product.originalPrice !== 'null' && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
                      {t.productsPage.product.discount}
                    </div>
                  )}

                  {/* Immagine prodotto */}
                  <div className="relative mb-6 flex justify-center">
                    <div className="w-full h-48 relative rounded-xl overflow-hidden bg-gradient-to-br from-sabbia/30 to-beige/50">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  </div>

                  {/* Contenuto */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg sm:text-xl font-serif text-olive mb-2 leading-tight">
                        {product.name}
                      </h3>
                      <p className="text-sm text-nocciola leading-relaxed px-2">
                        {product.description}
                      </p>
                    </div>

                    {/* Caratteristiche principali */}
                    <div className="text-xs text-nocciola/80 italic border-t border-olive/10 pt-3 px-2">
                      {product.details}
                    </div>

                    {/* Prezzo */}
                    <div className="flex justify-center items-center gap-2 pt-3 border-t border-olive/10">
                      <div className="text-center">
                        {product.originalPrice && product.originalPrice !== 'null' && (
                          <div className="text-sm text-nocciola/60 line-through mb-1">
                            €{product.originalPrice}
                          </div>
                        )}
                        <div className="text-2xl font-serif font-bold text-olive">
                          €{product.price}
                        </div>
                        <div className="text-sm text-nocciola mt-1">
                          {product.size}
                        </div>
                      </div>
                    </div>

                    {/* Stock info */}
                    <div className="text-center text-xs">
                      {product.inStock ? (
                        <span className="text-green-600">
                          {translate('productsPage.product.available', { count: product.stockQuantity })}
                        </span>
                      ) : (
                        <span className="text-red-600">{t.productsPage.product.outOfStock}</span>
                      )}
                    </div>

                    {/* Pulsanti azione */}
                    <div className="flex gap-2 animate-slide-up-buttons">
                      <AddToCartButton
                        onAddToCart={() => handleAddToCart(product.id)}
                        disabled={!product.inStock}
                        quantity={1}
                        size="compact"
                      />
                      
                      <Link 
                        href={`/products/${product.id}`}
                        className="flex-1 bg-olive/10 text-olive py-3 px-4 rounded-full font-medium hover:bg-olive/20 hover:shadow-lg transition-all duration-300 text-base border border-olive/20 hover:border-olive/40 flex items-center justify-center hover:scale-105"
                      >
                        {t.productsPage.product.details}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sezione vantaggi */}
      <section className="py-16 sm:py-20 bg-white/50">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="text-center mb-12 animate-fade-in-slow">
            <h2 className="text-3xl sm:text-4xl font-serif text-olive mb-4">
              {t.productsPage.benefits.title}
            </h2>
            <p className="text-nocciola max-w-2xl mx-auto">
              {t.productsPage.benefits.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {t.productsPage.benefits.items.map((item, index) => {
              const icons = [
                "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
                "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
                "M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zM4 12a8 8 0 1116 0v-2a6 6 0 10-12 0v2z"
              ];
              const colors = ['olive', 'salvia', 'nocciola', 'olive'];

              return (
                <div 
                  key={index}
                  className="text-center p-6 hover:scale-105 transition-transform duration-300 animate-fade-in-benefits"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className={`w-16 h-16 bg-${colors[index]}/10 rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-${colors[index]}/20 transition-colors duration-300`}>
                    <svg className={`w-8 h-8 text-${colors[index]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d={icons[index]} />
                    </svg>
                  </div>
                  <h3 className="text-lg font-serif text-olive mb-2">{item.title}</h3>
                  <p className="text-sm text-nocciola">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeInCard {
          from { opacity: 0; transform: translateY(15px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .animate-fade-in {
          animation: fadeIn 0.8s ease-out;
        }
        
        .animate-slide-up {
          animation: slideUp 0.6s ease-out 0.2s both;
        }
        
        .animate-slide-up-delay {
          animation: slideUp 0.6s ease-out 0.4s both;
        }
        
        .animate-fade-in-slow {
          animation: fadeIn 1s ease-out 0.6s both;
        }
        
        .animate-fade-in-card {
          animation: fadeInCard 0.5s ease-out both;
        }
        
        .animate-fade-in-benefits {
          animation: fadeInCard 0.6s ease-out both;
        }
        
        .animate-slide-up-buttons {
          animation: slideUp 0.4s ease-out 0.3s both;
        }
      `}</style>
    </div>
  );
}