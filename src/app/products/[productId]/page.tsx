"use client";
import { useState } from 'react';
import Link from 'next/link';
import { use } from "react";
import { BulkProposalSection } from '@/components/BulkProposalModal';

export default function ProductDetailPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = use(params);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const products = [
    {
      id: "1",
      name: "Bottiglia Premium Oil",
      category: "Premium Collection",
      description: "La nostra selezione più pregiata in formato esclusivo...",
      longDescription:
        "Questo olio rappresenta l'eccellenza della produzione Galia...",
      details: "Acidità < 0,2% - Limited Edition - Numerazione progressiva",
      price: "€89,90",
      originalPrice: "€99,90",
      size: "75ml",
      inStock: true,
      stockQuantity: 15,
      badge: "Limited Edition",
      color: "olive",
      images: [
        "/bottle-oil.png",
        "/bottle-oil.png",
        "/bottle-oil.png",
        "/bottle-oil.png",
      ],
      features: [
        "Olive centenarie selezionate a mano",
        "Estrazione a freddo tradizionale sotto 27°C",
        "Bottiglia numerata e sigillata individualmente",
        "Packaging regalo premium incluso",
        "Certificato di autenticità firmato",
        "Acidità inferiore allo 0,2%",
        "Polifenoli > 250 mg/kg",
        "Produzione limitata a 500 bottiglie/anno",
      ],
      nutritionalInfo: {
        energy: "3700 kJ / 900 kcal",
        fat: "100g",
        saturatedFat: "14g",
        carbs: "0g",
        protein: "0g",
        salt: "0g",
      },
      bestFor: "Degustazioni esclusive, regali di prestigio, collezione privata",
      origin: "Sicilia, Italia - Contrada Monte Galia",
      harvest: "Ottobre 2024 - Raccolta manuale notturna",
      processing: "Frantoio aziendale - Estrazione continua a freddo",
      awards: [
        "Medaglia d'Oro - Concorso Internazionale NYIOOC 2024",
        "Premio Eccellenza - Gambero Rosso 2024",
        "3 Foglie - Guida agli Extravergini Slow Food 2024",
      ],
    },
    {
      id: "2",
      name: "Beauty Oil",
      category: "Linea Benessere",
      description:
        "Olio extravergine delicato pensato per la cura quotidiana del corpo e dei capelli.",
      longDescription:
        "Un olio leggero, ricco di vitamina E e polifenoli, ideale come trattamento naturale per la pelle e i capelli. Estratto a freddo da olive raccolte precocemente, mantiene tutte le proprietà benefiche senza appesantire.",
      details: "Flacone in vetro scuro con contagocce",
      price: "€34,90",
      originalPrice: null,
      size: "100ml",
      inStock: true,
      stockQuantity: 40,
      badge: "Wellness",
      color: "salvia",
      images: [
        "/bottle-oil.png",
        "/bottle-oil.png",
        "/bottle-oil.png",
        "/bottle-oil.png",
      ],
      features: [
        "Ricco di antiossidanti naturali",
        "Idratazione profonda senza ungere",
        "Adatto a tutti i tipi di pelle",
        "100% naturale e vegan friendly",
      ],
      nutritionalInfo: null,
      bestFor: "Skincare, haircare, massaggi rilassanti",
      origin: "Sicilia, Italia",
      harvest: "2024",
      processing: "Spremitura a freddo",
      awards: [],
    },
    {
      id: "3",
      name: "Latta Olio da 5L",
      category: "Formato Convenienza",
      description:
        "La soluzione ideale per famiglie e ristorazione, grande formato al miglior prezzo.",
      longDescription:
        "Latta da 5 litri di olio extravergine Galia, ottenuto da olive raccolte manualmente e lavorate in giornata. Perfetta per chi consuma olio regolarmente e cerca convenienza senza rinunciare alla qualità.",
      details: "Latta in acciaio con tappo dosatore",
      price: "€79,90",
      originalPrice: "€89,90",
      size: "5L",
      inStock: true,
      stockQuantity: 100,
      badge: "Best Seller",
      color: "nocciola",
      images: [
        "/bottle-oil.png",
        "/bottle-oil.png",
        "/bottle-oil.png",
        "/bottle-oil.png",
      ],
      features: [
        "Ottimo rapporto qualità/prezzo",
        "Conservazione ottimale grazie al packaging",
        "Raccolta e spremitura in giornata",
        "Perfetta per uso familiare o professionale",
      ],
      nutritionalInfo: {
        energy: "3700 kJ / 900 kcal",
        fat: "100g",
        saturatedFat: "14g",
        carbs: "0g",
        protein: "0g",
        salt: "0g",
      },
      bestFor: "Famiglie, ristoranti, catering",
      origin: "Sicilia, Italia",
      harvest: "Ottobre 2024",
      processing: "Frantoio aziendale - Estrazione continua",
      awards: ["Selezione Miglior Qualità/Prezzo - 2024"],
    },
  ];

  // Trova il prodotto in base all'id passato
  const product = products.find((p) => p.id === productId);

  // Prodotti correlati = tutti tranne quello selezionato
  const relatedProducts = products.filter((p) => p.id !== productId);

  if (!product) {
    return <div>Prodotto non trovato</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sabbia to-beige">
      {/* Breadcrumb */}
      <div className="bg-white/50 py-4">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-nocciola hover:text-olive transition-colors">Home</Link>
            <span className="text-nocciola/50">→</span>
            <Link href="/products" className="text-nocciola hover:text-olive transition-colors">Prodotti</Link>
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
            <div className="aspect-square bg-white rounded-2xl p-8 shadow-lg border border-olive/10">
              <div className="w-full h-full bg-gradient-to-br from-sabbia/20 to-beige/30 rounded-xl flex items-center justify-center">
                {/* Bottiglia Premium */}
                <img 
                  src={product.images[selectedImage]} 
                  alt={product.name} 
                  className="object-contain h-full w-full rounded-xl"
                />
              </div>
            </div>
            
            {/* Thumbnail gallery */}
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-white rounded-lg p-2 border-2 transition-all duration-300 ${
                    selectedImage === index ? 'border-olive shadow-md' : 'border-olive/10'
                  }`}
                >
                  <img 
                    src={img} 
                    alt={`${product.name} ${index + 1}`} 
                    className="object-contain w-full h-full"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Dettagli prodotto */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-olive/10 text-olive px-3 py-1 rounded-full text-sm font-medium">
                  {product.category}
                </span>
                <span className="bg-olive text-beige px-3 py-1 rounded-full text-sm font-bold">
                  {product.badge}
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-olive mb-4 leading-tight">
                {product.name}
              </h1>
              
              <p className="text-lg text-nocciola leading-relaxed mb-6">
                {product.longDescription}
              </p>
            </div>

            {/* Prezzo e quantità */}
            <div className="bg-white/80 rounded-2xl p-6 shadow-lg">
              <div className="flex items-end gap-4 mb-4">
                {product.originalPrice && (
                  <span className="text-xl text-nocciola/60 line-through">
                    {product.originalPrice}
                  </span>
                )}
                <span className="text-4xl font-serif font-bold text-olive">
                  {product.price}
                </span>
                <span className="text-lg text-nocciola mb-1">
                  {product.size}
                </span>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-olive">Quantità:</label>
                  <div className="flex items-center border border-olive/20 rounded-full overflow-hidden">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-olive/10 transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 bg-olive/5 text-center min-w-[50px]">
                      {quantity}
                    </span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 hover:bg-olive/10 transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="text-sm text-nocciola">
                  {product.inStock ? (
                    <span className="text-green-600">✓ Disponibile ({product.stockQuantity} pezzi)</span>
                  ) : (
                    <span className="text-red-600">✗ Esaurito</span>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  disabled={!product.inStock}
                  className="flex-1 bg-gradient-to-r from-olive to-salvia text-beige py-4 rounded-full font-medium hover:shadow-xl transition-all duration-300 hover:scale-105 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                  Aggiungi al Carrello
                </button>
                
                <button className="px-6 py-4 bg-olive/10 text-olive hover:bg-olive hover:text-beige transition-all duration-300 rounded-full border border-olive/20 cursor-pointer">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Proposta quantità */}
            <BulkProposalSection productName={product.name} />
          </div>
        </div>

        {/* Schede dettagliate */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          
          {/* Caratteristiche */}
          <div className="bg-white/90 rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-serif text-olive mb-4">Caratteristiche</h3>
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
          <div className="bg-white/90 rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-serif text-olive mb-4">Valori Nutrizionali</h3>
            <div className="text-sm text-nocciola">
              <p className="mb-2 font-medium">Per 100g:</p>
              {product.nutritionalInfo
                ? Object.entries(product.nutritionalInfo).map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b border-olive/10 py-1">
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span>{value}</span>
                    </div>
                  ))
                : <div className="text-nocciola">Valori nutrizionali non disponibili.</div>
              }
            </div>
          </div>

          {/* Premi e riconoscimenti */}
          <div className="bg-white/90 rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-serif text-olive mb-4">Premi e Riconoscimenti</h3>
            <div className="space-y-3">
              {product.awards.map((award, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-nocciola">
                  <svg className="w-5 h-5 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {award}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prodotti correlati */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-olive mb-8 text-center">
            Potrebbe interessarti anche
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {relatedProducts.map((related) => (
              <Link key={related.id} href={`/products/${related.id}`}>
                <div className="bg-white/90 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                  <div className="w-20 h-24 bg-gradient-to-br from-olive/20 to-salvia/20 rounded-lg mx-auto mb-4">
                    <img 
                      src={related.images[0]} 
                      alt={related.name} 
                      className="w-20 h-24 object-contain rounded-lg mx-auto mb-4"
                    />
                  </div>
                  <h3 className="font-serif text-olive text-center mb-2">{related.name}</h3>
                  <p className="text-center text-2xl font-bold text-olive">{related.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}