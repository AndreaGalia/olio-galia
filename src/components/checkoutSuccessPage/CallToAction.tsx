import Link from 'next/link';
import { useT } from '@/hooks/useT';
import { CallToActionProps } from '@/types/checkoutSuccessTypes';

export default function CallToAction({ className = "" }: CallToActionProps) {
  const { t } = useT();

  return (
    <div className={`text-center ${className}`}>
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 max-w-2xl mx-auto shadow-xl border border-olive/10">
        <h3 className="text-2xl font-serif text-olive mb-6">{t.checkoutSuccess.cta.title}</h3>
        <p className="text-nocciola mb-8 leading-relaxed">
          {t.checkoutSuccess.cta.description}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/products"
            className="group px-8 py-4 bg-gradient-to-r from-olive to-salvia text-beige rounded-full hover:shadow-xl transition-all duration-300 hover:scale-105 font-medium text-lg relative overflow-hidden"
          >
            <span className="relative z-10">{t.checkoutSuccess.cta.discoverProducts}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-salvia to-olive transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
          </Link>
          
          <Link 
            href="/"
            className="group px-8 py-4 border-2 border-olive text-olive rounded-full hover:bg-olive hover:text-beige transition-all duration-300 font-medium text-lg"
          >
            {t.checkoutSuccess.cta.backToHome}
          </Link>
        </div>
      </div>
    </div>
  );
}