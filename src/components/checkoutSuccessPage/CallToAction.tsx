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
            <p className="text-[11px] tracking-[0.2em] uppercase text-black/40 mb-2">
              {t.checkoutSuccess.cta.title}
            </p>
            <p className="text-sm text-black/60 leading-relaxed max-w-sm">
              {t.checkoutSuccess.cta.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link
              href="/products"
              className="text-[11px] tracking-[0.25em] uppercase px-6 py-3 bg-sabbia text-black hover:bg-olive hover:text-beige transition-all duration-300 cursor-pointer whitespace-nowrap text-center"
            >
              {t.checkoutSuccess.cta.discoverProducts}
            </Link>
            <Link
              href="/"
              className="text-[11px] tracking-[0.25em] uppercase px-6 py-3 border border-olive/20 text-black/60 hover:bg-olive hover:text-beige hover:border-olive transition-all duration-300 cursor-pointer whitespace-nowrap text-center"
            >
              {t.checkoutSuccess.cta.backToHome}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
