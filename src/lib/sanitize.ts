import DOMPurify from 'isomorphic-dompurify';

/**
 * Configurazione centralizzata per la sanitizzazione HTML
 * Utilizzata sia per la preview nell'editor che per il rendering pubblico
 */

// Configurazione completa per il rendering pubblico
export const FULL_SANITIZE_CONFIG = {
  // Tag HTML permessi
  ALLOWED_TAGS: [
    // Struttura
    'div', 'span', 'section', 'article', 'aside', 'header', 'footer', 'nav', 'main',
    // Testo
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'u', 'strike', 'small',
    'mark', 'del', 'ins', 'sub', 'sup', 'blockquote', 'pre', 'code',
    // Liste
    'ul', 'ol', 'li', 'dl', 'dt', 'dd',
    // Tabelle
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
    // Media
    'img', 'figure', 'figcaption', 'picture', 'source',
    'video', 'audio', 'track',
    'iframe', // Per embed YouTube, Vimeo, ecc.
    // Altri
    'a', 'br', 'hr', 'abbr', 'address', 'cite', 'q', 'time', 'button',
  ],

  // Attributi permessi
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title', 'class', 'id', 'style',
    'width', 'height', 'target', 'rel', 'type',
    'data-*', 'aria-*', 'role',
    'controls', 'autoplay', 'loop', 'muted', 'poster',
    'frameborder', 'allowfullscreen', 'allow',
    'download', 'srcset', 'sizes', 'loading',
  ],

  // Permetti iframe per embed video
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,

  // Permetti data URIs per immagini inline (base64)
  ALLOW_DATA_ATTR: true,

  // Blocca script e style tag
  FORBID_TAGS: ['script', 'style'],

  // Blocca event handlers
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 'onfocus', 'onblur'],
};

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
 * Sanitizza HTML utilizzando la configurazione completa
 * @param html - HTML da sanitizzare
 * @returns HTML sanitizzato
 */
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, FULL_SANITIZE_CONFIG);
}

/**
 * Sanitizza HTML per la preview nell'editor
 * @param html - HTML da sanitizzare
 * @returns HTML sanitizzato per preview
 */
export function sanitizeHTMLPreview(html: string): string {
  return DOMPurify.sanitize(html, PREVIEW_SANITIZE_CONFIG);
}
