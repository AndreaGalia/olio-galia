"use client";

import { useT } from '@/hooks/useT';
import { SostenibilitaBlock } from '@/components/sostenibilita/SostenibilitaBlock';

const IMAGE_1 = process.env.NEXT_PUBLIC_SOSTENIBILITA_IMAGE_1_URL || '';
const IMAGE_2 = process.env.NEXT_PUBLIC_SOSTENIBILITA_IMAGE_2_URL || '';
const IMAGE_3 = process.env.NEXT_PUBLIC_SOSTENIBILITA_IMAGE_3_URL || '';

export default function SostenibilitaPage() {
  const { t } = useT();
  const s = t.sostenibilitaPage;

  return (
    <div className="min-h-screen bg-homepage-bg">

      {/* Sezione 1 — Foto sx, testo dx */}
      <SostenibilitaBlock
        title={s.section1.title}
        subtitle={s.section1.subtitle}
        description={s.section1.description}
        imageUrl={IMAGE_1}
        imageAlt={s.section1.title}
        reverse={false}
      />

      {/* Sezione 2 — Testo sx, foto dx */}
      <SostenibilitaBlock
        title={s.section2.title}
        subtitle={s.section2.subtitle}
        description={s.section2.description}
        imageUrl={IMAGE_2}
        imageAlt={s.section2.title}
        reverse={true}
      />

      {/* Sezione 3 — Foto sx, testo dx */}
      <SostenibilitaBlock
        title={s.section3.title}
        subtitle={s.section3.subtitle}
        description={s.section3.description}
        imageUrl={IMAGE_3}
        imageAlt={s.section3.title}
        reverse={false}
      />

    </div>
  );
}
