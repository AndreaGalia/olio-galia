import { MetadataRoute } from 'next';
import { getDatabase } from '@/lib/mongodb';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://oliogalia.it';

interface ProductSlug {
  slug: {
    it: string;
    en: string;
  };
  'metadata.updatedAt': Date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date();

  // Pagine statiche principali
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/products`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/smaltimento-rifiuti`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // Recupera prodotti dal database
  let productPages: MetadataRoute.Sitemap = [];

  try {
    const db = await getDatabase();
    const products = await db
      .collection<ProductSlug>('products')
      .find(
        { 'metadata.isActive': true },
        { projection: { slug: 1, 'metadata.updatedAt': 1 } }
      )
      .toArray();

    productPages = products.map((product) => ({
      url: `${BASE_URL}/products/${product.slug.it}`,
      lastModified: product['metadata.updatedAt'] || currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
    // Se fallisce, restituisci solo le pagine statiche
  }

  // Combina tutte le pagine
  return [...staticPages, ...productPages];
}
