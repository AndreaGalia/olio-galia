// components/FAQ/FAQHeader.tsx
import { FAQHeaderProps } from '@/types/faq';

export default function FAQHeader({ title, description }: FAQHeaderProps) {
  return (
    <div className="text-center mb-12 sm:mb-16">
      <h2 className="font-serif text-olive mb-6 leading-tight text-lg sm:text-3xl md:text-4xl lg:text-5xl">
        {title.line1} {title.line2}
      </h2>
      
      <p className="text-lg text-nocciola max-w-2xl mx-auto leading-relaxed">
        {description.split('OLIO GALIA').map((part, index, array) => (
          index === array.length - 1 ? part : (
            <span key={index}>
              {part}
              <span className="font-bold">OLIO GALIA</span>
            </span>
          )
        ))}
      </p>
    </div>
  );
}