'use client';

import { useMemo } from 'react';
import { sanitizeHTML } from '@/lib/sanitize';

interface CustomHTMLRendererProps {
  html: string;
  className?: string;
}

/**
 * Componente per il rendering sicuro di HTML personalizzato
 * Utilizza DOMPurify per sanitizzare l'HTML e prevenire XSS
 */
export default function CustomHTMLRenderer({ html, className = '' }: CustomHTMLRendererProps) {
  // Memoizza l'HTML sanitizzato per evitare ricalcoli ad ogni render
  const sanitizedHTML = useMemo(() => sanitizeHTML(html), [html]);

  return (
    <div
      className={`custom-html-content ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
      style={{
        // Assicura che il contenuto non esca dal container
        maxWidth: '100%',
        overflowX: 'hidden',
      }}
    />
  );
}
