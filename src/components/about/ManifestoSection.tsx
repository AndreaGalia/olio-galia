// components/about/ManifestoSection.tsx
import Image from 'next/image';
import { useT } from '@/hooks/useT';

const MANIFESTO_IMAGE_URL = process.env.NEXT_PUBLIC_MANIFESTO_IMAGE_URL || '';

interface ManifestoBlock {
  quote: string;
  description: string;
}

export function ManifestoSection() {
  const { t } = useT();
  const blocks: ManifestoBlock[] = t.aboutPage.manifesto.blocks;

  return (
    <section className="bg-homepage-bg overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2">

        {/* Content — top on mobile, left column on md+ */}
        <div className="flex flex-col justify-center py-12 px-8 sm:px-12 lg:px-20 order-2 md:order-1">
          <h2 className="heading-md text-black mb-10">
            {t.aboutPage.manifesto.title}
          </h2>

          <div className="flex flex-col gap-8">
            {blocks.map((block, index) => (
              <div key={index}>
                {/* Quote block */}
                <blockquote className="border-l-2 border-black pl-4 mb-3">
                  {block.quote.split('\n').map((line, i) => (
                    <p key={i} className="heading-md text-black leading-relaxed">
                      {line}
                    </p>
                  ))}
                </blockquote>

                {/* Description */}
                <p className="text-sm sm:text-base text-black/60 leading-relaxed">
                  {block.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Image — bottom on mobile, right column on md+ */}
        <div className="bg-beige order-1 md:order-2">
          <Image
            src={MANIFESTO_IMAGE_URL}
            alt={t.aboutPage.manifesto.title}
            width={0}
            height={0}
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ width: '100%', height: 'auto' }}
          />
        </div>

      </div>
    </section>
  );
}
