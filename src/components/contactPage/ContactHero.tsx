// components/Contact/ContactHero.tsx
import { ContactHero as ContactHeroType } from '@/types/contact';
import styles from '../../styles/ContactPage.module.css';

interface ContactHeroProps {
  hero: ContactHeroType;
}

export default function ContactHero({ hero }: ContactHeroProps) {
  return (
    <div className="text-center mb-12 sm:mb-16">
      <div className={`inline-flex items-center gap-2 bg-olive/10 text-olive px-4 py-2 rounded-full text-sm font-medium mb-6 ${styles.animateFadeIn}`}>
        <div className="w-2 h-2 bg-olive rounded-full animate-pulse"></div>
        {hero.badge}
      </div>
      
      <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-serif text-olive mb-6 leading-tight ${styles.animateSlideUp}`}>
        {hero.title.main}
        <span className="block italic text-salvia">{hero.title.subtitle}</span>
      </h1>
      
      <p className={`text-xl text-nocciola max-w-3xl mx-auto leading-relaxed ${styles.animateFadeInDelay}`}>
        {hero.description}
      </p>
    </div>
  );
}