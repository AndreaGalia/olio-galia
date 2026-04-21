import { FAQ } from '@/types/faq';
import FaqItem from './FaqItem';

interface FaqListProps {
  faqs: FAQ[];
  activeIndex: number | null;
  noFaqLabel: string;
  onToggle: (index: number) => void;
}

export default function FaqList({ faqs, activeIndex, noFaqLabel, onToggle }: FaqListProps) {
  if (faqs.length === 0) {
    return (
      <div className="border-t border-olive/20 py-12 text-center">
        <p className="garamond-13">{noFaqLabel}</p>
      </div>
    );
  }

  return (
    <div>
      {faqs.map((faq, index) => (
        <FaqItem
          key={faq.id}
          faq={faq}
          isActive={activeIndex === index}
          onToggle={() => onToggle(index)}
        />
      ))}
      <div className="border-t border-olive/20" />
    </div>
  );
}
