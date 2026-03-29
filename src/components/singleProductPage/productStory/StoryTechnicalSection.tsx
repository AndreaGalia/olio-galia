import type { StoryKeyValue } from '@/types/productStory';

interface StoryTechnicalSectionProps {
  keyValues: StoryKeyValue[];
  badge?: string;
  description?: string;
}

/**
 * Key-value table for technical / analytical data.
 * Used for: organoleptic table, INCI composition, technical specs.
 */
export default function StoryTechnicalSection({
  keyValues,
  badge,
  description,
}: StoryTechnicalSectionProps) {
  return (
    <div className="space-y-5">
      {badge && (
        <p className="text-[11px] tracking-[0.2em] uppercase text-black/40 pb-4 border-b border-black/10">
          {badge}
        </p>
      )}
      {description && (
        <p className="text-sm text-black/60 leading-relaxed">{description}</p>
      )}
      <dl>
        {keyValues.map((kv, i) => (
          <div
            key={i}
            className="flex justify-between items-baseline py-3 border-b border-black/5 last:border-0 gap-4"
          >
            <dt className="text-[11px] tracking-[0.15em] uppercase text-black/50">{kv.key}</dt>
            <dd className="text-sm text-black/80 text-right">{kv.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
