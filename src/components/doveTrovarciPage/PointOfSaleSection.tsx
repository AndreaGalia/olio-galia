"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useT } from '@/hooks/useT';
import { useLocale } from '@/contexts/LocaleContext';
import { PointOfSalePublic, POSCategoryPublic, PointsOfSaleResponse } from '@/types/pointOfSale';
import CategoryFilter from './CategoryFilter';
import PointOfSaleList from './PointOfSaleList';

// Leaflet accede a `window` a import-time: caricamento solo lato client
const StoreMap = dynamic(() => import('./StoreMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-beige flex items-center justify-center">
      <div className="h-6 w-6 border-2 border-olive/20 border-t-olive rounded-full animate-spin" />
    </div>
  ),
});

export default function PointOfSaleSection() {
  const { t, translate } = useT();
  const { locale } = useLocale();
  const searchParams = useSearchParams();
  const d = t.doveTrovarciPage;

  const [pointsOfSale, setPointsOfSale] = useState<PointOfSalePublic[]>([]);
  const [categories, setCategories] = useState<POSCategoryPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const mapWrapperRef = useRef<HTMLDivElement>(null);
  // Distingue la selezione partita dalla mappa (deve scrollare la lista)
  // da quella partita dalla lista (non deve, altrimenti la card scappa sotto il dito)
  const shouldScrollToCard = useRef(false);
  const deepLinkApplied = useRef(false);

  const registerCardRef = useCallback((id: string, node: HTMLDivElement | null) => {
    if (node) {
      cardRefs.current.set(id, node);
    } else {
      cardRefs.current.delete(id);
    }
  }, []);

  useEffect(() => {
    const fetchPointsOfSale = async () => {
      try {
        setLoading(true);
        setLoadError(false);

        const response = await fetch(`/api/points-of-sale?locale=${locale}`);
        if (!response.ok) throw new Error('request failed');

        const data: PointsOfSaleResponse = await response.json();
        setPointsOfSale(data.pointsOfSale || []);
        setCategories(data.categories || []);
      } catch {
        setLoadError(true);
        setPointsOfSale([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPointsOfSale();
  }, [locale]);

  // Deep link ?punto=<slug> — solo al primo caricamento dei dati
  useEffect(() => {
    if (deepLinkApplied.current || pointsOfSale.length === 0) return;

    const slug = searchParams.get('punto');
    if (!slug) {
      deepLinkApplied.current = true;
      return;
    }

    const target = pointsOfSale.find(pos => pos.slug === slug);
    if (target) {
      shouldScrollToCard.current = true;
      setSelectedId(target.id);
    }
    deepLinkApplied.current = true;
  }, [pointsOfSale, searchParams]);

  const filteredPointsOfSale = useMemo(
    () =>
      activeCategory
        ? pointsOfSale.filter(pos => pos.categoryId === activeCategory)
        : pointsOfSale,
    [pointsOfSale, activeCategory]
  );

  // Porta la card in vista quando la selezione arriva dalla mappa o dal deep link
  useEffect(() => {
    if (!selectedId || !shouldScrollToCard.current) return;

    const node = cardRefs.current.get(selectedId);
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    shouldScrollToCard.current = false;
  }, [selectedId, filteredPointsOfSale]);

  const handleSelectFromList = (id: string) => {
    // Ri-cliccando la stessa card si deseleziona
    const next = selectedId === id ? null : id;
    setSelectedId(next);

    // Su mobile la mappa non è sticky: senza questo scroll il click su una card
    // zoomerebbe una mappa fuori schermo. Su desktop la mappa è già visibile.
    if (next && typeof window !== 'undefined' && window.innerWidth < 1024) {
      mapWrapperRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectFromMap = useCallback((id: string) => {
    shouldScrollToCard.current = true;
    setSelectedId(id);
  }, []);

  const handleCategorySelect = (categoryId: string | null) => {
    setActiveCategory(categoryId);
    setSelectedId(null);
  };

  const listLabels = {
    productsHere: d.productsHere,
    directions: d.directions,
    showOnMap: d.showOnMap,
  };

  const resultsLabel =
    filteredPointsOfSale.length === 1
      ? d.resultsCountOne
      : translate('doveTrovarciPage.resultsCount', { count: filteredPointsOfSale.length });

  /* ----------------------------- Stati speciali ---------------------------- */

  if (loading) {
    return (
      <section className="pb-16 sm:pb-24">
        <div className="px-6 sm:px-12 lg:px-16 xl:px-24 max-w-4xl mx-auto">
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-7 w-24 bg-olive/10 animate-pulse" />
            ))}
          </div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="border-t border-olive/20 py-6 animate-pulse">
              <div className="h-3 bg-olive/10 w-20 mb-3" />
              <div className="h-4 bg-olive/10 w-1/2 mb-3" />
              <div className="h-3 bg-olive/10 w-2/3" />
            </div>
          ))}
          <div className="border-t border-olive/20" />
        </div>
      </section>
    );
  }

  if (loadError) {
    return (
      <section className="pb-16 sm:pb-24">
        <div className="px-6 sm:px-12 lg:px-16 xl:px-24 max-w-4xl mx-auto">
          <div className="border-t border-olive/20 pt-8">
            <p className="text-sm text-black/60 leading-relaxed">{d.error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (pointsOfSale.length === 0) {
    return (
      <section className="pb-16 sm:pb-24">
        <div className="px-6 sm:px-12 lg:px-16 xl:px-24 max-w-4xl mx-auto">
          <div className="border-t border-olive/20 pt-10 text-center">
            <p
              className="text-black"
              style={{ fontSize: '15px', letterSpacing: '0.12em', lineHeight: '1.5' }}
            >
              {d.empty.title}
            </p>
            <p className="mt-3 text-sm text-black/60 leading-relaxed max-w-md mx-auto">
              {d.empty.description}
            </p>
            <Link
              href="/products"
              className="mt-6 inline-block px-6 py-3 font-serif termina-11 tracking-[3.4px] uppercase border border-olive bg-olive text-beige hover:bg-sabbia hover:text-olive transition-all duration-200 cursor-pointer"
            >
              {d.empty.cta}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  /* ------------------------------- Contenuto ------------------------------- */

  return (
    <section className="pb-16 sm:pb-24">
      {/* Filtri: larghezza piena, sopra la griglia mappa/lista */}
      <div className="px-6 sm:px-12 lg:px-16 xl:px-24 pb-8">
        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          allLabel={d.allCategories}
          totalCount={pointsOfSale.length}
          onSelect={handleCategorySelect}
        />
        <p className="mt-4 text-[11px] tracking-[0.2em] uppercase text-black/40">{resultsLabel}</p>
      </div>

      <div className="lg:grid lg:grid-cols-2 lg:gap-0">
        {/* Mappa — sticky su desktop, in cima su mobile */}
        <div ref={mapWrapperRef} className="lg:sticky lg:top-0 lg:h-screen">
          <div className="h-[50vh] lg:h-full border-t border-b lg:border-b-0 border-olive/20">
            <StoreMap
              pointsOfSale={filteredPointsOfSale}
              selectedId={selectedId}
              ariaLabel={d.mapLabel}
              onSelect={handleSelectFromMap}
            />
          </div>
        </div>

        {/* Lista */}
        <div className="px-6 sm:px-12 lg:px-12 xl:px-16 py-8 lg:py-12">
          {filteredPointsOfSale.length === 0 ? (
            <div className="border-t border-olive/20 pt-8">
              <p
                className="text-black"
                style={{ fontSize: '15px', letterSpacing: '0.12em', lineHeight: '1.5' }}
              >
                {d.emptyFiltered.title}
              </p>
              <p className="mt-3 text-sm text-black/60 leading-relaxed">
                {d.emptyFiltered.description}
              </p>
            </div>
          ) : (
            <PointOfSaleList
              pointsOfSale={filteredPointsOfSale}
              categories={categories}
              selectedId={selectedId}
              labels={listLabels}
              onSelect={handleSelectFromList}
              registerCardRef={registerCardRef}
            />
          )}
        </div>
      </div>
    </section>
  );
}
