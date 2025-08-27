"use client";

import { useState } from 'react';

interface CartIconButtonProps {
  onAddToCart: () => void;
  disabled?: boolean;
}

export default function CartIconButton({
  onAddToCart,
  disabled = false
}: CartIconButtonProps) {
  const [justAdded, setJustAdded] = useState(false);

  const handleClick = () => {
    if (disabled || justAdded) return;
    
    setJustAdded(true);
    onAddToCart();
    
    setTimeout(() => {
      setJustAdded(false);
    }, 1500);
  };

  return (
    <button 
      disabled={disabled || justAdded}
      onClick={handleClick}
      className={`
        p-3 rounded-2xl transition-all duration-300 
        hover:scale-110 hover:shadow-xl
        disabled:cursor-not-allowed cursor-pointer
        ${justAdded 
          ? 'bg-green-500 text-white shadow-xl shadow-green-500/30'
          : 'bg-gradient-to-r from-olive to-salvia text-beige hover:shadow-olive/30'
        }
      `}
      title={justAdded ? "Aggiunto!" : "Aggiungi al carrello"}
    >
      {justAdded ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
        </svg>
      )}
    </button>
  );
}