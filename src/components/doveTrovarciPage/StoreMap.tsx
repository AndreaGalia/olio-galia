"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  createPinIcon,
  TILE_URL,
  TILE_ATTRIBUTION,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
} from '@/lib/map/leafletIcon';
import { PointOfSalePublic } from '@/types/pointOfSale';

interface StoreMapProps {
  pointsOfSale: PointOfSalePublic[];
  selectedId: string | null;
  ariaLabel: string;
  onSelect: (id: string) => void;
}

const SELECTED_ZOOM = 16;

export default function StoreMap({ pointsOfSale, selectedId, ariaLabel, onSelect }: StoreMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // Evita di rifare fitBounds a ogni render: solo quando cambia l'insieme dei punti
  const lastBoundsKey = useRef<string>('');

  /* --------------------------- Init della mappa --------------------------- */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      scrollWheelZoom: false, // niente zoom accidentale scorrendo la pagina
      zoomControl: true,
    });

    L.tileLayer(TILE_URL, {
      attribution: TILE_ATTRIBUTION,
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    // Se il container non ha ancora l'altezza definitiva quando Leaflet misura,
    // i tile restano grigi: un invalidateSize al frame successivo lo evita.
    const rafId = requestAnimationFrame(() => map.invalidateSize());

    // Stessa ragione al cambio di viewport (rotazione del telefono, resize)
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(containerRef.current);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
      lastBoundsKey.current = '';
    };
  }, []);

  /* ----------------------------- Marker sync ------------------------------ */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const markers = markersRef.current;
    const visibleIds = new Set(pointsOfSale.map(pos => pos.id));

    // Rimuove i marker dei punti non più visibili (cambio filtro)
    for (const [id, marker] of markers) {
      if (!visibleIds.has(id)) {
        marker.remove();
        markers.delete(id);
      }
    }

    // Aggiunge i marker mancanti
    for (const pointOfSale of pointsOfSale) {
      if (markers.has(pointOfSale.id)) continue;

      const marker = L.marker([pointOfSale.coordinates.lat, pointOfSale.coordinates.lng], {
        icon: createPinIcon(L, { selected: false }),
        title: pointOfSale.name,
        // I punti selezionati devono stare sopra gli altri
        riseOnHover: true,
      }).addTo(map);

      marker.on('click', () => onSelectRef.current(pointOfSale.id));
      markers.set(pointOfSale.id, marker);
    }

    // Inquadra tutti i punti visibili quando l'insieme cambia
    const boundsKey = pointsOfSale
      .map(pos => pos.id)
      .sort()
      .join(',');

    if (boundsKey !== lastBoundsKey.current && pointsOfSale.length > 0) {
      const bounds = L.latLngBounds(
        pointsOfSale.map(pos => [pos.coordinates.lat, pos.coordinates.lng] as L.LatLngTuple)
      );
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
      lastBoundsKey.current = boundsKey;
    }
  }, [pointsOfSale]);

  /* --------------------------- Selezione e zoom --------------------------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Aggiorna l'aspetto di tutti i marker
    for (const [id, marker] of markersRef.current) {
      marker.setIcon(createPinIcon(L, { selected: id === selectedId }));
      marker.setZIndexOffset(id === selectedId ? 1000 : 0);
    }

    if (!selectedId) return;

    const selected = pointsOfSale.find(pos => pos.id === selectedId);
    if (!selected) return;

    map.flyTo([selected.coordinates.lat, selected.coordinates.lng], SELECTED_ZOOM, {
      duration: 1.2,
    });
  }, [selectedId, pointsOfSale]);

  // Lo stile dei controlli Leaflet è applicato con varianti arbitrarie Tailwind:
  // globals.css non va toccato per override di singoli componenti.
  const leafletTheme = [
    // Tile virate verso la palette sabbia
    '[&_.leaflet-tile-pane]:[filter:sepia(0.18)_saturate(0.85)]',
    // Controlli zoom: angoli netti, niente ombre
    '[&_.leaflet-bar]:border [&_.leaflet-bar]:border-olive/20 [&_.leaflet-bar]:shadow-none',
    '[&_.leaflet-bar_a]:rounded-none [&_.leaflet-bar_a]:text-olive [&_.leaflet-bar_a]:bg-beige',
    '[&_.leaflet-bar_a:hover]:bg-sabbia',
    // Attribution: obbligatoria per la licenza ODbL, resa discreta
    '[&_.leaflet-control-attribution]:bg-beige/80 [&_.leaflet-control-attribution]:text-[10px]',
    '[&_.leaflet-control-attribution]:text-black/40 [&_.leaflet-control-attribution_a]:text-olive',
    '[&_.leaflet-container]:bg-beige',
  ].join(' ');

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label={ariaLabel}
      className={`h-full w-full z-0 ${leafletTheme}`}
    />
  );
}
