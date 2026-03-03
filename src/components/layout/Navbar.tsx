"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { useT } from '@/hooks/useT';

interface MenuItem {
  name: string;
  href: string;
  translationKey: string;
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { getTotalItems } = useCart();
  const { t, translate } = useT();
  
  const totalItems = getTotalItems();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const isActive = (path: string) => pathname === path;

  const menuItems: MenuItem[] = [
    { name: t.navbar.menu.products, href: '/products', translationKey: 'products' },
    { name: t.navbar.menu.about, href: '/about', translationKey: 'about' },
    { name: t.navbar.menu.contact, href: '/contact', translationKey: 'contact' }
  ];

  return (
    <>
      <nav className="sticky top-0 z-30 bg-[#D6C7A1] px-4 sm:px-6 lg:px-[100px] py-4 sm:py-6">
        <div className="w-full">
          <div className="flex justify-between items-center lg:grid lg:grid-cols-[1fr_auto_1fr]">
            
            {/* Logo */}
            <div className="flex justify-start">
              <Link href="/" className="hover:opacity-80 transition-opacity duration-200">
                <img
                  src={process.env.NEXT_PUBLIC_LOGO_SVG_URL}
                  alt="Olio Galia"
                  className="h-[16px] sm:h-[22px] w-auto"
                />
              </Link>
            </div>

            {/* Menu Items Desktop — centro */}
            <div className="hidden lg:flex justify-center items-center">
              <ul className="flex gap-10 xl:gap-14 text-black font-serif text-[11px]">
                {menuItems.map((item) => (
                  <li key={item.translationKey}>
                    <Link
                      href={item.href}
                      className={`cursor-pointer hover:text-salvia transition-colors duration-200 whitespace-nowrap uppercase tracking-widest ${
                        isActive(item.href) ? 'text-salvia' : ''
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Language Switcher + Carrello Desktop — destra */}
            <div className="hidden lg:flex justify-end items-center gap-4">
              <LanguageSwitcher />
              <Link href="/cart">
                <button
                  className="p-2 text-black hover:text-salvia transition-colors duration-200 cursor-pointer"
                  aria-label={t.navbar.cart.title}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                </button>
              </Link>
            </div>

            {/* Carrello Mobile + Hamburger Button */}
            <div className="lg:hidden flex items-center gap-3">
              {/* Carrello Mobile */}
              <Link href="/cart" className="relative">
                <button
                  className="p-2 text-black hover:text-salvia transition-colors duration-200 relative"
                  aria-label={t.navbar.cart.title}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                </button>
              </Link>

              {/* Hamburger Button */}
              <button 
                onClick={toggleMenu}
                className="flex flex-col gap-1.5 w-8 h-8 justify-center items-center z-50 relative"
                aria-label="Toggle menu"
              >
                <span className={`w-6 h-0.5 bg-black transition-all duration-300 ${
                  isMenuOpen ? 'rotate-45 translate-y-2' : ''
                }`}></span>
                <span className={`w-6 h-0.5 bg-black transition-all duration-300 ${
                  isMenuOpen ? 'opacity-0' : ''
                }`}></span>
                <span className={`w-6 h-0.5 bg-black transition-all duration-300 ${
                  isMenuOpen ? '-rotate-45 -translate-y-2' : ''
                }`}></span>
              </button>
            </div>
          </div>
        </div>

        {/* Menu Mobile — fullscreen */}
        <div className={`lg:hidden fixed inset-0 w-full h-full bg-[#D6C7A1] z-50 transform transition-transform duration-300 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex flex-col h-full">

            {/* Header del menu mobile */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-olive/20">
              <Link href="/" onClick={toggleMenu} className="hover:opacity-80 transition-opacity duration-200">
                <img
                  src={process.env.NEXT_PUBLIC_LOGO_SVG_URL}
                  alt="Olio Galia"
                  className="h-[16px] sm:h-[22px] w-auto"
                />
              </Link>
              <button
                onClick={toggleMenu}
                className="w-8 h-8 flex items-center justify-center text-black transition-colors duration-200"
                aria-label={t.navbar.mobile.closeMenu}
              >
                <span className="sr-only">{t.navbar.mobile.closeMenu}</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Links del menu — centrati verticalmente */}
            <nav className="flex-1 flex flex-col justify-center items-center gap-8">
              <ul className="flex flex-col items-center gap-8">
                {menuItems.map((item) => (
                  <li key={item.translationKey}>
                    <Link
                      href={item.href}
                      className={`block text-2xl font-serif tracking-widest uppercase transition-colors duration-200 ${
                        isActive(item.href) ? 'text-olive' : 'text-black'
                      }`}
                      onClick={toggleMenu}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Footer del menu mobile */}
            <div className="px-6 py-6 border-t border-olive/20 flex justify-between items-center">
              <LanguageSwitcher />
              <Link
                href="/cart"
                className="flex items-center gap-2 bg-olive text-white px-4 py-2 transition-opacity duration-200 hover:opacity-80"
                onClick={toggleMenu}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
                <span className="text-sm font-serif uppercase tracking-widest">
                  {t.navbar.mobile.cart} {totalItems > 0 && `(${totalItems})`}
                </span>
              </Link>
            </div>

          </div>
        </div>
      </nav>
    </>
  );
}