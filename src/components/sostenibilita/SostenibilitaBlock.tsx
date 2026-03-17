// components/sostenibilita/SostenibilitaBlock.tsx
import Image from 'next/image';

interface SostenibilitaBlockProps {
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  /** Se true: testo a sinistra, foto a destra. Default: foto a sinistra, testo a destra */
  reverse?: boolean;
}

export function SostenibilitaBlock({
  title,
  subtitle,
  description,
  imageUrl,
  imageAlt,
  reverse = false,
}: SostenibilitaBlockProps) {
  return (
    <section className="bg-homepage-bg overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2">

        {/* Immagine */}
        <div
          className={`relative min-h-[60vw] md:min-h-[70vh] ${
            reverse ? 'order-1 md:order-2' : 'order-1'
          }`}
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            /* Placeholder finché l'immagine non è configurata */
            <div className="absolute inset-0 bg-sabbia flex items-center justify-center">
              <span className="text-black/30 text-xs uppercase tracking-widest">
                {imageAlt}
              </span>
            </div>
          )}
        </div>

        {/* Testo */}
        <div
          className={`flex flex-col justify-center py-12 px-8 sm:px-12 lg:px-20 ${
            reverse ? 'order-2 md:order-1 md:items-end md:text-right' : 'order-2'
          }`}
        >
          <p className="text-xs uppercase tracking-widest text-black/50 mb-3">
            {subtitle}
          </p>
          <h2 className="heading-md text-black mb-6">{title}</h2>
          <p className="text-sm sm:text-base text-black/80 leading-relaxed">
            {description}
          </p>
        </div>

      </div>
    </section>
  );
}
