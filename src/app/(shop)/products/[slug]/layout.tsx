import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { generateProductMetadata } from '@/lib/seo/metadata';
import { ProductDocument } from '@/types/products';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://oliogalia.it';

/**
 * Fetch product data per generateMetadata
 * Questa funzione viene eseguita solo al build time per SSG
 */
async function getProduct(slug: string): Promise<ProductDocument | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/products/${slug}`, {
      cache: 'force-cache', // Cache per SSG
      next: { revalidate: 3600 } // Revalidate ogni ora
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.product;
  } catch (error) {
    console.error('Error fetching product for metadata:', error);
    return null;
  }
}

/**
 * Genera metadata dinamici per ogni prodotto
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: 'Prodotto Non Trovato',
      robots: {
        index: false,
        follow: false
      }
    };
  }

  // Genera metadata usando i campi SEO del prodotto
  return generateProductMetadata(product, 'it');
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
