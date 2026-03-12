// components/homepage/sections/OlivaSection.tsx
"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useT } from '@/hooks/useT';

const OLIVA_IMAGE_URL = process.env.NEXT_PUBLIC_OLIVA_SICILIANA_IMAGE_URL || '';

export default function OlivaSection() {
  const { t } = useT();

  return (
    <section className="bg-homepage-bg overflow-hidden">

      {/* Header: Why Choose / Olio Galia — right-aligned, mirrors ProductsHeader */}
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl pt-20 mb-16 sm:mb-20">
        <div className="text-right">
          <h2 className="heading-xl text-black mb-3">{t.products.whyChoose.title}</h2>
          <h3 className="heading-lg text-black">{t.products.whyChoose.subtitle}</h3>
        </div>
      </div>

      {/* Grid: image left, content right */}
      <div className="grid grid-cols-1 md:grid-cols-2">

        {/* Left: Image */}
        <div className="relative min-h-[60vh] md:min-h-[80vh]">
          <Image
            src={OLIVA_IMAGE_URL}
            alt={t.olivaSection.title}
            fill
            className="object-cover"
          />
        </div>

        {/* Right: Content */}
        <div className="flex flex-col justify-center py-20 px-8 sm:px-12 lg:px-20">
          <div className="mb-10">
            <h3 className="heading-md text-black mb-3">{t.olivaSection.subtitle1}</h3>
            <h3 className="heading-md text-black">{t.olivaSection.subtitle2}</h3>
          </div>
          <p className="text-sm sm:text-base text-black/80 leading-relaxed mb-12">
            {t.olivaSection.description1}<br />{t.olivaSection.description2}
          </p>
          <div>
            <Link
              href="/products"
              className="inline-block bg-olive text-beige px-6 py-3 md:px-8 md:py-4 text-xs md:text-sm font-medium transition-all duration-300 border border-olive/20 uppercase tracking-wider"
            >
              {t.olivaSection.button}
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
