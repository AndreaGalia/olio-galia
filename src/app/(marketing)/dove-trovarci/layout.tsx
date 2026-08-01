import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata(
  'Dove Trovarci',
  'Scopri i supermercati, le macellerie, i negozi di alimentari e i mercati dove acquistare l\'olio extravergine Olio Galia. Mappa interattiva di tutti i punti vendita.',
  '/dove-trovarci',
  'it',
  [
    'dove comprare olio galia',
    'punti vendita olio galia',
    'rivenditori olio extravergine sicilia',
    'negozi olio extravergine',
    'olio galia supermercato',
    'olio siciliano dove acquistare',
    'where to buy olio galia',
    'olive oil stockists sicily',
  ]
);

export default function DoveTrovarciLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
