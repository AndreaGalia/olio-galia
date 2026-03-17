import { FAQ } from '@/types/faq';
import FAQItem from '@/components/homepage/sections/faq/FAQItem';

interface FaqListProps {
  faqs: FAQ[];
  activeIndex: number | null;
  noFaqLabel: string;
  onToggle: (index: number) => void;
}

export default function FaqList({ faqs, activeIndex, noFaqLabel, onToggle }: FaqListProps) {
  if (faqs.length === 0) {
    return (
      <div className="text-center py-12 text-black/60">
        <p>{noFaqLabel}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {faqs.map((faq, index) => (
        <FAQItem
          key={faq.id}
          faq={faq}
          isActive={activeIndex === index}
          onToggle={() => onToggle(index)}
        />
      ))}
    </div>
  );
}
