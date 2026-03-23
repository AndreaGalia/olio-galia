"use client";

import { useT } from '@/hooks/useT';
import { JustifiedWord } from '@/components/ui/JustifiedWord';

export default function ContactFormTitle() {
  const { t } = useT();
  return (
    <h2 className="font-serif text-black mb-8">
      <JustifiedWord text={t.contactPage.form.title} />
    </h2>
  );
}
