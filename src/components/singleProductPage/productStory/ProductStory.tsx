'use client';

import type { ProductStory as ProductStoryType } from '@/types/productStory';
import StoryAccordion from './StoryAccordion';
import StoryItemsSection from './StoryItemsSection';
import StoryFlavorSection from './StoryFlavorSection';
import StoryOriginSection from './StoryOriginSection';
import StoryTechnicalSection from './StoryTechnicalSection';

interface ProductStoryProps {
  story: ProductStoryType;
}

export default function ProductStory({ story }: ProductStoryProps) {
  if (!story.sections?.length) return null;

  return (
    <div>
      {story.sections.map((section, index) => (
        <StoryAccordion key={index} title={section.title}>
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
        </StoryAccordion>
      ))}
    </div>
  );
}
