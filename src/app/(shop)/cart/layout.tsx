import { Metadata } from 'next';
import { generateNoIndexMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generateNoIndexMetadata('Carrello');

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
