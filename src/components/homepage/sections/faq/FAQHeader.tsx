// components/FAQ/FAQHeader.tsx
import { FAQHeaderProps } from '@/types/faq';

export default function FAQHeader({ badge, title, description }: FAQHeaderProps) {
  return (
    <div className="text-center mb-12 sm:mb-16">
      <div className="inline-flex items-center gap-2 bg-olive/10 text-olive px-4 py-2 rounded-full text-sm font-medium mb-6">
        <div className="w-2 h-2 bg-olive rounded-full"></div>
        {badge}
      </div>
      
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-olive mb-6 leading-tight">
        {title.line1}
        <span className="block">{title.line2}</span>
      </h2>
      
      <p className="text-lg text-nocciola max-w-2xl mx-auto leading-relaxed">
        {description}
      </p>
    </div>
  );
}