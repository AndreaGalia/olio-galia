"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useT } from '@/hooks/useT';
import CookieSection from './CookieSection';

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

export default function CookieSectionsAccordion() {
  const { t } = useT();
  const cp = t.cookiePolicy;
  const cpPage = t.cookiePolicyPage;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="pb-16 sm:pb-24">
      <div className="px-6 sm:px-12 lg:px-16 xl:px-24 max-w-4xl mx-auto">

        {/* Intro */}
        <p className="border-t border-olive/20 pt-8 garamond-13">
          {cp.intro}
        </p>

        {/* Accordion sezioni */}
        <div className="mt-8">

          {/* 01 — Cosa sono i Cookie */}
          <CookieSection
            number="01"
            title={cp.sections.whatAreCookies.title}
            isActive={activeIndex === 0}
            onToggle={() => handleToggle(0)}
          >
            <p>{cp.sections.whatAreCookies.content}</p>
          </CookieSection>

          {/* 02 — Tipologie di Cookie */}
          <CookieSection
            number="02"
            title={cp.sections.cookieTypes.title}
            isActive={activeIndex === 1}
            onToggle={() => handleToggle(1)}
          >
            <div className="space-y-6">
              {/* Tecnici */}
              <div>
                <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black mb-2">
                  {cp.sections.cookieTypes.technical.title}
                </p>
                <p>{cp.sections.cookieTypes.technical.description}</p>
                <ItemList items={cp.sections.cookieTypes.technical.list} />
                <p className="garamond-13 mt-3">{cp.sections.cookieTypes.technical.note}</p>
              </div>

              {/* Analytics */}
              <div className="border-t border-olive/20 pt-5">
                <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black mb-2">
                  {cp.sections.cookieTypes.analytics.title}
                </p>
                <p>{cp.sections.cookieTypes.analytics.description}</p>
                <ItemList items={cp.sections.cookieTypes.analytics.list} />
                <p className="garamond-13 mt-3">{cp.sections.cookieTypes.analytics.note}</p>
              </div>

              {/* Terze parti */}
              <div className="border-t border-olive/20 pt-5">
                <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black mb-2">
                  {cp.sections.cookieTypes.thirdParty.title}
                </p>
                <p>{cp.sections.cookieTypes.thirdParty.description}</p>
                <ItemList items={cp.sections.cookieTypes.thirdParty.list} />
              </div>
            </div>
          </CookieSection>

          {/* 03 — Come Gestire i Cookie */}
          <CookieSection
            number="03"
            title={cp.sections.cookieManagement.title}
            isActive={activeIndex === 2}
            onToggle={() => handleToggle(2)}
          >
            <div className="space-y-4">
              <p>{cp.sections.cookieManagement.content}</p>

              <div>
                <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black mb-2">
                  {cp.sections.cookieManagement.browsers.title}
                </p>
                <ItemList items={cp.sections.cookieManagement.browsers.list} />
              </div>

              <p className="border-t border-olive/20 pt-4 garamond-13">
                {cp.sections.cookieManagement.note}
              </p>
            </div>
          </CookieSection>

          {/* 04 — Elenco Cookie */}
          <CookieSection
            number="04"
            title={cp.sections.cookieList.title}
            isActive={activeIndex === 3}
            onToggle={() => handleToggle(3)}
          >
            <div className="space-y-4">
              <p>{cp.sections.cookieList.description}</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-olive/20">
                      <th className="pb-3 pr-4 font-serif termina-11 tracking-[0.15em] uppercase text-black font-normal">{cpPage.table.name}</th>
                      <th className="pb-3 pr-4 font-serif termina-11 tracking-[0.15em] uppercase text-black font-normal">{cpPage.table.type}</th>
                      <th className="pb-3 pr-4 font-serif termina-11 tracking-[0.15em] uppercase text-black font-normal">{cpPage.table.purpose}</th>
                      <th className="pb-3 font-serif termina-11 tracking-[0.15em] uppercase text-black font-normal">{cpPage.table.duration}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cp.sections.cookieList.items.map((item: { name: string; type: string; purpose: string; duration: string }, i: number) => (
                      <tr key={i} className="border-b border-olive/20">
                        <td className="py-3 pr-4 font-mono text-xs text-black">{item.name}</td>
                        <td className="py-3 pr-4 text-black">{item.type}</td>
                        <td className="py-3 pr-4 text-black">{item.purpose}</td>
                        <td className="py-3 text-black">{item.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CookieSection>

          {/* 05 — Consenso */}
          <CookieSection
            number="05"
            title={cp.sections.consent.title}
            isActive={activeIndex === 4}
            onToggle={() => handleToggle(4)}
          >
            <p>{cp.sections.consent.content}</p>
          </CookieSection>

          {/* 06 — Aggiornamenti */}
          <CookieSection
            number="06"
            title={cp.sections.updates.title}
            isActive={activeIndex === 5}
            onToggle={() => handleToggle(5)}
          >
            <p>{cp.sections.updates.content}</p>
          </CookieSection>

          <div className="border-t border-olive/20" />
        </div>

        {/* CTA contatti */}
        <div className="mt-16 border-t border-olive/20 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="garamond-13">
            {cp.sections.contact.content}
          </p>
          <Link
            href="/contact"
            className="font-serif termina-11 tracking-[0.25em] uppercase px-6 py-3 border border-olive/20 text-black hover:bg-olive hover:text-beige hover:border-olive transition-all duration-300 cursor-pointer whitespace-nowrap"
          >
            {cp.sections.contact.title}
          </Link>
        </div>

      </div>
    </section>
  );
}
