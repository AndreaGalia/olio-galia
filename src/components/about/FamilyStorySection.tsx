// components/about/FamilyStorySection.tsx
import Image from 'next/image';
import { useT } from '@/hooks/useT';

const FAMILY_STORY_IMAGE_URL = process.env.NEXT_PUBLIC_HISTORIC_IMAGE_URL || '';

export function FamilyStorySection() {
  const { t } = useT();

  return (
    <section className="bg-homepage-bg overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2">

        {/* Image — full width on mobile, left column on md+ */}
        <div className="relative min-h-[50vh] md:min-h-[80vh]">
          <Image
            src={FAMILY_STORY_IMAGE_URL}
            alt={t.about.title.line2}
            fill
            className="object-cover object-top"
            priority
          />
        </div>

        {/* Content — below image on mobile, right column on md+ */}
        <div className="flex flex-col justify-center py-12 px-8 sm:px-12 lg:px-20">
          <h2 className="heading-md text-black mb-6">
            {t.about.title.line2}
          </h2>
          <p className="garamond-13 max-w-xs">
            {t.about.intro}
          </p>
        </div>

      </div>
    </section>
  );
}
