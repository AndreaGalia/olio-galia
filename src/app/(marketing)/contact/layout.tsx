import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/metadata';

// Metadata per la pagina Contatti
export const metadata: Metadata = generatePageMetadata(
  'Contatti',
  'Contatta Olio Galia per informazioni, preventivi e ordini. Siamo a tua disposizione per qualsiasi domanda sui nostri prodotti.',
  '/contact',
  'it',
  [
    'contatti',
    'contatta olio galia',
    'richiedi preventivo',
    'ordina olio',
    'informazioni',
    'contact us',
    'get in touch'
  ]
);

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
