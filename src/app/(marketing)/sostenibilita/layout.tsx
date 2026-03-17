import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata(
  'Sostenibilità',
  'Scopri il nostro impegno per una produzione olearia sostenibile: agricoltura biologica, raccolta a mano e filiera corta nel rispetto della terra siciliana.',
  '/sostenibilita',
  'it',
  [
    'sostenibilità olio galia',
    'agricoltura biologica sicilia',
    'olio extravergine biologico',
    'raccolta a mano olive',
    'filiera corta olio',
    'produzione sostenibile olio',
    'olive oil sustainability',
    'organic olive oil sicily',
  ]
);

export default function SostenibilitaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
