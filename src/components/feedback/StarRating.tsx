'use client';

import { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
}

export default function StarRating({ value, onChange, disabled = false }: StarRatingProps) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-2 sm:gap-3 justify-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          onMouseEnter={() => !disabled && setHover(star)}
          onMouseLeave={() => !disabled && setHover(0)}
          className={`text-5xl sm:text-6xl md:text-5xl transition-all duration-200 transform touch-manipulation min-w-[48px] min-h-[48px] flex items-center justify-center ${
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110 active:scale-95'
          }`}
          aria-label={`Valuta ${star} stelle`}
        >
          <span
            className={`${
              star <= (hover || value)
                ? 'text-olive'
                : 'text-sabbia'
            } drop-shadow-md`}
          >
            ★
          </span>
        </button>
      ))}
    </div>
  );
}
