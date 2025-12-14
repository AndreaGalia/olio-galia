import { useT } from '@/hooks/useT';
import styles from '../../styles/ProductsPage.module.css';

export default function ProductsHero() {
  const { t } = useT();

  return (
    <section className="relative py-10 sm:py-12 lg:py-16 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
        <div className={`text-center mb-8 sm:mb-10 ${styles.animateFadeIn}`}>
          
          <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-serif text-olive mb-6 leading-tight ${styles.animateSlideUp}`}>
            {t.productsPage.hero.title.main} <span>{t.productsPage.hero.title.highlight}</span>
          </h1>
          
          <p className={`text-lg text-nocciola max-w-3xl mx-auto leading-relaxed ${styles.animateSlideUpDelay}`}>
            {t.productsPage.hero.description}
          </p>
        </div>
      </div>
    </section>
  );
}