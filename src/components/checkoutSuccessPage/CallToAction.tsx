import Link from 'next/link';
import { useT } from '@/hooks/useT';
import { CallToActionProps } from '@/types/checkoutSuccessTypes';

export default function CallToAction({ className = "" }: CallToActionProps) {
  const { t } = useT();

  return (
    <div className={`text-center ${className}`}>
      <div className="bg-white border border-olive/10 p-8 max-w-2xl mx-auto">
        <h3 className="text-2xl font-serif text-olive mb-6">{t.checkoutSuccess.cta.title}</h3>
        <p className="text-nocciola mb-8 leading-relaxed">
          {t.checkoutSuccess.cta.description}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/products"
            className="px-8 py-4 bg-olive text-beige transition-all duration-300 font-medium text-lg border border-olive/20 uppercase tracking-wider hover:bg-salvia"
          >
            {t.checkoutSuccess.cta.discoverProducts}
          </Link>

          <Link
            href="/"
            className="px-8 py-4 border-2 border-olive text-olive hover:bg-olive hover:text-beige transition-all duration-300 font-medium text-lg uppercase tracking-wider"
          >
            {t.checkoutSuccess.cta.backToHome}
          </Link>
        </div>
      </div>
    </div>
  );
}