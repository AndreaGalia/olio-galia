"use client";

import { useT } from '@/hooks/useT';

export default function ContactFormTitle() {
  const { t } = useT();
  return (
    <div className="mb-0">
      <h2 className="font-serif text-black">
        {t.contactPage.title}
      </h2>
    </div>
  );
}
