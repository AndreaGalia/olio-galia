import { useT } from '@/hooks/useT';
import styles from '../../styles/ProductsPage.module.css';

export default function ProductsHero() {
  const { t } = useT();

  return (
    <section className="relative pt-10 pb-6 sm:pt-12 sm:pb-8 lg:pt-16 lg:pb-10 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
        <div className={`text-center ${styles.animateFadeIn}`}>
          <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-serif text-black leading-tight ${styles.animateSlideUp}`}>
            {t.productsPage.hero.title.main} <span>{t.productsPage.hero.title.highlight}</span>
          </h1>
        </div>
      </div>
    </section>
  );
}