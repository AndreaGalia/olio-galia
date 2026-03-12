// app/about/page.tsx
"use client";
import { useT } from '@/hooks/useT';
import { TimelineSection } from '@/components/about/TimelineSection';
import { FamilyStorySection } from '@/components/about/FamilyStorySection';
import { ManifestoSection } from '@/components/about/ManifestoSection';
import { TimelineEvent } from '@/types/about';

export default function AboutPage() {
  const { t } = useT();

  return (
    <div className="min-h-screen bg-homepage-bg">
      
      {/* Family Story Section */}
      <FamilyStorySection />

      {/* Timeline Storia */}
      <TimelineSection
        timeline={t.aboutPage.timeline.events as TimelineEvent[]}
      />

      {/* Manifesto */}
      <ManifestoSection />

    </div>
  );
}