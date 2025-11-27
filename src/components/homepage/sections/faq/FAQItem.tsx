// components/FAQ/FAQItem.tsx
import { FAQ } from '@/types/faq';

interface FAQItemProps {
  faq: FAQ;
  isActive: boolean;
  onToggle: () => void;
}

export default function FAQItem({ faq, isActive, onToggle }: FAQItemProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 sm:px-8 py-6 sm:py-8 text-left flex items-center justify-between hover:bg-olive/5 transition-colors duration-300 cursor-pointer"
      >
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-medium text-salvia bg-salvia/10 px-2 py-1 rounded-full">
              {faq.category}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-serif text-olive leading-tight">
            {faq.question}
          </h3>
        </div>
        
        <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-olive/10 flex items-center justify-center transition-all duration-300 ${
          isActive ? 'rotate-45 bg-olive' : 'hover:bg-olive/20'
        }`}>
          <svg 
            className={`w-4 h-4 transition-colors duration-300 ${
              isActive ? 'text-beige' : 'text-olive'
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </button>

      {/* Answer - Animated */}
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
        isActive ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-6 sm:px-8 pb-6 sm:pb-8 border-t border-olive/10">
          <p className="text-nocciola leading-relaxed pt-4 sm:pt-6">
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  );
}