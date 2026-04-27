import Link from 'next/link';
import { useT } from '@/hooks/useT';
import { CallToActionProps } from '@/types/checkoutSuccessTypes';

export default function CallToAction({ className = "" }: CallToActionProps) {
  const { t } = useT();

  return (
    <section className={`pb-16 sm:pb-24 ${className}`}>
      <div className="px-6 sm:px-12 lg:px-16 xl:px-24 max-w-4xl mx-auto">
        <div className="border-t border-olive/20 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black mb-2">
              {t.checkoutSuccess.cta.title}
            </p>
            <p className="garamond-13 max-w-sm">
              {t.checkoutSuccess.cta.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link
              href="/products"
              className="font-serif termina-11 tracking-[0.25em] uppercase px-6 py-3 bg-sabbia text-black hover:bg-olive hover:text-beige transition-all duration-300 cursor-pointer whitespace-nowrap text-center"
            >
              {t.checkoutSuccess.cta.discoverProducts}
            </Link>
            <Link
              href="/"
              className="font-serif termina-11 tracking-[0.25em] uppercase px-6 py-3 border border-olive/20 text-black hover:bg-olive hover:text-beige hover:border-olive transition-all duration-300 cursor-pointer whitespace-nowrap text-center"
            >
              {t.checkoutSuccess.cta.backToHome}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
