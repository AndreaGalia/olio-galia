'use client';

import { useT } from '@/hooks/useT';
import type { StoryItem, StorySensorNote } from '@/types/productStory';

interface StoryFlavorSectionProps {
  cultivars?: StoryItem[];
  sensorNotes?: StorySensorNote[];
  description?: string;
}

/**
 * Flavor / sensory profile section.
 *
 * Renders two blocks:
 * 1. Cultivar cards (blend composition)
 * 2. Sensory notes grid — each note gets an editorial photo + label + value.
 *    If no image is provided, a neutral placeholder fills the image area.
 *    Inspired by the Top / Heart / Base layout used in perfumery editorial.
 */
export default function StoryFlavorSection({
  cultivars,
  sensorNotes,
  description,
}: StoryFlavorSectionProps) {
  const { t } = useT();
  const st = t.productDetailPage.productStory;

  return (
    <div className="space-y-10">
      {description && (
        <p className="text-sm text-black/60 leading-relaxed">{description}</p>
      )}

      {/* Cultivars */}
      {cultivars && cultivars.length > 0 && (
        <div className="space-y-4">
          <p className="text-[11px] tracking-[0.2em] uppercase text-black/40">{st.cultivars}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-black/10">
            {cultivars.map((c, i) => (
              <div key={i} className="bg-beige/50 p-6 space-y-2">
                {c.image && (
                  <div className="w-full h-36 overflow-hidden mb-4">
                    <img
                      src={c.image}
                      alt={c.name}
                      className="w-full h-full object-cover grayscale"
                    />
                  </div>
                )}
                <p className="text-xs tracking-widest uppercase text-black">{c.name}</p>
                <p className="text-sm text-black/60 leading-relaxed">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sensory notes — editorial photo per note */}
      {sensorNotes && sensorNotes.length > 0 && (
        <div className="space-y-4">
          <p className="text-[11px] tracking-[0.2em] uppercase text-black/40">{st.sensorProfile}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-black/10">
            {sensorNotes.map((note, i) => (
              <div key={i} className="bg-beige/50">
                {note.image ? (
                  <div className="w-full aspect-square overflow-hidden">
                    <img
                      src={note.image}
                      alt={note.label}
                      className="w-full h-full object-cover grayscale"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-square bg-black/5" />
                )}
                <div className="p-4 space-y-1">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-black/40">{note.label}</p>
                  <p className="text-sm text-black/70">{note.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
