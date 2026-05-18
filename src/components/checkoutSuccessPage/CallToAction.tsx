import Link from 'next/link';
import { useT } from '@/hooks/useT';
import { CallToActionProps } from '@/types/checkoutSuccessTypes';

export default function CallToAction({ className = "" }: CallToActionProps) {
  const { t } = useT();

  return (
    <section className={`pb-16 sm:pb-24 ${className}`}>
      <div className="px-6 sm:px-12 lg:px-16 xl:px-24 max-w-4xl mx-auto">
        <div className="border-t border-olive/20 pt-8 space-y-6">
          <div>
            <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black mb-2">
              {t.checkoutSuccess.cta.title}
            </p>
            <p className="garamond-13 max-w-sm">
              {t.checkoutSuccess.cta.description}
            </p>
          </div>

          <div className="flex flex-col gap-3 max-w-sm">
            <Link
              href="/products"
              className="w-full py-4 font-serif termina-11 tracking-[3.4px] uppercase border border-olive bg-olive text-beige hover:bg-sabbia hover:text-olive transition-all duration-200 cursor-pointer text-center block"
            >
              {t.checkoutSuccess.cta.discoverProducts}
            </Link>
            <Link
              href="/"
              className="w-full py-4 font-serif termina-11 tracking-[3.4px] uppercase border border-olive bg-sabbia text-olive hover:bg-olive hover:text-beige transition-all duration-200 cursor-pointer text-center block"
            >
              {t.checkoutSuccess.cta.backToHome}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
