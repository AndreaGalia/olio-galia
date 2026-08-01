import type * as LeafletNamespace from 'leaflet';

/**
 * Le icone marker di default di Leaflet puntano a immagini risolte via URL
 * relativo al CSS, cosa che i bundler rompono sistematicamente. Usiamo un
 * divIcon con SVG inline: niente richieste esterne e il pin segue la palette
 * brand tramite le CSS variables definite in globals.css.
 */
export function createPinIcon(
  L: typeof LeafletNamespace,
  options?: { selected?: boolean }
): LeafletNamespace.DivIcon {
  const selected = options?.selected ?? false;

  const fill = selected ? 'var(--color-olive)' : 'var(--color-sabbia)';
  const stroke = 'var(--color-olive)';
  const dot = selected ? 'var(--color-beige)' : 'var(--color-olive)';
  const scale = selected ? 1.25 : 1;

  const width = 28 * scale;
  const height = 38 * scale;

  const html = `
    <div style="transform: translateZ(0); transition: transform 200ms ease;">
      <svg width="${width}" height="${height}" viewBox="0 0 28 38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 0.75C6.68 0.75 0.75 6.68 0.75 14c0 9.44 11.6 22.3 12.1 22.84a1.55 1.55 0 0 0 2.3 0C15.65 36.3 27.25 23.44 27.25 14 27.25 6.68 21.32 0.75 14 0.75Z"
          fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
        <circle cx="14" cy="14" r="4.5" fill="${dot}"/>
      </svg>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'olio-galia-pin',
    iconSize: [width, height],
    iconAnchor: [width / 2, height], // punta del pin sulla coordinata
    popupAnchor: [0, -height + 4],
  });
}

/** Tile layer chiaro e neutro, coerente con lo sfondo sabbia delle pagine */
export const TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

/**
 * L'attribution è un requisito della licenza ODbL di OpenStreetMap:
 * non va rimossa.
 */
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

/** Centro di fallback: Sicilia, usato quando non ci sono punti da inquadrare */
export const DEFAULT_CENTER: [number, number] = [37.5, 14.0];
export const DEFAULT_ZOOM = 8;
