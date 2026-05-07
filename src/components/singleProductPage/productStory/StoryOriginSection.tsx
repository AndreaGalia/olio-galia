'use client';

import { useT } from '@/hooks/useT';
import type { StoryStep } from '@/types/productStory';

interface StoryOriginSectionProps {
  location?: string;
  altitude?: string;
  climate?: string;
  territory?: string;
  steps?: StoryStep[];
  description?: string;
}

/**
 * Origin & craft section.
 *
 * Shows key geographic facts (location, altitude, climate) as a minimal grid,
 * an optional territory description, and production steps.
 */
export default function StoryOriginSection({
  location,
  altitude,
  climate,
  territory,
  steps,
  description,
}: StoryOriginSectionProps) {
  const { t } = useT();
  const st = t.productDetailPage.productStory;

  const facts = [
    ...(location ? [{ label: st.location, value: location }] : []),
    ...(altitude ? [{ label: st.altitude, value: altitude }] : []),
    ...(climate ? [{ label: st.climate, value: climate }] : []),
  ];

  const factsColClass =
    facts.length === 3
      ? 'grid-cols-1 sm:grid-cols-3'
      : facts.length === 2
        ? 'grid-cols-1 sm:grid-cols-2'
        : 'grid-cols-1';

  const stepsColClass =
    steps && steps.length >= 4
      ? 'grid-cols-2 lg:grid-cols-4'
      : steps && steps.length === 3
        ? 'grid-cols-1 sm:grid-cols-3'
        : 'grid-cols-1 sm:grid-cols-2';

  return (
    <div className="space-y-8">
      {description && (
        <p className="text-sm text-black leading-relaxed">{description}</p>
      )}

      {/* Location / altitude / climate */}
      {facts.length > 0 && (
        <div className={`grid gap-px bg-black/10 ${factsColClass}`}>
          {facts.map((f, i) => (
            <div key={i} className="bg-beige/50 p-5">
              <p className="font-serif termina-8 tracking-[0.2em] uppercase text-black mb-1">{f.label}</p>
              <p className="text-sm text-black">{f.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Territory description */}
      {territory && (
        <p className="text-sm text-black leading-relaxed border-l-2 border-black/10 pl-5">
          {territory}
        </p>
      )}

      {/* Production steps */}
      {steps && steps.length > 0 && (
        <div className="space-y-4">
          <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black">{st.process}</p>
          <div className={`grid gap-px bg-black/10 ${stepsColClass}`}>
            {steps.map((step, i) => (
              <div key={i} className="bg-beige/50 p-5 space-y-1">
                <p className="font-serif termina-8 tracking-[0.2em] uppercase text-black">{step.label}</p>
                <p className="text-sm text-black">{step.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
