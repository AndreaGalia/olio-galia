import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/metadata';

// Metadata per la pagina Chi Siamo
export const metadata: Metadata = generatePageMetadata(
  'Chi Siamo',
  'Scopri la storia di Olio Galia, i nostri valori e la passione per la produzione di olio extra vergine di oliva biologico di qualità superiore.',
  '/about',
  'it',
  [
    'chi siamo',
    'storia olio galia',
    'produzione olio biologico',
    'azienda agricola',
    'produttori olio italiano',
    'tradizione italiana',
    'about us',
    'italian olive oil producers'
  ]
);

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
