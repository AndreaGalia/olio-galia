// components/sections/products/ProductsBanner.tsx
"use client";
import Image from 'next/image';

export function ProductsBanner() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      {/* Image Background */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/uliveto.JPG"
          alt="Uliveto Olio Galia"
          fill
          className="object-cover"
          priority={false}
          quality={90}
        />

        {/* Overlay gradiente per effetto depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-olive/40 via-olive/20 to-olive/40" />

        {/* Vignette effect per focus centrale */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(85,107,47,0.3)_100%)]" />
      </div>
    </section>
  );
}
