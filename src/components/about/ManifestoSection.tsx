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
        <div className="flex flex-col justify-center md:items-end py-20 px-8 sm:px-12 lg:px-20 order-2 md:order-1 md:text-right">
          <h2 className="heading-md text-black mb-12">
            {t.aboutPage.manifesto.title}
          </h2>

          <div className="flex flex-col gap-12">
            {blocks.map((block, index) => (
              <div key={index}>
                {/* Quote block */}
                <blockquote className="border-l-2 pl-4 md:border-l-0 md:pl-0 md:border-r-2 md:pr-4 border-black mb-4">
                  {block.quote.split('\n').map((line, i) => (
                    <p key={i} className="heading-md text-black leading-relaxed">
                      {line}
                    </p>
                  ))}
                </blockquote>

                {/* Description */}
                <p className="garamond-13">
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
