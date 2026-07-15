import sanitizeHtml from 'sanitize-html';

/**
 * Sanitizzazione HTML lato server per il rendering pubblico.
 *
 * Usa sanitize-html (basato su htmlparser2, CommonJS puro) invece di
 * isomorphic-dompurify: quest'ultimo dipende da jsdom → parse5 (ESM-only),
 * che crasha con ERR_REQUIRE_ESM nel runtime serverless di Vercel.
 *
 * Per la preview nell'editor admin (lato client) vedi sanitize-client.ts.
 */

// Configurazione completa per il rendering pubblico
export const FULL_SANITIZE_CONFIG: sanitizeHtml.IOptions = {
  allowedTags: [
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

  // Attributi permessi su tutti i tag (script/style e handler on* sono
  // bloccati implicitamente: tutto ciò che non è in whitelist viene rimosso)
  allowedAttributes: {
    '*': [
      'href', 'src', 'alt', 'title', 'class', 'id', 'style',
      'width', 'height', 'target', 'rel', 'type',
      'data-*', 'aria-*', 'role',
      'controls', 'autoplay', 'loop', 'muted', 'poster',
      'frameborder', 'allowfullscreen', 'allow',
      'download', 'srcset', 'sizes', 'loading',
    ],
  },

  // Schemi URI permessi (equivalente di ALLOWED_URI_REGEXP di DOMPurify);
  // 'data' consente immagini inline base64
  allowedSchemes: ['http', 'https', 'ftp', 'mailto', 'tel', 'callto', 'cid', 'xmpp', 'data'],
  allowProtocolRelative: true,
};

/**
 * Sanitizza HTML utilizzando la configurazione completa
 * @param html - HTML da sanitizzare
 * @returns HTML sanitizzato
 */
export function sanitizeHTML(html: string): string {
  return sanitizeHtml(html, FULL_SANITIZE_CONFIG);
}
