'use client';
import { useState } from 'react';

interface ProductAccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function ProductAccordion({ title, children, defaultOpen = false }: ProductAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-black/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left cursor-pointer group"
      >
        <span className="text-xs tracking-widest uppercase font-medium text-black group-hover:text-olive transition-colors">
          {title}
        </span>
        <span className="text-sm text-black/50 group-hover:text-olive transition-colors leading-none select-none">
          {isOpen ? '−' : '+'}
        </span>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="pb-5 text-sm text-black/70 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
