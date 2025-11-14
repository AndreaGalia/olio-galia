import { Metadata } from 'next';
import { Product, ProductDocument } from '@/types/products';

const SITE_NAME = 'Olio Galia';
const DEFAULT_LOCALE = 'it';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://oliogalia.it';

interface LocalizedContent {
  it: {
    title: string;
    description: string;
  };
  en: {
    title: string;
    description: string;
  };
}

/**
 * Genera metadata base per il sito
 */
export function generateBaseMetadata(locale: 'it' | 'en' = DEFAULT_LOCALE): Metadata {
  const content: LocalizedContent = {
    it: {
      title: 'Olio Galia - Olio Extra Vergine di Oliva Biologico',
      description: 'Scopri l\'eccellenza dell\'olio extra vergine di oliva biologico Olio Galia. Prodotto artigianale italiano di alta qualità.'
    },
    en: {
      title: 'Olio Galia - Organic Extra Virgin Olive Oil',
      description: 'Discover the excellence of Olio Galia organic extra virgin olive oil. High quality Italian artisanal product.'
    }
  };

  return {
    title: content[locale].title,
    description: content[locale].description,
    keywords: ['olio extra vergine', 'olio biologico', 'olio italiano', 'extra virgin olive oil', 'organic'],
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: '/',
      languages: {
        'it': '/it',
        'en': '/en'
      }
    },
    openGraph: {
      type: 'website',
      locale: locale === 'it' ? 'it_IT' : 'en_US',
      url: BASE_URL,
      title: content[locale].title,
      description: content[locale].description,
      siteName: SITE_NAME,
      images: [
        {
          url: '/images/og-image.jpg',
          width: 1200,
          height: 630,
          alt: SITE_NAME
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: content[locale].title,
      description: content[locale].description,
      images: ['/images/og-image.jpg']
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    },
    verification: {
      // Aggiungi qui i codici di verifica quando disponibili
      // google: 'your-google-verification-code',
      // yandex: 'your-yandex-verification-code',
      // bing: 'your-bing-verification-code'
    }
  };
}

/**
 * Genera metadata per un prodotto specifico
 */
export function generateProductMetadata(
  product: Product | ProductDocument,
  locale: 'it' | 'en' = DEFAULT_LOCALE
): Metadata {
  // Estrai le traduzioni corrette
  const translations = 'translations' in product
    ? product.translations[locale]
    : product as unknown as Product;

  const slug = 'slug' in product
    ? typeof product.slug === 'string' ? product.slug : product.slug[locale]
    : '';

  // Usa metaTitle personalizzato o fallback al nome prodotto
  const title = translations.metaTitle || `${translations.name} - ${SITE_NAME}`;

  // Usa metaDescription personalizzata o fallback alla descrizione
  const description = translations.metaDescription ||
    translations.description ||
    `Scopri ${translations.name}, ${translations.categoryDisplay} di alta qualità.`;

  // Keywords da SEO keywords + focus keyphrase
  const keywords = [
    ...(translations.seoKeywords || []),
    translations.focusKeyphrase,
    translations.name,
    translations.categoryDisplay,
    SITE_NAME
  ].filter(Boolean);

  // URL prodotto
  const productUrl = `${BASE_URL}/${locale}/products/${slug}`;

  // Immagine prodotto (prima immagine disponibile)
  const images = 'images' in product ? product.images : [];
  const primaryImage = images[0] || '/images/placeholder-product.jpg';

  return {
    title,
    description,
    keywords: keywords as string[],
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    alternates: {
      canonical: productUrl,
      languages: {
        'it': `${BASE_URL}/it/products/${'slug' in product && typeof product.slug === 'object' ? product.slug.it : slug}`,
        'en': `${BASE_URL}/en/products/${'slug' in product && typeof product.slug === 'object' ? product.slug.en : slug}`
      }
    },
    openGraph: {
      type: 'website',
      locale: locale === 'it' ? 'it_IT' : 'en_US',
      url: productUrl,
      title,
      description,
      siteName: SITE_NAME,
      images: [
        {
          url: primaryImage,
          width: 800,
          height: 600,
          alt: translations.name
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [primaryImage]
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    }
  };
}

/**
 * Genera metadata per pagine generiche
 */
export function generatePageMetadata(
  title: string,
  description: string,
  path: string,
  locale: 'it' | 'en' = DEFAULT_LOCALE,
  keywords?: string[],
  image?: string
): Metadata {
  const fullTitle = `${title} - ${SITE_NAME}`;
  const pageUrl = `${BASE_URL}${path}`;
  const ogImage = image || '/images/og-image.jpg';

  return {
    title: fullTitle,
    description,
    keywords: keywords || [],
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    alternates: {
      canonical: pageUrl,
      languages: {
        'it': `${BASE_URL}/it${path}`,
        'en': `${BASE_URL}/en${path}`
      }
    },
    openGraph: {
      type: 'website',
      locale: locale === 'it' ? 'it_IT' : 'en_US',
      url: pageUrl,
      title: fullTitle,
      description,
      siteName: SITE_NAME,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage]
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    }
  };
}

/**
 * Genera metadata per bloccare l'indicizzazione (admin pages)
 */
export function generateNoIndexMetadata(title: string = 'Admin'): Metadata {
  return {
    title: `${title} - ${SITE_NAME}`,
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
        'max-video-preview': -1,
        'max-image-preview': 'none',
        'max-snippet': -1
      }
    }
  };
}
