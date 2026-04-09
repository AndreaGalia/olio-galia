"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useT } from '@/hooks/useT';
import TermsSection from './TermsSection';

function ItemList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 mt-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="flex-shrink-0 mt-0.5">—</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] tracking-[0.2em] uppercase text-black/40 mb-2 mt-5 first:mt-0">
      {children}
    </p>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-t border-olive/20 pt-4 mt-4 text-xs text-black/50 leading-relaxed">
      {children}
    </p>
  );
}

export default function TermsSectionsAccordion() {
  const { t } = useT();
  const ts = t.termsOfService;
  const tsPage = t.termsOfServicePage;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  };

  const pad = (n: number) => n < 10 ? `0${n}` : `${n}`;

  return (
    <section className="pb-16 sm:pb-24">
      <div className="px-6 sm:px-12 lg:px-16 xl:px-24 max-w-4xl mx-auto">

        {/* Intro */}
        <p className="border-t border-olive/20 pt-8 text-sm text-black/70 leading-relaxed">
          {ts.intro}
        </p>

        <div className="mt-8">

          {/* 01 — Informazioni sulla Società */}
          <TermsSection number={pad(1)} title={ts.sections.companyInfo.title} isActive={activeIndex === 0} onToggle={() => handleToggle(0)}>
            <p className="mb-3">{ts.sections.companyInfo.content}</p>
            <ul className="space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 mt-0.5">—</span>
                <span>{tsPage.companyInfo.address}: {process.env.NEXT_PUBLIC_CONTACT_ADDRESS || 'Sicilia, Italia'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 mt-0.5">—</span>
                <span>{tsPage.companyInfo.vat}: {process.env.NEXT_PUBLIC_VAT_NUMBER || 'N/A'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 mt-0.5">—</span>
                <span>{tsPage.companyInfo.email}: {process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@oliogalia.com'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 mt-0.5">—</span>
                <span>{tsPage.companyInfo.phone}: {process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER || '+39 XXX XXX XXXX'}</span>
              </li>
            </ul>
          </TermsSection>

          {/* 02 — Conclusione del Contratto */}
          <TermsSection number={pad(2)} title={ts.sections.contractFormation.title} isActive={activeIndex === 1} onToggle={() => handleToggle(1)}>
            <p className="mb-3">{ts.sections.contractFormation.content}</p>
            <ItemList items={ts.sections.contractFormation.list} />
          </TermsSection>

          {/* 03 — Prezzi */}
          <TermsSection number={pad(3)} title={ts.sections.prices.title} isActive={activeIndex === 2} onToggle={() => handleToggle(2)}>
            <p className="mb-3">{ts.sections.prices.content}</p>
            <p>{ts.sections.prices.shipping}</p>
          </TermsSection>

          {/* 04 — Modalità di Pagamento */}
          <TermsSection number={pad(4)} title={ts.sections.payment.title} isActive={activeIndex === 3} onToggle={() => handleToggle(3)}>
            <p className="mb-3">{ts.sections.payment.content}</p>
            <ItemList items={ts.sections.payment.list} />
            <Note>{ts.sections.payment.security}</Note>
          </TermsSection>

          {/* 05 — Spedizioni e Consegne */}
          <TermsSection number={pad(5)} title={ts.sections.shipping.title} isActive={activeIndex === 4} onToggle={() => handleToggle(4)}>
            <SubLabel>{ts.sections.shipping.timeframes.title}</SubLabel>
            <ItemList items={ts.sections.shipping.timeframes.list} />
            <p className="mt-4">{ts.sections.shipping.tracking}</p>
            <p className="mt-3">{ts.sections.shipping.issues}</p>
          </TermsSection>

          {/* 06 — Diritto di Recesso */}
          <TermsSection number={pad(6)} title={ts.sections.withdrawal.title} isActive={activeIndex === 5} onToggle={() => handleToggle(5)}>
            <p className="mb-3">{ts.sections.withdrawal.content}</p>
            <SubLabel>{ts.sections.withdrawal.procedure.title}</SubLabel>
            <ItemList items={ts.sections.withdrawal.procedure.list} />
            <div className="border-t border-olive/20 pt-4 mt-5 space-y-1.5">
              <p className="text-[11px] tracking-[0.2em] uppercase text-black/40">
                {ts.sections.withdrawal.exclusions.title}
              </p>
              <p className="text-xs text-black/50 leading-relaxed">
                {ts.sections.withdrawal.exclusions.content}
              </p>
            </div>
          </TermsSection>

          {/* 07 — Resi e Rimborsi */}
          <TermsSection number={pad(7)} title={ts.sections.returns.title} isActive={activeIndex === 6} onToggle={() => handleToggle(6)}>
            <p className="mb-3">{ts.sections.returns.content}</p>
            <ItemList items={ts.sections.returns.list} />
            <p className="mt-4">{ts.sections.returns.procedure}</p>
          </TermsSection>

          {/* 08 — Garanzia */}
          <TermsSection number={pad(8)} title={ts.sections.warranty.title} isActive={activeIndex === 7} onToggle={() => handleToggle(7)}>
            <p>{ts.sections.warranty.content}</p>
          </TermsSection>

          {/* 09 — Limitazioni di Responsabilità */}
          <TermsSection number={pad(9)} title={ts.sections.liability.title} isActive={activeIndex === 8} onToggle={() => handleToggle(8)}>
            <p className="mb-3">{ts.sections.liability.content}</p>
            <ItemList items={ts.sections.liability.list} />
          </TermsSection>

          {/* 10 — Proprietà Intellettuale */}
          <TermsSection number={pad(10)} title={ts.sections.intellectualProperty.title} isActive={activeIndex === 9} onToggle={() => handleToggle(9)}>
            <p>{ts.sections.intellectualProperty.content}</p>
          </TermsSection>

          {/* 11 — Privacy */}
          <TermsSection number={pad(11)} title={ts.sections.privacy.title} isActive={activeIndex === 10} onToggle={() => handleToggle(10)}>
            <p className="mb-4">{ts.sections.privacy.content}</p>
            <Link
              href="/privacy-policy"
              className="text-xs tracking-wider text-black/40 underline underline-offset-2 hover:text-black transition-colors"
            >
              {tsPage.privacyLink} →
            </Link>
          </TermsSection>

          {/* 12 — Risoluzione delle Controversie */}
          <TermsSection number={pad(12)} title={ts.sections.disputes.title} isActive={activeIndex === 11} onToggle={() => handleToggle(11)}>
            <p className="mb-3">{ts.sections.disputes.content}</p>
            <p className="text-xs text-black/50 leading-relaxed">{ts.sections.disputes.odr}</p>
          </TermsSection>

          {/* 13 — Modifiche ai Termini */}
          <TermsSection number={pad(13)} title={ts.sections.modifications.title} isActive={activeIndex === 12} onToggle={() => handleToggle(12)}>
            <p>{ts.sections.modifications.content}</p>
          </TermsSection>

          <div className="border-t border-olive/20" />
        </div>

        {/* CTA contatti */}
        <div className="mt-16 border-t border-olive/20 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-sm text-black/60 leading-relaxed">
            {ts.sections.contact.content}
          </p>
          <Link
            href="/contact"
            className="text-[11px] tracking-[0.25em] uppercase px-6 py-3 border border-olive/20 text-black/60 hover:bg-olive hover:text-beige hover:border-olive transition-all duration-300 cursor-pointer whitespace-nowrap"
          >
            {ts.sections.contact.title}
          </Link>
        </div>

      </div>
    </section>
  );
}
