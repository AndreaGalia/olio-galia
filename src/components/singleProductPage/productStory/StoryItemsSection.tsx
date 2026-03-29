import type { StoryItem, StorySectionLayout } from '@/types/productStory';

interface StoryItemsSectionProps {
  items: StoryItem[];
  layout?: StorySectionLayout;
  badge?: string;
  description?: string;
}

/**
 * Renders a list of named items either as a card grid (default)
 * or as a numbered vertical list.
 *
 * Used for: benefits, strengths, usage instructions, general info, ingredients.
 */
export default function StoryItemsSection({
  items,
  layout = 'grid',
  badge,
  description,
}: StoryItemsSectionProps) {
  return (
    <div className="space-y-6">
      {badge && (
        <p className="text-[11px] tracking-[0.2em] uppercase text-black/40 pb-4 border-b border-black/10">
          {badge}
        </p>
      )}
      {description && (
        <p className="text-sm text-black/60 leading-relaxed">{description}</p>
      )}

      {layout === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-black/10">
          {items.map((item, i) => (
            <div key={i} className="bg-beige/50 p-5 space-y-2">
              {item.image && (
                <div className="w-full h-28 overflow-hidden mb-3">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
              )}
              <p className="text-[11px] tracking-[0.2em] uppercase text-black">{item.name}</p>
              {item.action && (
                <p className="text-xs text-olive/80 tracking-wide">{item.action}</p>
              )}
              <p className="text-sm text-black/60 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="divide-y divide-black/5">
          {items.map((item, i) => (
            <div key={i} className="flex gap-6 py-5">
              <span className="text-[11px] tracking-[0.2em] tabular-nums text-black/25 pt-0.5 select-none shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="space-y-1">
                <p className="text-[11px] tracking-[0.2em] uppercase text-black">{item.name}</p>
                {item.action && (
                  <p className="text-xs text-olive/80 tracking-wide">{item.action}</p>
                )}
                <p className="text-sm text-black/60 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
