// components/homepage/sections/AboutSection.tsx
"use client";
import Image from 'next/image';
import { useT } from '@/hooks/useT';

const ABOUT_IMAGE_URL = process.env.NEXT_PUBLIC_HISTORIC_IMAGE_URL || '';

export default function AboutSection() {
  const { t } = useT();

  return (
    <section className="bg-homepage-bg overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2">

        {/* Left: Image */}
        <div className="relative min-h-[60vh] md:min-h-[80vh]">
          <Image
            src={ABOUT_IMAGE_URL}
            alt={t.aboutSection.title1}
            fill
            className="object-cover object-top"
          />
        </div>

        {/* Right: Content */}
        <div className="flex flex-col justify-center py-20 px-8 sm:px-12 lg:px-20">
          <div className="mb-10">
            <h3 className="heading-md text-black mb-3">{t.aboutSection.title1}</h3>
            <h3 className="heading-md text-black">{t.aboutSection.title2}</h3>
          </div>
          <div className="mb-12 flex flex-col gap-6">
            <p className="text-sm sm:text-base text-black/80 leading-relaxed">{t.aboutSection.paragraph1}</p>
            <p className="text-sm sm:text-base text-black/80 leading-relaxed">{t.aboutSection.paragraph2}</p>
            <p className="text-sm sm:text-base text-black/80 leading-relaxed">
              {t.aboutSection.paragraph3.split('OLIO GALIA').map((part: string, index: number, array: string[]) =>
                index === array.length - 1 ? part : (
                  <span key={index}>
                    {part}
                    <span className="font-serif-bold">OLIO GALIA</span>
                  </span>
                )
              )}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
