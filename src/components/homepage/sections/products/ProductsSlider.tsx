"use client";
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useCallback, useEffect, useState } from 'react';
import ProductCard from '@/components/productsPage/ProductCard';
import { Product } from '@/types/products';
import { useT } from '@/hooks/useT';

interface ProductsSliderProps {
  products: Product[];
  onAddToCart: (productId: string) => void;
}

export default function ProductsSlider({ products, onAddToCart }: ProductsSliderProps) {
  const { t } = useT();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start' },
    [Autoplay({ delay: 4000, stopOnInteraction: true })]
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-black text-lg">{t.productsPage.noProducts}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Slider */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4 sm:gap-6">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="flex-none w-[85%] sm:w-[45%] lg:w-[31%]"
            >
              <ProductCard
                product={product}
                index={index}
                onAddToCart={onAddToCart}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Frecce */}
      <button
        onClick={scrollPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 text-olive/50 hover:text-olive transition-colors z-10 hidden sm:flex text-2xl"
        aria-label="Precedente"
      >
        &#60;
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 text-olive/50 hover:text-olive transition-colors z-10 hidden sm:flex text-2xl"
        aria-label="Successivo"
      >
        &#62;
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {products.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === selectedIndex ? 'bg-olive w-4' : 'bg-olive/30'
            }`}
            aria-label={`Vai al prodotto ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
