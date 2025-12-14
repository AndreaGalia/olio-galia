// components/Contact/ContactHero.tsx
import { ContactHero as ContactHeroType } from '@/types/contact';
import styles from '../../styles/ContactPage.module.css';

interface ContactHeroProps {
  hero: ContactHeroType;
}

export default function ContactHero({ hero }: ContactHeroProps) {
  return (
    <div className="text-center mb-8 sm:mb-10">
      <h1 className={`text-lg sm:text-3xl md:text-4xl lg:text-5xl font-serif text-olive mb-6 leading-tight ${styles.animateSlideUp}`}>
        {hero.title.main}
        {hero.title.subtitle && <span className="block text-olive">{hero.title.subtitle}</span>}
      </h1>
      
      <p className={`text-xl text-nocciola max-w-3xl mx-auto leading-relaxed ${styles.animateFadeInDelay}`}>
        {hero.description}
      </p>
    </div>
  );
}