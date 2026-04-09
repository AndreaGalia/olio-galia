"use client";

import { useT } from '@/hooks/useT';

export default function SubSuccessEmailBanner() {
  const { t } = useT();
  const sub = t.subscription;

  return (
    <section className="pb-8">
      <div className="px-6 sm:px-12 lg:px-16 xl:px-24 max-w-4xl mx-auto">
        <div className="border-t border-olive/20 pt-8 flex items-start gap-4">
          <svg className="w-4 h-4 text-olive flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <div>
            <p className="text-[11px] tracking-[0.2em] uppercase text-black/40 mb-1.5">
              {sub?.emailConfirmationTitle}
            </p>
            <p className="text-sm text-black/70 leading-relaxed">
              {sub?.successEmailInfo}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
