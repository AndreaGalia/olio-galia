import { useT } from '@/hooks/useT';
import styles from '../../styles/ProductsPage.module.css';

export default function ProductsHero() {
  const { t } = useT();

  return (
    <section className="relative py-10 sm:py-12 lg:py-16 overflow-hidden">
      {/* Elementi decorativi */}
      <div className="absolute inset-0 opacity-3">
        <div className="absolute top-20 left-12 w-32 h-32 rounded-full bg-olive animate-pulse" 
             style={{animationDuration: '4s'}} />
        <div className="absolute bottom-32 right-16 w-24 h-24 rounded-full bg-salvia animate-pulse" 
             style={{animationDuration: '6s'}} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
        <div className={`text-center mb-12 sm:mb-16 ${styles.animateFadeIn}`}>
          <div className="inline-flex items-center gap-2 bg-olive/10 text-olive px-4 py-2 rounded-full text-sm font-medium mb-6 hover:scale-105 transition-transform duration-300">
            <div className="w-2 h-2 bg-olive rounded-full animate-pulse" />
            {t.productsPage.hero.badge}
          </div>
          
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