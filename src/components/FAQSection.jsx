"use client";
import { useState } from 'react';

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "Come viene prodotto il vostro olio extravergine?",
      answer: "Il nostro olio viene prodotto seguendo metodi tradizionali tramandati dal nostro nonno. Le olive vengono raccolte rigorosamente a mano al giusto grado di maturazione, poi molite a freddo entro 24 ore dalla raccolta. Utilizziamo solo processi meccanici senza alcun trattamento chimico, garantendo un prodotto 100% naturale.",
      category: "Produzione"
    },
    {
      id: 2,
      question: "Qual è la differenza tra i vostri oli?",
      answer: "Offriamo tre tipologie: l'Olio Classico con fruttato intenso e note di erba fresca, l'Olio Biologico certificato con sapore delicato e retrogusto piccante equilibrato, e l'Olio Premium da olive centenarie con profilo organolettico complesso. Ogni olio ha caratteristiche uniche adatte a diversi palati e utilizzi.",
      category: "Prodotti"
    },
    {
      id: 3,
      question: "Come conservare al meglio l'olio extravergine?",
      answer: "Per mantenere intatte le proprietà organolettiche, conservate l'olio in luogo fresco e asciutto, lontano da fonti di luce e calore. La temperatura ideale è tra 14-18°C. Chiudete sempre bene il tappo dopo l'uso e consumate entro 18 mesi dall'apertura. Le nostre bottiglie scure proteggono già l'olio dalla luce.",
      category: "Conservazione"
    },
    {
      id: 4,
      question: "Fate spedizioni in tutta Italia?",
      answer: "Sì, spediamo in tutta Italia con corriere espresso. Per ordini superiori a €50 la spedizione è gratuita. Utilizziamo imballaggi speciali per proteggere le bottiglie durante il trasporto. I tempi di consegna sono generalmente di 2-3 giorni lavorativi. Per ordini internazionali, contattateci per informazioni specifiche.",
      category: "Spedizioni"
    },
    {
      id: 5,
      question: "L'olio è davvero prodotto in Sicilia?",
      answer: "Assolutamente sì. I nostri uliveti si trovano nelle colline siciliane dove il nostro nonno piantò i primi alberi nel 1950. Ogni fase della produzione avviene in loco: dalla coltivazione alla raccolta, dalla molitura all'imbottigliamento. Siamo orgogliosi della nostra origine 100% siciliana.",
      category: "Origine"
    },
    {
      id: 6,
      question: "Che certificazioni ha il vostro olio?",
      answer: "I nostri oli sono certificati DOP (Denominazione di Origine Protetta) e rispettano tutti gli standard di qualità italiani ed europei. L'olio biologico ha certificazione BIO rilasciata da ente accreditato. Effettuiamo regolari analisi chimiche e organolettiche per garantire acidità inferiore allo 0,3% e parametri qualitativi eccellenti.",
      category: "Certificazioni"
    },
    {
      id: 7,
      question: "È possibile visitare l'azienda?",
      answer: "Certamente! Organizziamo visite guidate su prenotazione dove potrete conoscere personalmente noi tre fratelli, visitare gli uliveti, assistere al processo di produzione e degustare i nostri oli. Le visite includono anche racconti sulla storia della famiglia e della tradizione olearia siciliana. Contattateci per programmare la vostra visita.",
      category: "Visite"
    },
    {
      id: 8,
      question: "Come posso essere sicuro della qualità del vostro olio?",
      answer: "La qualità è garantita da tre generazioni di esperienza, analisi chimiche certificate, raccolta manuale delle olive, spremitura a freddo entro 24 ore e controlli rigorosi in ogni fase. Ogni bottiglia riporta il numero di lotto per la tracciabilità completa. Offriamo inoltre la garanzia soddisfatti o rimborsati.",
      category: "Qualità"
    }
  ];

  const categories = [...new Set(faqs.map(faq => faq.category))];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="relative bg-gradient-to-br from-sabbia to-beige py-16 sm:py-20 lg:py-24 overflow-hidden">
      {/* Elementi decorativi di sfondo */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 right-12 w-32 h-32 rounded-full bg-olive"></div>
        <div className="absolute bottom-32 left-8 w-24 h-24 rounded-full bg-salvia"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full bg-nocciola"></div>
        <div className="absolute bottom-1/4 right-1/3 w-20 h-20 rounded-full bg-olive/60"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-4xl relative z-10">
        
        {/* Header della sezione */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-olive/10 text-olive px-4 py-2 rounded-full text-sm font-medium mb-6">
            <div className="w-2 h-2 bg-olive rounded-full"></div>
            Hai Domande?
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-olive mb-6 leading-tight">
            Domande
            <span className="block italic text-salvia">Frequenti</span>
          </h2>
          
          <p className="text-lg text-nocciola max-w-2xl mx-auto leading-relaxed">
            Trova le risposte alle domande più comuni sui nostri oli extravergini, 
            la produzione e i servizi offerti dalla famiglia Galia.
          </p>
        </div>

        {/* Categorie - Pills */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12">
          {categories.map((category) => (
            <div 
              key={category}
              className="bg-white/80 text-nocciola px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium shadow-sm border border-olive/10"
            >
              {category}
            </div>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4 sm:space-y-6">
          {faqs.map((faq, index) => (
            <div 
              key={faq.id}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 sm:px-8 py-6 sm:py-8 text-left flex items-center justify-between hover:bg-olive/5 transition-colors duration-300"
              >
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-medium text-salvia bg-salvia/10 px-2 py-1 rounded-full">
                      {faq.category}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-serif text-olive leading-tight">
                    {faq.question}
                  </h3>
                </div>
                
                <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-olive/10 flex items-center justify-center transition-all duration-300 ${
                  activeIndex === index ? 'rotate-45 bg-olive' : 'hover:bg-olive/20'
                }`}>
                  <svg 
                    className={`w-4 h-4 transition-colors duration-300 ${
                      activeIndex === index ? 'text-beige' : 'text-olive'
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </button>

              {/* Answer - Animated */}
              <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                activeIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="px-6 sm:px-8 pb-6 sm:pb-8 border-t border-olive/10">
                  <p className="text-nocciola leading-relaxed pt-4 sm:pt-6">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sezione contatto aggiuntiva */}
        <div className="mt-12 sm:mt-16">
          <div className="bg-gradient-to-r from-olive/10 to-salvia/10 rounded-2xl p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-olive/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-olive" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-serif text-olive mb-4">
              Non hai trovato la risposta?
            </h3>
            
            <p className="text-nocciola mb-6 max-w-md mx-auto">
              I fratelli Galia sono sempre disponibili per rispondere alle tue domande 
              e aiutarti a scegliere l'olio perfetto per te.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button className="bg-olive text-beige px-6 sm:px-8 py-3 sm:py-4 rounded-full font-medium hover:bg-salvia transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Scrivi una Email
              </button>
              
              <button className="text-olive border-2 border-olive px-6 sm:px-8 py-3 sm:py-4 rounded-full font-medium hover:bg-olive hover:text-beige transition-all duration-300 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                Chiamaci
              </button>

              <button 
                onClick={() => window.open('https://wa.me/3661368797?text=Ciao! Avrei una domanda sui vostri oli extravergini', '_blank')}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-medium hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                WhatsApp
              </button>
            </div>

            {/* Info contatto */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-olive/20">
              <div className="text-center">
                <div className="text-sm font-medium text-olive mb-1">Email</div>
                <div className="text-sm text-nocciola">info@oliogalia.it</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-olive mb-1">Telefono</div>
                <div className="text-sm text-nocciola">+39 123 456 7890</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-olive mb-1">WhatsApp</div>
                <div className="text-sm text-nocciola">+39 123 456 7890</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}