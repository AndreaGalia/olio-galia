import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/metadata';

// Metadata per la pagina Smaltimento Rifiuti
export const metadata: Metadata = generatePageMetadata(
  'Smaltimento Rifiuti e Riciclaggio',
  'Guida completa al corretto smaltimento e riciclaggio del packaging dei nostri prodotti. Contribuisci alla sostenibilità ambientale.',
  '/smaltimento-rifiuti',
  'it',
  [
    'smaltimento rifiuti',
    'riciclaggio',
    'packaging sostenibile',
    'raccolta differenziata',
    'sostenibilità',
    'ambiente',
    'waste disposal',
    'recycling guide'
  ]
);

export default function SmaltimentoRifiutiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
