import Script from 'next/script';
import { Product, ProductDocument } from '@/types/products';

const SITE_NAME = 'Olio Galia';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://oliogalia.it';

/**
 * Genera structured data JSON-LD per Organization
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: BASE_URL,
    logo: `${BASE_URL}/images/logo.png`,
    description: 'Produttore di olio extra vergine di oliva biologico di alta qualità',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IT'
    },
    sameAs: [
      // Aggiungi qui i link ai social media quando disponibili
      // 'https://www.facebook.com/oliogalia',
      // 'https://www.instagram.com/oliogalia'
    ]
  };
}

/**
 * Genera structured data JSON-LD per WebSite
 */
export function generateWebsiteSchema(locale: 'it' | 'en' = 'it') {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: BASE_URL,
    description: locale === 'it'
      ? 'E-commerce di olio extra vergine di oliva biologico'
      : 'Organic extra virgin olive oil e-commerce',
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/products?search={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
}

/**
 * Genera structured data JSON-LD per Product
 */
export function generateProductSchema(
  product: Product | ProductDocument,
  locale: 'it' | 'en' = 'it',
  averageRating?: number,
  reviewCount?: number
) {
  // Estrai le traduzioni corrette
  const translations = 'translations' in product
    ? product.translations[locale]
    : product as unknown as Product;

  const slug = 'slug' in product
    ? typeof product.slug === 'string' ? product.slug : product.slug[locale]
    : '';

  // Immagini prodotto
  const images = 'images' in product ? product.images : [];

  // Prezzo e disponibilità
  const price = 'price' in product ? parseFloat(product.price) : 0;
  const inStock = 'inStock' in product ? product.inStock : true;

  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: translations.name,
    description: translations.description || translations.longDescription,
    image: images.map(img => img.startsWith('http') ? img : `${BASE_URL}${img}`),
    brand: {
      '@type': 'Brand',
      name: SITE_NAME
    },
    offers: {
      '@type': 'Offer',
      url: `${BASE_URL}/${locale}/products/${slug}`,
      priceCurrency: 'EUR',
      price: price.toFixed(2),
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: SITE_NAME
      }
    }
  };

  // Aggiungi SKU se disponibile
  if ('id' in product) {
    schema.sku = product.id;
  }

  // Aggiungi categoria se disponibile
  if (translations.categoryDisplay) {
    schema.category = translations.categoryDisplay;
  }

  // Aggiungi aggregateRating se ci sono recensioni
  if (averageRating && reviewCount && reviewCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: averageRating.toFixed(1),
      reviewCount: reviewCount,
      bestRating: '5',
      worstRating: '1'
    };
  }

  // Aggiungi additionalProperty per caratteristiche
  if (translations.features && translations.features.length > 0) {
    schema.additionalProperty = translations.features.map(feature => ({
      '@type': 'PropertyValue',
      name: 'Feature',
      value: feature
    }));
  }

  return schema;
}

/**
 * Genera structured data JSON-LD per BreadcrumbList
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
  locale: 'it' | 'en' = 'it'
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`
    }))
  };
}

/**
 * Genera structured data JSON-LD per Review
 */
export function generateReviewSchema(
  productName: string,
  rating: number,
  reviewText: string,
  authorName: string,
  datePublished: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Product',
      name: productName
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: rating.toString(),
      bestRating: '5',
      worstRating: '1'
    },
    reviewBody: reviewText,
    author: {
      '@type': 'Person',
      name: authorName
    },
    datePublished
  };
}

/**
 * Componente React per inserire structured data nella pagina
 */
export function StructuredData({ data }: { data: object }) {
  return (
    <Script
      id={`structured-data-${Math.random()}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
