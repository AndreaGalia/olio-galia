// components/about/TimelineSection.tsx  
import { useState } from 'react';

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  details: string;
}

interface TimelineSectionProps {
  timeline: TimelineEvent[];
  title: string;
}

export function TimelineSection({ timeline, title }: TimelineSectionProps) {
  const [activeTimeline, setActiveTimeline] = useState<number>(0);

  return (
    <section className="py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <h2 className="text-3xl sm:text-4xl font-serif text-olive text-center mb-12">
          {title}
        </h2>

        {/* Timeline Desktop */}
        <div className="hidden md:block relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-olive via-salvia to-olive"></div>
          
          {timeline.map((item, index) => (
            <TimelineItem 
              key={index}
              item={item}
              index={index}
              isActive={activeTimeline === index}
              onHover={() => setActiveTimeline(index)}
            />
          ))}
        </div>

        {/* Timeline Mobile */}
        <div className="md:hidden space-y-8">
          {timeline.map((item, index) => (
            <TimelineItemMobile key={index} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface TimelineItemProps {
  item: TimelineEvent;
  index: number;
  isActive: boolean;
  onHover: () => void;
}

function TimelineItem({ item, index, isActive, onHover }: TimelineItemProps) {
  return (
    <div 
      className={`relative flex items-center mb-12 ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
      onMouseEnter={onHover}
    >
      <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
        <div className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 ${isActive ? 'ring-2 ring-olive/30' : ''}`}>
          <div className="text-2xl font-serif text-salvia mb-2">{item.year}</div>
          <h3 className="text-xl font-serif text-olive mb-3">{item.title}</h3>
          <p className="text-nocciola text-sm leading-relaxed mb-3">{item.description}</p>
          <p className="text-xs text-nocciola/70 italic">{item.details}</p>
        </div>
      </div>
      
      {/* Punto centrale */}
      <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-olive rounded-full border-4 border-beige shadow-lg z-10">
        <div className="w-full h-full bg-gradient-to-br from-olive to-salvia rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}

interface TimelineItemMobileProps {
  item: TimelineEvent;
}

function TimelineItemMobile({ item }: TimelineItemMobileProps) {
  return (
    <div className="relative pl-8">
      <div className="absolute left-2 top-2 w-3 h-3 bg-olive rounded-full"></div>
      <div className="absolute left-3.5 top-6 bottom-0 w-0.5 bg-olive/30"></div>
      
      <div className="bg-white rounded-2xl p-4 shadow-lg">
        <div className="text-xl font-serif text-salvia mb-1">{item.year}</div>
        <h3 className="text-lg font-serif text-olive mb-2">{item.title}</h3>
        <p className="text-nocciola text-sm leading-relaxed mb-2">{item.description}</p>
        <p className="text-xs text-nocciola/70 italic">{item.details}</p>
      </div>
    </div>
  );
}