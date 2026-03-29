'use client';

import type { ProductStory as ProductStoryType } from '@/types/productStory';
import StorySectionWrapper from './StorySectionWrapper';
import StoryItemsSection from './StoryItemsSection';
import StoryFlavorSection from './StoryFlavorSection';
import StoryOriginSection from './StoryOriginSection';
import StoryTechnicalSection from './StoryTechnicalSection';

interface ProductStoryProps {
  story: ProductStoryType;
}

/**
 * Main editorial story renderer.
 *
 * Iterates over `story.sections` and delegates each section to its
 * specialised component, wrapped in the numbered `StorySectionWrapper`.
 *
 * Section types:
 *  - 'items'         → StoryItemsSection  (benefits, strengths, usage, info, ingredients)
 *  - 'flavorProfile' → StoryFlavorSection (cultivars + sensory notes with photos)
 *  - 'origin'        → StoryOriginSection (location, territory, production steps)
 *  - 'technicalData' → StoryTechnicalSection (key-value table)
 */
export default function ProductStory({ story }: ProductStoryProps) {
  if (!story.sections?.length) return null;

  return (
    <div>
      {story.sections.map((section, index) => (
        <StorySectionWrapper key={index} index={index} title={section.title}>
          {section.type === 'items' && section.items && (
            <StoryItemsSection
              items={section.items}
              layout={section.layout}
              badge={section.badge}
              description={section.description}
            />
          )}

          {section.type === 'flavorProfile' && (
            <StoryFlavorSection
              cultivars={section.cultivars}
              sensorNotes={section.sensorNotes}
              description={section.description}
            />
          )}

          {section.type === 'origin' && (
            <StoryOriginSection
              location={section.location}
              altitude={section.altitude}
              climate={section.climate}
              territory={section.territory}
              steps={section.steps}
              description={section.description}
            />
          )}

          {section.type === 'technicalData' && section.keyValues && (
            <StoryTechnicalSection
              keyValues={section.keyValues}
              badge={section.badge}
              description={section.description}
            />
          )}
        </StorySectionWrapper>
      ))}
    </div>
  );
}
