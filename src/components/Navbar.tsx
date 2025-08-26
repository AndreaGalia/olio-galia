"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
const [isMenuOpen, setIsMenuOpen] = useState(false);
const pathname = usePathname();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const isActive = (path: string) => pathname === path;

  const menuItems = [
    { name: 'Home', href: '/' },
    { name: 'Chi siamo', href: '/about' },
    { name: 'Prodotti', href: '/products' },
    { name: 'Contatti', href: '/contact' }
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

            {/* Menu Desktop */}
            <div className="hidden lg:flex flex-1 justify-end">
              <ul className="flex gap-8 xl:gap-12 text-olive font-serif text-lg">
                {menuItems.map((item) => (
                  <li key={item.name}>
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
            </div>

            {/* Hamburger Button */}
            <button 
              onClick={toggleMenu}
              className="lg:hidden flex flex-col gap-1.5 w-8 h-8 justify-center items-center z-50 relative"
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
              <h2 className="text-lg font-serif text-olive">Menu</h2>
              <button 
                onClick={toggleMenu}
                className="w-8 h-8 flex items-center justify-center text-olive hover:text-salvia transition-colors duration-200"
                aria-label="Close menu"
              >
                <span className="sr-only">Chiudi menu</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Links del menu */}
            <nav className="flex-1 px-6 py-8">
              <ul className="space-y-6">
                {menuItems.map((item) => (
                  <li key={item.name}>
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
            </nav>

            {/* Footer del menu mobile */}
            <div className="p-6 border-t border-olive/20">
              <div className="text-center">
                <p className="text-sm text-nocciola mb-2">Tradizione Siciliana</p>
                <p className="text-xs text-nocciola/70">Dal 1950</p>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}