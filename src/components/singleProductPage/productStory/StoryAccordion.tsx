'use client';

import { useState } from 'react';

interface StoryAccordionProps {
  title: string;
  children: React.ReactNode;
}

export default function StoryAccordion({ title, children }: StoryAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-t border-olive/20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 text-left cursor-pointer group"
      >
        <span className="text-xs tracking-widest uppercase font-medium text-black group-hover:text-olive transition-colors">
          {title}
        </span>
        <span className="text-base text-black/40 group-hover:text-olive transition-colors leading-none select-none ml-4 shrink-0">
          {isOpen ? '−' : '+'}
        </span>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="pb-8 sm:pb-10">
          {children}
        </div>
      </div>
    </div>
  );
}
