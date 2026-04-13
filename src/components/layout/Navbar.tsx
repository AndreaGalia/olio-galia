"use client";

import React, { useState, useEffect } from 'react';
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

  const [isScrolled, setIsScrolled] = useState(false);
  const isHomepage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const transparent = isHomepage && !isScrolled;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const isActive = (path: string) => pathname === path;

  const menuItems: MenuItem[] = [
    { name: t.navbar.menu.products, href: '/products', translationKey: 'products' },
    { name: t.navbar.menu.about, href: '/about', translationKey: 'about' },
    { name: t.navbar.menu.contact, href: '/contact', translationKey: 'contact' }
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 w-full z-30 px-4 sm:px-6 lg:px-[6.25rem] py-4 sm:py-6 transition-colors duration-300 ${transparent ? 'bg-transparent' : 'bg-sabbia-chiaro'}`}>
        <div className="w-full">
          <div className="flex justify-between items-center">
            
            {/* Logo */}
            <div className="flex justify-start">
              <Link href="/" className="hover:opacity-80 transition-opacity duration-200">
                <img
                  src={process.env.NEXT_PUBLIC_LOGO_SVG_URL}
                  alt="Olio Galia"
                  className="h-[1rem] sm:h-[1.375rem] w-auto"
                />
              </Link>
            </div>

            {/* Menu Items Desktop — centro */}
            <div className="hidden lg:flex flex-1 justify-center items-center">
              <ul className="flex gap-10 xl:gap-14 text-black font-serif navbar-desktop-link">
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
        <div className={`lg:hidden fixed inset-0 w-full h-full bg-sabbia-chiaro z-50 transform transition-transform duration-300 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex flex-col h-full">

            {/* Header */}
            <div className="flex justify-between items-center px-8 py-5">
              <Link href="/" onClick={toggleMenu} className="hover:opacity-80 transition-opacity duration-200">
                <img src={process.env.NEXT_PUBLIC_LOGO_SVG_URL} alt="Olio Galia" className="h-[1rem] w-auto" />
              </Link>
              <button onClick={toggleMenu} className="w-8 h-8 flex items-center justify-center text-black" aria-label={t.navbar.mobile.closeMenu}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenuto — unica colonna scorrevole */}
            <div className="flex-1 overflow-y-auto px-8 pt-6">

              <Link href="/products" onClick={toggleMenu} className={`block py-3 mobile-menu-link-bold ${isActive('/products') ? 'text-olive' : 'text-black'}`}>
                {t.navbar.menu.allProducts}
              </Link>
              <Link href="/products?category=olio-evo" onClick={toggleMenu} className="block py-3 mobile-menu-link text-black">
                {t.footer.products.classic}
              </Link>
              <Link href="/products?category=beauty" onClick={toggleMenu} className="block py-3 mobile-menu-link text-black">
                {t.footer.products.bodyOil}
              </Link>

              <div className="border-t border-black my-4" />

              <Link href="/about" onClick={toggleMenu} className={`block py-3 mobile-menu-link ${isActive('/about') ? 'text-olive' : 'text-black'}`}>
                {t.navbar.menu.about}
              </Link>
              <Link href="/sostenibilita" onClick={toggleMenu} className={`block py-3 mobile-menu-link ${isActive('/sostenibilita') ? 'text-olive' : 'text-black'}`}>
                {t.navbar.menu.sustainability}
              </Link>
              <Link href="/contact" onClick={toggleMenu} className={`block py-3 mobile-menu-link ${isActive('/contact') ? 'text-olive' : 'text-black'}`}>
                {t.navbar.menu.contact}
              </Link>
              <Link href="/faq" onClick={toggleMenu} className={`block py-3 mobile-menu-link ${isActive('/faq') ? 'text-olive' : 'text-black'}`}>
                {t.navbar.menu.faq}
              </Link>

              <div className="border-t border-black my-4" />

              <div className="py-3 flex items-center gap-3">
                <span className="mobile-menu-link text-black">{t.navbar.mobile.language}</span>
                <LanguageSwitcher mobile />
              </div>

              <div className="border-t border-black my-4" />

              <Link href="/cart" onClick={toggleMenu} className="flex items-center gap-2 bg-olive text-white px-4 py-2 mt-3 mb-8 transition-opacity duration-200 hover:opacity-80 self-start inline-flex">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
                <span className="mobile-menu-link" style={{color: 'white'}}>
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