"use client";
import { useState } from 'react';
import Link from 'next/link';
import { use } from "react";
import { BulkProposalSection } from '@/components/BulkProposalModal';
import { useCart } from '@/contexts/CartContext';
import AddToCartButton from '@/components/AddToCartButton';
import { useProducts, useProductBySlug } from '@/hooks/useProducts';
import { useT } from '@/hooks/useT';
import { useRouter } from 'next/navigation';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const { addToCart } = useCart();
  const { t, translate } = useT();
  
  // Usa il nuovo hook per trovare il prodotto per slug
  const { product, loading, error, notFound } = useProductBySlug(slug);
  const { products: allProducts } = useProducts();
  const relatedProducts = allProducts.filter((p) => p.slug !== slug);

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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sabbia to-beige flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-olive/20 border-t-olive rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-olive text-lg">{t.productDetailPage.loading}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sabbia to-beige flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{translate('productDetailPage.error', { error })}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-olive text-beige rounded-full hover:bg-olive/80 transition-colors"
          >
            {t.productDetailPage.retry}
          </button>
        </div>
      </div>
    );
  }

  // Product not found
  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sabbia to-beige flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-olive mb-4">{t.productDetailPage.notFound.title}</h1>
          <Link 
            href="/products" 
            className="px-6 py-3 bg-olive text-beige rounded-full hover:bg-olive/80 transition-colors inline-block"
          >
            {t.productDetailPage.notFound.button}
          </Link>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const isOutOfStock = !product.inStock || product.stockQuantity === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sabbia to-beige">
      {/* Breadcrumb */}
      <div className="bg-white/50 py-4">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-nocciola hover:text-olive transition-colors">{t.productDetailPage.breadcrumb.home}</Link>
            <span className="text-nocciola/50">→</span>
            <Link href="/products" className="text-nocciola hover:text-olive transition-colors">{t.productDetailPage.breadcrumb.products}</Link>
            <span className="text-nocciola/50">→</span>
            <span className="text-olive font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-8 sm:py-12">
        
        {/* Prodotto principale */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-16">
          
          {/* Galleria immagini */}
          <div className="space-y-4">
            <div className={`aspect-square bg-white rounded-2xl p-4 sm:p-8 shadow-lg border border-olive/10 relative ${
              isOutOfStock ? 'opacity-75 grayscale' : ''
            }`}>
              <div className="w-full h-full bg-gradient-to-br from-sabbia/20 to-beige/30 rounded-xl flex items-center justify-center relative">
                <img 
                  src={product.images[selectedImage]} 
                  alt={product.name} 
                  className={`object-contain h-full w-full rounded-xl ${
                    isOutOfStock ? 'opacity-60' : ''
                  }`}
                />
                
                {/* Overlay SOLD OUT sull'immagine */}
                {isOutOfStock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
                    <div className="bg-red-600/90 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-lg sm:text-2xl shadow-xl transform -rotate-12">
                      SOLD OUT
                    </div>
                  </div>
                )}
              </div>
              
              {/* Badge SOLD OUT nell'angolo */}
              {isOutOfStock && (
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-gradient-to-r from-red-600 to-red-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold z-10 shadow-lg animate-pulse">
                  SOLD OUT
                </div>
              )}
            </div>
            
            {/* Thumbnail gallery */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-white rounded-lg p-1.5 sm:p-2 border-2 transition-all duration-300 cursor-pointer relative ${
                    selectedImage === index ? 'border-olive shadow-md' : 'border-olive/10'
                  } ${isOutOfStock ? 'opacity-60' : ''}`}
                >
                  <img 
                    src={img} 
                    alt={`${product.name} ${index + 1}`} 
                    className={`object-contain w-full h-full ${
                      isOutOfStock ? 'opacity-60' : ''
                    }`}
                  />
                  {/* Mini overlay su thumbnails */}
                  {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                      <span className="text-white text-xs font-bold">OUT</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Dettagli prodotto */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                <span className={`bg-olive/10 text-olive px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                  isOutOfStock ? 'opacity-50' : ''
                }`}>
                  {product.categoryDisplay}
                </span>
                <span className={`bg-olive text-beige px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${
                  isOutOfStock ? 'opacity-50' : ''
                }`}>
                  {product.badge}
                </span>
                {/* Badge SOLD OUT prominente accanto ai badge esistenti */}
                {isOutOfStock && (
                  <span className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg animate-pulse">
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

            {/* Prezzo e quantità */}
            <div className="bg-white/80 rounded-2xl p-6 shadow-lg">
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
                  <div className={`flex items-center border border-olive/20 rounded-full overflow-hidden ${
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
                      {translate('productDetailPage.product.available', { count: product.stockQuantity })}
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
                  className={`px-6 py-4 bg-olive/10 text-olive hover:bg-olive hover:text-beige transition-all duration-300 rounded-full border border-olive/20 cursor-pointer ${
                    isOutOfStock ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Proposta quantità - SEMPRE VISIBILE come richiesto */}
            <BulkProposalSection productName={product.name} />
          </div>
        </div>

        {/* Schede dettagliate */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          
          {/* Caratteristiche */}
          <div className={`bg-white/90 rounded-2xl p-6 shadow-lg ${
            isOutOfStock ? 'opacity-75' : ''
          }`}>
            <h3 className="text-xl font-serif text-olive mb-4">{t.productDetailPage.product.characteristics}</h3>
            <ul className="space-y-2">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-nocciola">
                  <svg className="w-4 h-4 text-salvia flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Valori nutrizionali */}
          <div className={`bg-white/90 rounded-2xl p-6 shadow-lg ${
            isOutOfStock ? 'opacity-75' : ''
          }`}>
            <h3 className="text-xl font-serif text-olive mb-4">{t.productDetailPage.product.nutritionalInfo}</h3>
            <div className="text-sm text-nocciola">
              <p className="mb-2 font-medium">{t.productDetailPage.product.nutritionalPer100g}</p>
              {product.nutritionalInfo
                ? Object.entries(product.nutritionalInfo).map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b border-olive/10 py-1">
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span>{value}</span>
                    </div>
                  ))
                : <div className="text-nocciola">{t.productDetailPage.product.nutritionalNotAvailable}</div>
              }
            </div>
          </div>

          {/* Premi e riconoscimenti */}
          <div className={`bg-white/90 rounded-2xl p-6 shadow-lg ${
            isOutOfStock ? 'opacity-75' : ''
          }`}>
            <h3 className="text-xl font-serif text-olive mb-4">{t.productDetailPage.product.awards}</h3>
            <div className="space-y-3">
              {product.awards && product.awards.length > 0 ? (
                product.awards.map((award, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-nocciola">
                    <svg className="w-5 h-5 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {award}
                  </div>
                ))
              ) : (
                <p className="text-sm text-nocciola/70">{t.productDetailPage.product.noAwards}</p>
              )}
            </div>
          </div>
        </div>

        {/* Prodotti correlati */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-olive mb-8 text-center">
            {t.productDetailPage.product.relatedProducts}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {relatedProducts.map((related) => {
              const relatedIsOutOfStock = !related.inStock || related.stockQuantity === 0;
              
              return (
                <Link key={related.id} href={`/products/${related.slug}`}>
                  <div className={`bg-white/90 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer relative ${
                    relatedIsOutOfStock ? 'opacity-75 grayscale' : ''
                  }`}>
                    {/* Badge SOLD OUT per prodotti correlati */}
                    {relatedIsOutOfStock && (
                      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-gradient-to-r from-red-600 to-red-700 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-bold z-10 shadow-lg">
                        SOLD OUT
                      </div>
                    )}
                    
                    <div className={`w-16 sm:w-20 h-20 sm:h-24 bg-gradient-to-br from-olive/20 to-salvia/20 rounded-lg mx-auto mb-3 sm:mb-4 relative flex items-center justify-center ${
                      relatedIsOutOfStock ? 'opacity-60' : ''
                    }`}>
                      <img 
                        src={related.images[0]} 
                        alt={related.name} 
                        className={`w-full h-full object-contain rounded-lg ${
                          relatedIsOutOfStock ? 'opacity-60' : ''
                        }`}
                      />
                      {/* Mini overlay per prodotti correlati */}
                      {relatedIsOutOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                          <span className="text-white text-xs font-bold">OUT</span>
                        </div>
                      )}
                    </div>
                    <h3 className={`font-serif text-olive text-center mb-2 text-sm sm:text-base ${
                      relatedIsOutOfStock ? 'opacity-60' : ''
                    }`}>
                      {related.name}
                    </h3>
                    <p className={`text-center text-lg sm:text-2xl font-bold text-olive ${
                      relatedIsOutOfStock ? 'opacity-50' : ''
                    }`}>
                      €{related.price}
                    </p>
                    {!relatedIsOutOfStock && related.originalPrice && related.originalPrice !== 'null' && (
                      <p className="text-center text-xs sm:text-sm text-gray-500 line-through">€{related.originalPrice}</p>
                    )}
                    
                    {/* Stock status per prodotti correlati */}
                    <div className="text-center text-xs mt-2">
                      {relatedIsOutOfStock ? (
                        <span className="text-red-600 font-bold bg-red-50 px-2 py-1 rounded-full">{t.productDetailPage.stockNotAvaible}</span>
                      ) : (
                        <span className="text-green-600 bg-green-50 px-2 py-1 rounded-full">{t.productDetailPage.stockAvaible}</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}