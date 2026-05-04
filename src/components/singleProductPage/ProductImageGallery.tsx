'use client';
import { useEffect, useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { MediaItem } from '@/types/products';

interface ProductImageGalleryProps {
  media: MediaItem[];
  productName: string;
  isOutOfStock: boolean;
}

export default function ProductImageGallery({ media, productName, isOutOfStock }: ProductImageGalleryProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, dragFree: false });
  const [current, setCurrent] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrent(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi, onSelect]);

  // Reset on media change (variant change)
  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.scrollTo(0);
    setCurrent(0);
  }, [media, emblaApi]);

  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const hasMultiple = media.length > 1;

  return (
    <div className={`group relative w-full h-full overflow-hidden ${isOutOfStock ? 'grayscale' : ''}`}>

      {/* Embla viewport */}
      <div ref={emblaRef} className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing">
        <div className="flex h-full">
          {media.map((item, index) => (
            <div key={index} className="flex-[0_0_100%] h-full relative">
              {item.type === 'video' ? (
                <video
                  src={item.url}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                    isOutOfStock ? 'opacity-60' : 'opacity-100'
                  }`}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
              ) : (
                <img
                  src={item.url}
                  alt={`${productName}${hasMultiple ? ` — ${index + 1}` : ''}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                    isOutOfStock ? 'opacity-60' : 'opacity-100'
                  }`}
                  draggable={false}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sold out badge */}
      {isOutOfStock && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="bg-black/70 text-white px-6 py-2 font-serif termina-11 tracking-widest uppercase">
            Sold Out
          </span>
        </div>
      )}

      {/* Arrows — on hover, only if multiple */}
      {hasMultiple && (
        <>
          <button
            onClick={prev}
            aria-label="Media precedente"
            className="absolute left-5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-7 h-7 text-black">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <button
            onClick={next}
            aria-label="Media successivo"
            className="absolute right-5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-7 h-7 text-black">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black/10 pointer-events-none">
            <div
              className="h-full bg-black/35 transition-all duration-300 ease-out"
              style={{ width: `${((current + 1) / media.length) * 100}%` }}
            />
          </div>
        </>
      )}
    </div>
  );
}
