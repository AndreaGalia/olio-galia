"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
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
    { name: t.navbar.menu.home, href: '/', translationKey: 'home' },
    { name: t.navbar.menu.about, href: '/about', translationKey: 'about' },
    { name: t.navbar.menu.products, href: '/products', translationKey: 'products' },
    { name: t.navbar.menu.contact, href: '/contact', translationKey: 'contact' }
  ];

  return (
    <>
      <nav className="relative bg-[#D6C7A1] px-4 sm:px-6 py-4 sm:py-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex justify-between items-center">
            
            {/* Logo */}
            <div className="flex-1 flex justify-start">
              <Link href="/" className="hover:opacity-80 transition-opacity duration-200">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-olive tracking-widest">
                  OLIO GALIA
                </h1>
              </Link>
            </div>

            {/* Menu Desktop + Language Switcher + Carrello */}
            <div className="hidden lg:flex flex-1 justify-end items-center gap-6">
              {/* Menu Items */}
              <ul className="flex gap-8 xl:gap-12 text-olive font-serif text-lg">
                {menuItems.map((item) => (
                  <li key={item.translationKey}>
                    <Link
                      href={item.href}
                      className={`cursor-pointer hover:underline hover:text-salvia transition-colors duration-200 ${
                        isActive(item.href) ? 'text-salvia underline' : ''
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Language Switcher Desktop */}
              <div className="ml-4">
                <LanguageSwitcher />
              </div>
              
              {/* Carrello Desktop */}
              <Link href="/cart" className="relative ml-4">
                <button 
                  className="p-2 text-olive hover:text-salvia transition-colors duration-200 relative cursor-pointer"
                  aria-label={t.navbar.cart.title}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                  {/* Badge con numero elementi */}
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-olive text-beige text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold leading-none">
                      {totalItems > 99 ? '99+' : totalItems}
                    </span>
                  )}
                </button>
              </Link>
            </div>

            {/* Carrello Mobile + Hamburger Button */}
            <div className="lg:hidden flex items-center gap-3">
              {/* Carrello Mobile */}
              <Link href="/cart" className="relative">
                <button 
                  className="p-2 text-olive hover:text-salvia transition-colors duration-200 relative"
                  aria-label={t.navbar.cart.title}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                  {/* Badge con numero elementi */}
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-olive text-beige text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold leading-none">
                      {totalItems > 99 ? '99+' : totalItems}
                    </span>
                  )}
                </button>
              </Link>

              {/* Hamburger Button */}
              <button 
                onClick={toggleMenu}
                className="flex flex-col gap-1.5 w-8 h-8 justify-center items-center z-50 relative"
                aria-label="Toggle menu"
              >
                <span className={`w-6 h-0.5 bg-olive transition-all duration-300 ${
                  isMenuOpen ? 'rotate-45 translate-y-2' : ''
                }`}></span>
                <span className={`w-6 h-0.5 bg-olive transition-all duration-300 ${
                  isMenuOpen ? 'opacity-0' : ''
                }`}></span>
                <span className={`w-6 h-0.5 bg-olive transition-all duration-300 ${
                  isMenuOpen ? '-rotate-45 -translate-y-2' : ''
                }`}></span>
              </button>
            </div>
          </div>
        </div>

        {/* Menu Mobile Overlay */}
        <div className={`lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`} onClick={toggleMenu}></div>

        {/* Menu Mobile */}
        <div className={`lg:hidden fixed top-0 right-0 w-80 max-w-[85vw] h-full bg-[#D6C7A1] z-50 transform transition-transform duration-300 shadow-2xl ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            {/* Header del menu mobile */}
            <div className="flex justify-between items-center p-6 border-b border-olive/20">
              <h2 className="text-lg font-serif text-olive">{t.navbar.mobile.menuTitle}</h2>
              <button 
                onClick={toggleMenu}
                className="w-8 h-8 flex items-center justify-center text-olive hover:text-salvia transition-colors duration-200"
                aria-label={t.navbar.mobile.closeMenu}
              >
                <span className="sr-only">{t.navbar.mobile.closeMenu}</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Links del menu */}
            <nav className="flex-1 px-6 py-8">
              <ul className="space-y-6">
                {menuItems.map((item) => (
                  <li key={item.translationKey}>
                    <Link 
                      href={item.href}
                      className={`block text-xl font-serif hover:text-salvia transition-colors duration-200 py-2 ${
                        isActive(item.href) ? 'text-salvia' : 'text-olive'
                      }`}
                      onClick={toggleMenu}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Language Switcher Mobile */}
              <div className="mt-8 pt-6 border-t border-olive/20">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-serif text-olive">{t.navbar.mobile.language}</span>
                  <LanguageSwitcher />
                </div>
              </div>

              {/* Carrello nel menu mobile */}
              <div className="pt-4 border-t border-olive/20">
                <Link 
                  href="/cart"
                  className="flex items-center gap-3 text-olive hover:text-salvia transition-colors duration-200 py-2"
                  onClick={toggleMenu}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                  <span className="text-lg font-serif">
                    {t.navbar.mobile.cart} {totalItems > 0 && `(${totalItems})`}
                  </span>
                </Link>
              </div>
            </nav>

            {/* Footer del menu mobile */}
            <div className="p-6 border-t border-olive/20">
              <div className="text-center">
                <p className="text-sm text-nocciola mb-2">{t.navbar.mobile.tagline}</p>
                <p className="text-xs text-nocciola/70">{t.navbar.mobile.since}</p>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}