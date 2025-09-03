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
      className={`bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center shadow-lg cursor-pointer group ${styles.contactCardHover} ${styles.animateFadeInUp}`}
      style={{animationDelay: `${index * 0.2}s`}}
    >
      <div className={`w-20 h-20 bg-olive/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-olive group-hover:text-beige transition-all duration-300 ${styles.contactIconHover}`}>
        <div className="text-olive group-hover:text-beige transition-colors duration-300">
          {method.icon}
        </div>
      </div>
      
      <h3 className="text-xl font-serif text-olive mb-3 group-hover:animate-pulse">
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