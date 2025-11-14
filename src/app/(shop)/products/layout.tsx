import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/metadata';

// Metadata per la pagina catalogo prodotti
export const metadata: Metadata = generatePageMetadata(
  'I Nostri Prodotti',
  'Scopri la nostra selezione di oli extra vergine di oliva biologici di alta qualità. Prodotti artigianali italiani selezionati con cura.',
  '/products',
  'it',
  [
    'olio extra vergine',
    'olio biologico',
    'olio italiano',
    'prodotti artigianali',
    'catalogo olio',
    'extra virgin olive oil',
    'organic olive oil'
  ]
);

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
