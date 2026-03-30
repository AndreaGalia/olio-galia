import { FAQ } from '@/types/faq';

interface FaqItemProps {
  faq: FAQ;
  isActive: boolean;
  onToggle: () => void;
}

export default function FaqItem({ faq, isActive, onToggle }: FaqItemProps) {
  return (
    <div className="border-t border-olive/20">
      <button
        onClick={onToggle}
        className="w-full py-5 flex items-start justify-between gap-6 cursor-pointer text-left group"
      >
        <div className="flex-1">
          <p className="text-[11px] tracking-[0.2em] uppercase text-black/40 mb-1.5">
            {faq.category}
          </p>
          <p className="text-sm text-black/80 leading-relaxed group-hover:text-black transition-colors duration-200">
            {faq.question}
          </p>
        </div>
        <span className="text-black/50 text-lg leading-none mt-1 flex-shrink-0 select-none">
          {isActive ? '−' : '+'}
        </span>
      </button>

      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isActive ? 'max-h-96' : 'max-h-0'}`}>
        <p className="text-sm text-black/70 leading-relaxed pb-6 pr-10">
          {faq.answer}
        </p>
      </div>
    </div>
  );
}
