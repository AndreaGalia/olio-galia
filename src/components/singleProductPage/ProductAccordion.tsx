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
    <div className="border-t border-olive/20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 text-left cursor-pointer group"
      >
        <span className="font-serif termina-11 tracking-widest uppercase text-black group-hover:text-olive transition-colors">
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
        <div className="pb-5 garamond-13">
          {children}
        </div>
      </div>
    </div>
  );
}
