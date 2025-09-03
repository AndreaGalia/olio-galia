// components/sections/products/ProductsBackground.tsx
"use client";

export function ProductsBackground() {
  return (
    <div className="absolute inset-0">
      <div className="absolute top-20 right-10 w-96 h-96 rounded-full bg-olive/10 blur-3xl"></div>
      <div className="absolute bottom-32 left-20 w-80 h-80 rounded-full bg-salvia/10 blur-3xl"></div>
      <div className="absolute top-1/2 right-1/3 w-40 h-40 rounded-full bg-nocciola/15 blur-2xl"></div>
      
      {/* Pattern decorativo */}
      <div className="absolute top-40 left-1/4 opacity-5">
        <svg width="120" height="120" viewBox="0 0 120 120" className="text-olive">
          <circle cx="60" cy="60" r="2" fill="currentColor" />
          <circle cx="80" cy="40" r="1.5" fill="currentColor" />
          <circle cx="40" cy="80" r="1.5" fill="currentColor" />
          <circle cx="90" cy="75" r="1" fill="currentColor" />
          <circle cx="30" cy="45" r="1" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}