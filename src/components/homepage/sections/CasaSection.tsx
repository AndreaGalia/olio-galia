// components/homepage/sections/CasaSection.tsx
"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useT } from '@/hooks/useT';

const CASA_IMAGE_URL = process.env.NEXT_PUBLIC_CASA_SICILIANA_IMAGE_URL || '';

export default function CasaSection() {
  const { t } = useT();

  return (
    <section className="bg-homepage-bg overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2">

        {/* Left: Content */}
        <div className="order-2 md:order-1 flex flex-col justify-center md:items-end py-20 px-8 sm:px-12 lg:px-20 md:text-right">
          <div className="mb-10">
            <h3 className="heading-md text-black mb-3">{t.casaSection.title1}</h3>
            <h3 className="heading-md text-black">{t.casaSection.title2}</h3>
          </div>
          <p className="text-sm sm:text-base text-black/80 leading-relaxed mb-12">
            {t.casaSection.description1}<br />
            {t.casaSection.description2}<br />
            {t.casaSection.description3}<br />
            {t.casaSection.description4}<br />
            {t.casaSection.description5}
          </p>
          <div>
            <Link
              href="/about"
              className="inline-block bg-olive text-beige px-6 py-3 md:px-8 md:py-4 text-xs md:text-sm font-medium transition-all duration-300 border border-olive/20 uppercase tracking-wider"
            >
              {t.casaSection.button}
            </Link>
          </div>
        </div>

        {/* Right: Image */}
        <div className="order-1 md:order-2 relative min-h-[60vh] md:min-h-[80vh]">
          <Image
            src={CASA_IMAGE_URL}
            alt={t.casaSection.title1}
            fill
            className="object-cover"
          />
        </div>

      </div>
    </section>
  );
}
