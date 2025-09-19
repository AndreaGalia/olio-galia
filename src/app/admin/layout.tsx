import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Panel - Olio Galia',
  description: 'Pannello di amministrazione per la gestione di ordini e preventivi',
  robots: 'noindex, nofollow', // Prevent search engines from indexing admin pages
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}