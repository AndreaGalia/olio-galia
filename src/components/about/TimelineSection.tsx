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
  return (
    <section className="py-10 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <h2 className="text-lg sm:text-3xl md:text-4xl lg:text-5xl font-serif text-olive text-center mb-12">
          {title}
        </h2>

        {/* Timeline Desktop */}
        <div className="hidden md:block relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-olive"></div>

          {timeline.map((item, index) => (
            <TimelineItem
              key={index}
              item={item}
              index={index}
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
}

function TimelineItem({ item, index }: TimelineItemProps) {
  return (
    <div
      className={`relative flex items-center mb-12 ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
    >
      <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
        <div className="bg-beige border border-olive/10 p-6 transition-all duration-300">
          <div className="text-2xl font-serif text-salvia mb-2">{item.year}</div>
          <h3 className="text-xl font-serif text-olive mb-3">{item.title}</h3>
          <p className="text-nocciola text-sm leading-relaxed mb-3">{item.description}</p>
          <p className="text-xs text-nocciola/70 italic">{item.details}</p>
        </div>
      </div>

      {/* Punto centrale */}
      <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-olive rounded-full border-4 border-beige z-10"></div>
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

      <div className="bg-beige border border-olive/10 p-4 transition-all duration-300">
        <div className="text-xl font-serif text-salvia mb-1">{item.year}</div>
        <h3 className="text-lg font-serif text-olive mb-2">{item.title}</h3>
        <p className="text-nocciola text-sm leading-relaxed mb-2">{item.description}</p>
        <p className="text-xs text-nocciola/70 italic">{item.details}</p>
      </div>
    </div>
  );
}