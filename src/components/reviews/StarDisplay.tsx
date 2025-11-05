'use client';

interface StarDisplayProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
}

/**
 * Componente per visualizzare le stelle in modalità read-only
 * Ottimizzato per mobile e accessibile
 */
export default function StarDisplay({ rating, size = 'md', showNumber = false }: StarDisplayProps) {
  // Assicura che il rating sia tra 0 e 5
  const normalizedRating = Math.max(0, Math.min(5, rating));

  // Classi per le dimensioni
  const sizeClasses = {
    sm: 'text-base sm:text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
  };

  return (
    <div className="flex items-center gap-1">
      <div className={`flex gap-0.5 ${sizeClasses[size]}`} aria-label={`${normalizedRating} stelle su 5`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`${
              star <= normalizedRating ? 'text-olive' : 'text-sabbia'
            } transition-colors duration-200`}
            aria-hidden="true"
          >
            ★
          </span>
        ))}
      </div>
      {showNumber && (
        <span className="ml-2 text-sm text-nocciola font-medium">
          {normalizedRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
