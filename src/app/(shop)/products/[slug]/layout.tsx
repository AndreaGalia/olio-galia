import { Metadata } from 'next';
import { generateProductMetadata } from '@/lib/seo/metadata';
import { ProductDocument } from '@/types/products';
import { getDatabase } from '@/lib/mongodb';

/**
 * Fetch product data per generateMetadata direttamente da MongoDB
 * (evita chiamate HTTP circolari che causano robots: index=false in caso di errore)
 */
async function getProduct(slug: string): Promise<ProductDocument | null> {
  try {
    const db = await getDatabase();
    const product = await db
      .collection<ProductDocument>('products')
      .findOne({ $or: [{ 'slug.it': slug }, { 'slug.en': slug }] });
    return product;
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

  try {
    // Genera metadata usando i campi SEO del prodotto
    return generateProductMetadata(product, 'it');
  } catch (error) {
    console.error('Error generating product metadata:', error);
    return {
      title: 'Olio Galia',
    };
  }
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
