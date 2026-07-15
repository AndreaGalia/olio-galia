import { sanitizeHTML } from '@/lib/sanitize';

interface CustomHTMLRendererProps {
  html: string;
  className?: string;
}

/**
 * Componente server per il rendering sicuro di HTML personalizzato
 * Utilizza sanitize-html per sanitizzare l'HTML e prevenire XSS
 */
export default function CustomHTMLRenderer({ html, className = '' }: CustomHTMLRendererProps) {
  const sanitizedHTML = sanitizeHTML(html);

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
