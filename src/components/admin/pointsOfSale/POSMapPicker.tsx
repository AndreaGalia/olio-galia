'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { createPinIcon, TILE_URL, TILE_ATTRIBUTION, DEFAULT_CENTER, DEFAULT_ZOOM } from '@/lib/map/leafletIcon';
import { Coordinates } from '@/types/pointOfSale';

interface POSMapPickerProps {
  coordinates: Coordinates | null;
  onChange: (coordinates: Coordinates) => void;
}

/**
 * Mini-mappa di anteprima per il form admin: mostra il pin nella posizione
 * corrente e permette di correggerla cliccando o trascinando il marker.
 * Importata dinamicamente con ssr:false — Leaflet tocca `window` a import-time.
 */
export default function POSMapPicker({ coordinates, onChange }: POSMapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  // onChange in una ref: evita di ricreare la mappa a ogni render del form
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  // Distingue le coordinate impostate dall'utente sulla mappa (click o drag del
  // pin) da quelle arrivate da fuori (geocoding, input manuali): solo le seconde
  // devono ricentrare e zoomare la vista.
  const fromMapGesture = useRef(false);

  // Inizializzazione della mappa — una sola volta
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: coordinates ? [coordinates.lat, coordinates.lng] : DEFAULT_CENTER,
      zoom: coordinates ? 16 : DEFAULT_ZOOM,
      scrollWheelZoom: false, // evita zoom accidentali mentre si scorre la form
    });

    L.tileLayer(TILE_URL, {
      attribution: TILE_ATTRIBUTION,
      maxZoom: 19,
    }).addTo(map);

    map.on('click', (event: L.LeafletMouseEvent) => {
      fromMapGesture.current = true;
      onChangeRef.current({
        lat: Number(event.latlng.lat.toFixed(6)),
        lng: Number(event.latlng.lng.toFixed(6)),
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sincronizza il marker con le coordinate del form
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!coordinates) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }

    const position: L.LatLngExpression = [coordinates.lat, coordinates.lng];

    if (markerRef.current) {
      markerRef.current.setLatLng(position);
    } else {
      const marker = L.marker(position, {
        icon: createPinIcon(L, { selected: true }),
        draggable: true,
      }).addTo(map);

      marker.on('dragend', () => {
        fromMapGesture.current = true;
        const { lat, lng } = marker.getLatLng();
        onChangeRef.current({
          lat: Number(lat.toFixed(6)),
          lng: Number(lng.toFixed(6)),
        });
      });

      markerRef.current = marker;
    }

    if (fromMapGesture.current) {
      // L'utente ha appena cliccato o trascinato: la vista è già dove serve
      fromMapGesture.current = false;
    } else {
      map.setView(position, Math.max(map.getZoom(), 16));
    }
  }, [coordinates]);

  return (
    <div>
      <div
        ref={containerRef}
        className="h-72 w-full rounded-lg overflow-hidden border border-olive/20 z-0"
      />
      <p className="mt-2 text-xs text-nocciola">
        Clicca sulla mappa o trascina il pin per correggere la posizione esatta.
      </p>
    </div>
  );
}
