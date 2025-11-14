import { Metadata } from 'next';
import { generateNoIndexMetadata } from '@/lib/seo/metadata';

// Blocca l'indicizzazione di tutte le pagine admin
export const metadata: Metadata = generateNoIndexMetadata('Admin Panel');

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}