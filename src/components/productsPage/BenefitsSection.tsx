import { useT } from '@/hooks/useT';
import styles from '../../styles/ProductsPage.module.css';

export default function BenefitsSection() {
  const { t } = useT();

  const icons = [
    "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
  ];
  const colors = ['olive', 'salvia', 'nocciola'];

  return (
    <section className="py-10 sm:py-12 bg-white/50">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className={`text-center mb-12 ${styles.animateFadeInSlow}`}>
          <h2 className="text-3xl sm:text-4xl font-serif text-olive mb-4">
            {t.productsPage.benefits.title}
          </h2>
          <p className="text-nocciola max-w-2xl mx-auto">
            {t.productsPage.benefits.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {t.productsPage.benefits.items.map((item, index) => (
            <div 
              key={index}
              className={`text-center p-6 hover:scale-105 transition-transform duration-300 ${styles.animateFadeInBenefits}`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className={`w-16 h-16 bg-${colors[index]}/10 rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-${colors[index]}/20 transition-colors duration-300`}>
                <svg className={`w-8 h-8 text-${colors[index]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d={icons[index]} />
                </svg>
              </div>
              <h3 className="text-lg font-serif text-olive mb-2">{item.title}</h3>
              <p className="text-sm text-nocciola">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}