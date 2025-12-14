// components/Contact/ContactMethodCard.tsx
import { ContactMethod } from '@/types/contact';
import styles from '../../styles/ContactPage.module.css';

interface ContactMethodCardProps {
  method: ContactMethod;
  index: number;
}

export default function ContactMethodCard({ method, index }: ContactMethodCardProps) {
  return (
    <div
      onClick={method.action}
      className={`bg-beige border border-olive/10 p-8 text-center cursor-pointer transition-all duration-300 ${styles.animateFadeInUp}`}
      style={{animationDelay: `${index * 0.2}s`}}
    >
      <div className="w-20 h-20 bg-olive/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <div className="text-olive">
          {method.icon}
        </div>
      </div>

      <h3 className="text-xl font-serif text-olive mb-3">
        {method.title}
      </h3>
      <p className="text-olive font-medium mb-2 text-lg">
        {method.value}
      </p>
      <p className="text-nocciola">
        {method.description}
      </p>
    </div>
  );
}