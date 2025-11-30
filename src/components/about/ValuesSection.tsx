import { ValueCardProps, ValuesSectionProps } from '@/types/about';
import styles from '../../styles/AboutPage.module.css';


export function ValuesSection({ values, title, subtitle, variant = "compact" }: ValuesSectionProps) {
  const gridCols = variant === "full" ? "lg:grid-cols-3" : "md:grid-cols-3";
  
  return (
    <div className={`${variant === "full" ? "" : "mb-12"}`}>
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <h3 className={`${variant === "full" ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"} ${styles.fontSerif} ${styles.textOlive} text-center mb-4`}>
          {title}
        </h3>
        {subtitle && (
          <p className={`text-lg ${styles.textNocciola} text-center mb-12 max-w-3xl mx-auto`}>
            {subtitle}
          </p>
        )}
        
        <div className={`grid grid-cols-1 md:grid-cols-2 ${gridCols} gap-6 sm:gap-8`}>
          {values.map((value, index) => (
            <div
              key={index}
              className={`${styles.animateFadeInStagger}`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <ValueCard value={value} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ValueCard({ value }: ValueCardProps) {
  const colorClass = value.color === 'olive' ? styles.textOlive : 
                     value.color === 'salvia' ? styles.textSalvia : 
                     value.color === 'nocciola' ? styles.textNocciola : styles.textOlive;
  
  const bgColorClass = value.color === 'olive' ? styles.bgOlive20 : 
                       value.color === 'salvia' ? styles.bgSalvia20 : 
                       value.color === 'nocciola' ? styles.bgNocciola20 : styles.bgOlive20;

  return (
    <div className={`text-center space-y-4 ${styles.valueCard}`}>
      <div className={`w-16 h-16 ${bgColorClass} rounded-full flex items-center justify-center mx-auto ${styles.valueIcon}`}>
        <div className={colorClass}>
          {value.icon}
        </div>
      </div>
      <h4 className={`text-lg ${styles.fontSerif} ${styles.textOlive} ${styles.hoverTextSalvia} transition-colors duration-300`}>
        {value.title}
      </h4>
      <p className={`text-sm ${styles.textNocciola} leading-relaxed`}>
        {value.description}
      </p>
    </div>
  );
}