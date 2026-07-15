'use client';

import DOMPurify from 'dompurify';

/**
 * Sanitizzazione HTML lato client per la preview nell'editor admin.
 *
 * Usa DOMPurify puro (senza jsdom): gira solo nel browser, dove il DOM
 * è nativo. Per il rendering pubblico lato server vedi sanitize.ts.
 */

// Configurazione base per la preview nell'editor admin
export const PREVIEW_SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'a', 'strong', 'em', 'u', 'br', 'hr',
    'img', 'video', 'iframe', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'blockquote', 'pre', 'code', 'section', 'article', 'aside', 'nav',
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title', 'class', 'id', 'style',
    'width', 'height', 'target', 'rel', 'data-*',
  ],
  FORBID_TAGS: ['script', 'style'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick'],
};

/**
 * Sanitizza HTML per la preview nell'editor
 * @param html - HTML da sanitizzare
 * @returns HTML sanitizzato per preview
 */
export function sanitizeHTMLPreview(html: string): string {
  return DOMPurify.sanitize(html, PREVIEW_SANITIZE_CONFIG);
}
