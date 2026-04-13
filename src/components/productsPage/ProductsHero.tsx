import { useT } from '@/hooks/useT';

export default function ProductsHero() {
  const { t } = useT();

  return (
    <section className="pt-10 pb-6 sm:pt-12 sm:pb-8 lg:pt-16 lg:pb-10">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <h1>{t.productsPage.hero.title.main} {t.productsPage.hero.title.highlight}</h1>
        <p className="mt-4 text-sm text-black/60 leading-relaxed max-w-md">
          {t.productsPage.hero.description}
        </p>
      </div>
    </section>
  );
}
