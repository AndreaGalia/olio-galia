"use client";
import { useState } from 'react';
import Image from "next/image";
import Link from 'next/link';

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('tutti');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  type CartItem = {
    id: number;
    name: string;
    price: string;
    quantity: number;
    image: string;
    size: string;
  };

  const products = [
    {
      id: 1,
      name: "Bottiglia Premium Oil",
      category: "premium",
      description: "La nostra selezione più pregiata in formato esclusivo. Olio extravergine da olive centenarie, perfetto per degustazioni e regali raffinati.",
      longDescription: "Questo olio rappresenta l'eccellenza della produzione Galia. Realizzato esclusivamente con olive secolari coltivate nelle nostre terre più antiche, viene estratto con tecniche tradizionali e confezionato in eleganti bottiglie da collezione. Il profilo organolettico complesso presenta note di carciofo, mandorla dolce e un leggero pizzicore finale che testimonia la sua autenticità.",
      details: "Acidità < 0,2% - Limited Edition - Numerazione progressiva",
      price: "€89,90",
      originalPrice: "€99,90",
      size: "75ml",
      image: "/bottle-oil.png",
      badge: "Limited Edition",
      color: "olive",
      features: [
        "Olive centenarie selezionate",
        "Estrazione a freddo tradizionale",
        "Bottiglia numerata e sigillata",
        "Packaging regalo incluso",
        "Certificato di autenticità"
      ],
      bestFor: "Degustazioni, regali esclusivi, collezione"
    },
    {
      id: 2,
      name: "Beauty Oil",
      category: "beauty",
      description: "Olio massaggiante premium per la cura della pelle. Formula esclusiva con olio extravergine arricchito di vitamine naturali.",
      longDescription: "Il nostro Beauty Oil rappresenta l'innovazione nel settore benessere. Formulato con il nostro olio extravergine di oliva più puro e arricchito con estratti naturali di lavanda e vitamina E, è perfetto per massaggi rilassanti e trattamenti della pelle. La texture vellutata si assorbe rapidamente lasciando la pelle morbida e nutrita senza residui oleosi.",
      details: "Dermatologicamente testato - Ingredienti 100% naturali - Cruelty free",
      price: "€34,90",
      originalPrice: null,
      size: "100ml",
      image: "/bottle-oil.png",
      badge: "Premium Care",
      color: "salvia",
      features: [
        "Olio extravergine purissimo",
        "Arricchito con vitamina E",
        "Estratto naturale di lavanda",
        "Dermatologicamente testato",
        "Packaging sostenibile"
      ],
      bestFor: "Massaggi, cura della pelle, benessere"
    },
    {
      id: 3,
      name: "Latta Olio da 5L",
      category: "famiglia",
      description: "La scelta ideale per le famiglie e i veri intenditori. Formato convenienza del nostro olio extravergine classico in latta protettiva.",
      longDescription: "Il formato da 5 litri in latta è perfetto per chi non vuole rinunciare alla qualità del nostro olio extravergine nella vita quotidiana. La latta protegge l'olio dalla luce e dall'ossidazione, mantenendo intatte tutte le proprietà organolettiche. Ideale per famiglie numerose, ristoranti o per chi desidera avere sempre a disposizione un olio di eccellenza per ogni utilizzo culinario.",
      details: "Rapporto qualità-prezzo eccellente - Latta protettiva anti-luce - Uso quotidiano",
      price: "€79,90",
      originalPrice: "€89,90",
      size: "5L",
      image: "/bottle-oil.png",
      badge: "Famiglia",
      color: "nocciola",
      features: [
        "Formato convenienza famiglia",
        "Latta protettiva premium",
        "Olio extravergine classico",
        "Perfetto per uso quotidiano",
        "Risparmio garantito"
      ],
      bestFor: "Famiglie, uso quotidiano, ristoranti"
    }
  ];

  const categories = [
    { id: 'tutti', name: 'Tutti i Prodotti' },
    { id: 'premium', name: 'Premium Collection' },
    { id: 'beauty', name: 'Beauty & Care' },
    { id: 'famiglia', name: 'Formato Famiglia' }
  ];

  const filteredProducts = selectedCategory === 'tutti' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  type Product = typeof products[number];

  // Funzioni carrello
  const addToCart = (product: Product) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
        size: product.size
      }]);
    }
  };

  const removeFromCart = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price.replace('€', '').replace(',', '.'));
      return total + (price * item.quantity);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sabbia to-beige">
      {/* Header della pagina */}
      <section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden">
        {/* Elementi decorativi animati */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-12 w-32 h-32 rounded-full bg-olive animate-pulse" style={{animationDelay: '0s'}}></div>
          <div className="absolute bottom-32 right-16 w-24 h-24 rounded-full bg-salvia animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full bg-nocciola animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            {/* Badge animato */}
            <div className="inline-flex items-center gap-2 bg-olive/10 text-olive px-4 py-2 rounded-full text-sm font-medium mb-6 transform hover:scale-105 transition-all duration-300 hover:bg-olive/20">
              <div className="w-2 h-2 bg-olive rounded-full animate-ping"></div>
              Catalogo Completo
            </div>
            
            {/* Titolo con animazione staggered */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-olive mb-6 leading-tight">
              <span className="inline-block animate-fade-in-up" style={{animationDelay: '0.2s'}}>I Nostri</span>
              <span className="block italic text-salvia animate-fade-in-up" style={{animationDelay: '0.4s'}}>Prodotti</span>
            </h1>
            
            <p className="text-lg text-nocciola max-w-3xl mx-auto leading-relaxed animate-fade-in-up opacity-0" style={{animationDelay: '0.6s', animationFillMode: 'forwards'}}>
              Dalla tradizione siciliana, una selezione esclusiva che spazia dall'olio 
              extravergine premium ai prodotti per il benessere, fino ai formati famiglia 
              per l'uso quotidiano.
            </p>
          </div>

          {/* Filtri categoria con animazione */}
          <div className="flex flex-wrap justify-center gap-3 mb-12 sm:mb-16">
            {categories.map((category, index) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-medium transition-all duration-500 cursor-pointer transform hover:scale-105 animate-fade-in-up opacity-0 ${
                  selectedCategory === category.id
                    ? 'bg-olive text-beige shadow-lg scale-105'
                    : 'bg-white/80 text-nocciola hover:bg-olive/10 hover:text-olive'
                }`}
                style={{
                  animationDelay: `${0.8 + index * 0.1}s`,
                  animationFillMode: 'forwards'
                }}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredProducts.map((product, index) => (
              <div 
                key={product.id}
                className="group relative bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2 border border-olive/5 animate-fade-in-up opacity-0"
                style={{
                  animationDelay: `${1.2 + index * 0.15}s`,
                  animationFillMode: 'forwards'
                }}
              >
                {/* Badge animato */}
                <div className={`absolute -top-2 -right-2 px-3 py-1 rounded-full text-xs font-bold text-white shadow-md rotate-12 z-10 transform group-hover:rotate-0 group-hover:scale-110 transition-all duration-500 ${
                  product.color === 'olive' ? 'bg-olive' : 
                  product.color === 'salvia' ? 'bg-salvia' : 'bg-nocciola'
                }`}>
                  {product.badge}
                </div>

                {/* Sconto se presente */}
                {product.originalPrice && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10 animate-bounce">
                    SCONTO
                  </div>
                )}

                {/* Immagine prodotto con animazioni */}
                <div className="relative mb-6 flex justify-center group">
                  <div className="w-full h-48 relative rounded-xl overflow-hidden bg-gradient-to-br from-sabbia/30 to-beige/50 group-hover:shadow-inner transition-all duration-500">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain group-hover:scale-110 transition-transform duration-700 ease-out"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent group-hover:from-black/20 transition-all duration-500"></div>
                    
                    {/* Overlay con effetto shine */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                  </div>
                </div>

                {/* Contenuto */}
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg sm:text-xl font-serif text-olive group-hover:text-salvia transition-colors duration-500 mb-2 leading-tight transform group-hover:scale-105">
                      {product.name}
                    </h3>
                    <p className="text-sm text-nocciola leading-relaxed px-2 group-hover:text-nocciola/80 transition-colors duration-300">
                      {product.description}
                    </p>
                  </div>

                  {/* Caratteristiche principali */}
                  <div className="text-xs text-nocciola/80 italic border-t border-olive/10 pt-3 px-2 group-hover:border-olive/20 transition-colors duration-300">
                    {product.details}
                  </div>

                  {/* Prezzo con animazione */}
                  <div className="flex justify-center items-center gap-2 pt-3 border-t border-olive/10 group-hover:border-olive/20 transition-colors duration-300">
                    <div className="text-center">
                      {product.originalPrice && (
                        <div className="text-sm text-nocciola/60 line-through mb-1 transform group-hover:scale-105 transition-transform duration-300">
                          {product.originalPrice}
                        </div>
                      )}
                      <div className="text-2xl font-serif font-bold text-olive transform group-hover:scale-110 transition-transform duration-300">
                        {product.price}
                      </div>
                      <div className="text-sm text-nocciola mt-1 group-hover:text-nocciola/80 transition-colors duration-300">
                        {product.size}
                      </div>
                    </div>
                  </div>

                  {/* Pulsanti azione con animazioni migliorate */}
                  <div className="flex gap-2 transform group-hover:translate-y-0 transition-transform duration-300">
                    <button 
                      onClick={() => addToCart(product)}
                      className="flex-1 bg-gradient-to-r from-olive to-salvia text-beige py-3 rounded-full font-medium hover:shadow-xl transition-all duration-500 hover:scale-105 hover:from-salvia hover:to-olive text-sm flex items-center justify-center gap-2 cursor-pointer transform active:scale-95"
                    >
                      <svg className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                      </svg>
                      Aggiungi
                    </button>
                  <Link 
                    href={`/products/${product.id}`}
                    className="flex-1 bg-olive/10 text-olive py-3 rounded-full font-medium hover:bg-olive/20 hover:shadow-lg transition-all duration-500 text-sm border border-olive/20 hover:border-olive/40 flex items-center justify-center transform hover:scale-105 active:scale-95"
                  >
                    Dettagli
                  </Link>
                  </div>
                </div>

                {/* Hover overlay migliorato */}
                <div className="absolute inset-0 bg-gradient-to-t from-olive/5 via-transparent to-salvia/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Carrello laterale (mantenuto invariato) */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex">
          <div className="ml-auto bg-white w-full max-w-md h-full overflow-y-auto">
            <div className="p-6">
              {/* Header carrello */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif text-olive">Carrello</h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-8 h-8 bg-olive/10 hover:bg-olive/20 rounded-full flex items-center justify-center transition-colors duration-300"
                >
                  <svg className="w-4 h-4 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Contenuto carrello */}
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-nocciola/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a1 1 0 001 1h2a1 1 0 001-1v-6m-6 0V9a1 1 0 011-1h2a1 1 0 011-1V9" />
                  </svg>
                  <p className="text-nocciola">Il tuo carrello è vuoto</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-4 bg-olive text-beige px-6 py-2 rounded-full hover:bg-olive/90 transition-colors"
                  >
                    Continua shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-olive/5 rounded-xl">
                      <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-white">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-contain"
                          sizes="64px"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-olive text-sm mb-1">{item.name}</h3>
                        <p className="text-xs text-nocciola mb-2">{item.size}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-serif text-olive">{item.price}</span>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 bg-olive/10 rounded-full flex items-center justify-center text-olive hover:bg-olive/20"
                            >
                              -
                            </button>
                            <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 bg-olive/10 rounded-full flex items-center justify-center text-olive hover:bg-olive/20"
                            >
                              +
                            </button>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="ml-2 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-red-500 hover:bg-red-200"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Totale */}
                  <div className="border-t border-olive/10 pt-4 mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-serif text-olive">Totale:</span>
                      <span className="text-2xl font-serif font-bold text-olive">
                        €{getTotalPrice().toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    
                    <button className="w-full bg-gradient-to-r from-olive to-salvia text-beige py-4 rounded-full font-medium hover:shadow-xl transition-all duration-300 hover:scale-105">
                      Procedi all'acquisto
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sezione vantaggi con animazioni staggered */}
      <section className="py-16 sm:py-20 bg-white/50">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="text-center mb-12 animate-fade-in-up opacity-0" style={{animationDelay: '2s', animationFillMode: 'forwards'}}>
            <h2 className="text-3xl sm:text-4xl font-serif text-olive mb-4">
              Perché Scegliere Galia
            </h2>
            <p className="text-nocciola max-w-2xl mx-auto">
              Ogni prodotto rappresenta l'eccellenza della tradizione siciliana
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                icon: "M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z",
                title: "Qualità Premium",
                description: "Controlli rigorosi e certificazioni di qualità",
                color: "olive"
              },
              {
                icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                title: "Spedizione Sicura",
                description: "Imballaggi protettivi e consegna garantita",
                color: "salvia"
              },
              {
                icon: "M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z",
                title: "Tradizione Familiare",
                description: "75 anni di passione e sapienza siciliana",
                color: "nocciola"
              },
              {
                icon: "M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z",
                title: "Soddisfazione Garantita",
                description: "Rimborso completo se non sei soddisfatto",
                color: "olive"
              }
            ].map((item, index) => (
              <div 
                key={index}
                className="text-center p-6 group animate-fade-in-up opacity-0 hover:transform hover:scale-105 transition-all duration-500"
                style={{
                  animationDelay: `${2.2 + index * 0.2}s`,
                  animationFillMode: 'forwards'
                }}
              >
                <div className={`w-16 h-16 bg-${item.color}/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-${item.color}/20 transition-colors duration-300 group-hover:scale-110 transform`}>
                  <svg className={`w-8 h-8 text-${item.color} group-hover:scale-110 transition-transform duration-300`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d={item.icon} clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-serif text-olive mb-2 group-hover:text-salvia transition-colors duration-300">{item.title}</h3>
                <p className="text-sm text-nocciola group-hover:text-nocciola/80 transition-colors duration-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stili CSS per le animazioni personalizzate */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}