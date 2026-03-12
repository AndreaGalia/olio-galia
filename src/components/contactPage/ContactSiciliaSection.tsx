"use client";

import Image from 'next/image';
import { useT } from '@/hooks/useT';

export default function ContactSiciliaSection() {
  const { t } = useT();
  const imageUrl = process.env.NEXT_PUBLIC_SICILIA_IMAGE_URL || '';

  if (!imageUrl) return null;

  return (
    <section className="w-full bg-homepage-bg pt-0 pb-12 flex items-center justify-center overflow-hidden">
      <div className="relative w-full max-w-2xl mx-auto px-8">
        <Image
          src={imageUrl}
          alt={t.contactPage.sicilia.alt}
          width={800}
          height={500}
          className="w-full h-auto object-contain opacity-70"
          style={{ mixBlendMode: 'multiply' }}
        />
      </div>
    </section>
  );
}
