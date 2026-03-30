"use client";

import { useT } from '@/hooks/useT';
import { JustifiedWord } from '@/components/ui/JustifiedWord';

export default function ContactFormTitle() {
  const { t } = useT();
  return (
    <div className="mb-0">
      <h2 className="font-serif text-black">
        <JustifiedWord text={t.contactPage.title} />
      </h2>
    </div>
  );
}
