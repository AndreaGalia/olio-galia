export interface ProductTranslations {
  name: string;
  description: string;
  longDescription: string;
  details: string;
  categoryDisplay: string;
  badge: string;
  features: string[];
  bestFor: string;
  origin: string;
  harvest: string;
  processing: string;
  awards: string[];
  seoKeywords: string[];
  tags: string[];
  customHTML?: string; // HTML personalizzato per layout custom del prodotto
  // SEO Fields
  metaTitle?: string; // Titolo SEO personalizzato (max 60 caratteri consigliati)
  metaDescription?: string; // Meta description (max 160 caratteri consigliati)
  focusKeyphrase?: string; // Parola chiave principale per SEO
}

import { RecurringPriceMap, QuantityPriceMap } from './subscription';

export interface ProductVariantTranslations {
  name: string;
  description?: string;
}

export interface ProductVariant {
  variantId: string;
  translations: {
    it: ProductVariantTranslations;
    en: ProductVariantTranslations;
  };
  stripeProductId: string;
  stripePriceId: string;
  price: string;
  originalPrice?: string;
  inStock: boolean;
  stockQuantity: number;
  images: string[];
  color?: string;
}

export interface BaseProduct {
  id: string;
  category: string;
  price: string;
  originalPrice?: string;
  stripeProductId?: string; // Opzionale - può essere vuoto se non configurato con Stripe
  stripePriceId?: string;   // Opzionale - può essere vuoto se non configurato con Stripe
  size: string;
  weight?: number; // Peso in grammi (opzionale) - usato per calcolo spedizione
  inStock: boolean;
  stockQuantity: number;
  color: string;
  images: string[];
  nutritionalInfo?: Record<string, string>;
  customBadge?: string; // Badge personalizzato opzionale (es: "NOVITÀ", "BIO", "LIMITED")
  isSubscribable?: boolean; // Abilita abbonamento ricorrente
  stripeRecurringPriceIds?: RecurringPriceMap; // Price ID ricorrenti per zona × intervallo (legacy)
  subscriptionPrices?: QuantityPriceMap; // Prezzi abbonamento per quantità × zona × intervallo (nuovo)
  variants?: ProductVariant[]; // Varianti del prodotto (es: fragranze diverse)
  variantLabel?: { it: string; en: string }; // Label per il selettore varianti (es: "Fragranza")
}

// Prodotto come salvato in MongoDB (con tutte le traduzioni)
export interface ProductDocument extends BaseProduct {
  _id?: string;
  slug: {
    it: string;
    en: string;
  };
  translations: {
    it: ProductTranslations;
    en: ProductTranslations;
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    featured: boolean; // Mostra in homepage
  };
}

// Prodotto come restituito dalle API (localizzato)
export interface Product extends BaseProduct, ProductTranslations {
  slug: string; // Slug localizzato per la lingua corrente
  metadata?: {
    createdAt?: Date;
    updatedAt?: Date;
    isActive?: boolean;
    featured?: boolean;
  };
}

export interface CategoryTranslations {
  name: string;
  description: string;
}

export interface CategoryDocument {
  _id?: string;
  id: string;
  translations: {
    it: CategoryTranslations;
    en: CategoryTranslations;
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
  };
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface ProductsData {
  products: Product[];
  categories: Category[];
  metadata: {
    locale: string;
    count: number;
    timestamp: string;
  };
}

export type SupportedLocale = 'it' | 'en';

export function isValidLocale(locale: string): locale is SupportedLocale {
  return ['it', 'en'].includes(locale);
}