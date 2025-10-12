// components/sections/products/ProductsInfo.tsx
"use client";
import { useT } from '@/hooks/useT';

export function ProductsInfo() {
  const { t, translate } = useT();

  return (
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
              threshold: '100'
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
  );
}