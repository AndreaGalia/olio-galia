"use client";

import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function FloatingCart() {
  const { getTotalItems } = useCart();
  const pathname = usePathname();
  const totalItems = getTotalItems();

  // Non mostrare se il carrello è vuoto o se siamo sulla pagina carrello
  if (totalItems === 0 || pathname === '/cart') return null;

  return (
    <Link href="/cart">
      <div 
        className="
          fixed bottom-6 right-6 z-40
          bg-gradient-to-br from-olive to-salvia
          text-beige
          w-14 h-14
          rounded-full
          shadow-xl shadow-olive/25
          flex items-center justify-center
          cursor-pointer
          transition-all duration-300
          hover:scale-110 hover:shadow-2xl hover:shadow-olive/40
          hover:rotate-6
          group
        "
      >
        <div className="relative">
          <svg 
            className="w-6 h-6 group-hover:scale-105 transition-transform duration-200" 
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
          
          {/* Badge accattivante */}
          <div className="absolute -top-2 -right-2 bg-sabbia text-olive text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-beige shadow-sm">
            {totalItems > 9 ? '9+' : totalItems}
          </div>
        </div>

        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-beige/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </Link>
  );
}