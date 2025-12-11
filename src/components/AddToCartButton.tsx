"use client";

import { useT } from '@/hooks/useT';
import { useState } from 'react';

interface AddToCartButtonProps {
  onAddToCart: () => void;
  disabled?: boolean;
  quantity: number;
  size?: 'compact' | 'full' | 'icon';
}

export default function AddToCartButton({
  onAddToCart,
  disabled = false,
  quantity,
  size = 'full'
}: AddToCartButtonProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { t } = useT();

  const handleClick = () => {
    if (disabled || isAddingToCart) return;
    
    setIsAddingToCart(true);
    onAddToCart();
    
    setTimeout(() => {
      setIsAddingToCart(false);
    }, 2500);
  };

  const getButtonText = () => {
    if (isAddingToCart) {
      if (size === 'compact') {
        return t.addToCartButton.added;
      } else {
        return (
          <>
            <span className="hidden sm:inline">{t.addToCartButton.productAdded}</span>
            <span className="sm:hidden">{t.addToCartButton.added}</span>
          </>
        );
      }
    } else {
      if (size === 'compact') {
        return t.addToCartButton.add;
      } else {
        return (
          <>
            <span className="hidden sm:inline">{t.addToCartButton.addToCart}</span>
            <span className="sm:hidden">{t.addToCartButton.add}</span>
          </>
        );
      }
    }
  };

  return (
    <button
      disabled={disabled || isAddingToCart}
      onClick={handleClick}
      className={`
        relative
        flex-1 font-medium
        flex items-center justify-center
        transition-all duration-500 ease-out
        transform-gpu
        disabled:cursor-not-allowed cursor-pointer
        ${size === 'compact'
          ? 'py-3 px-4 text-base gap-2'
          : 'py-3 sm:py-4 px-4 text-base sm:text-lg gap-2 sm:gap-3'
        }
        ${isAddingToCart
          ? `
            bg-green-600
            text-white
            scale-105
            shadow-2xl shadow-green-500/30
            animate-pulse
          `
          : `
            bg-olive
            text-beige
            hover:shadow-xl hover:shadow-olive/30
            hover:scale-105
            active:scale-95
            disabled:opacity-50
            disabled:hover:scale-100
          `
        }
      `}
    >
      <div className={`flex items-center justify-center ${size === 'compact' ? 'gap-2' : 'gap-2 sm:gap-3'}`}>
        {isAddingToCart ? (
          <>
            <div className="relative">
              <svg 
                className={size === 'compact' ? 'w-5 h-5' : 'w-5 h-5 sm:w-6 sm:h-6'}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                strokeWidth="3"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M5 13l4 4L19 7"
                  className="animate-pulse"
                />
              </svg>
            </div>
            <span className="font-semibold tracking-wide">
              {getButtonText()}
            </span>
          </>
        ) : (
          <>
            <div className="relative">
              <svg 
                className={`transition-transform duration-300 ${size === 'compact' ? 'w-5 h-5' : 'w-5 h-5 sm:w-6 sm:h-6'}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                strokeWidth="2"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" 
                />
              </svg>
              {size === 'full' && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-beige/40 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              )}
            </div>
            <span className="font-semibold tracking-wide">
              {getButtonText()}
            </span>
          </>
        )}
      </div>

      <div className={`
        absolute inset-0
        ${isAddingToCart ? 'animate-ping bg-green-400/30' : 'opacity-0'}
      `}></div>
    </button>
  );
}