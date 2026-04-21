"use client";

import { useState } from 'react';
import { useT } from '@/hooks/useT';
import PrivacySection from './PrivacySection';
import PrivacyContactCta from './PrivacyContactCta';

export default function PrivacySectionsAccordion() {
  const { t } = useT();
  const pp = t.privacyPolicy;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const sections = [
    pp.sections.dataController,
    pp.sections.dataCollected,
    pp.sections.purpose,
    pp.sections.legalBasis,
    pp.sections.dataSharing,
    pp.sections.dataRetention,
    pp.sections.userRights,
    pp.sections.security,
    pp.sections.changes,
  ];

  const handleToggle = (index: number) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="pb-16 sm:pb-24">
      <div className="px-6 sm:px-12 lg:px-16 xl:px-24 max-w-4xl mx-auto">

        {/* Intro */}
        <p className="border-t border-olive/20 pt-8 garamond-13">
          {pp.intro}
        </p>

        {/* Accordion sezioni */}
        <div className="mt-8">
          {sections.map((section, index) => (
            <PrivacySection
              key={index}
              number={`0${index + 1}`}
              title={section.title}
              content={section.content}
              list={'list' in section ? (section.list as string[]) : undefined}
              isActive={activeIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
          <div className="border-t border-olive/20" />
        </div>

        {/* CTA contatti */}
        <PrivacyContactCta
          content={pp.sections.contact.content}
          button={pp.sections.contact.title}
        />

      </div>
    </section>
  );
}
