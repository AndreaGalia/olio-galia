// types/products.ts
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
}

export interface BaseProduct {
  id: string;
  slug: string;
  category: string;
  price: string;
  originalPrice?: string;
  stripeProductId: string;
  stripePriceId: string;
  size: string;
  inStock: boolean;
  stockQuantity: number;
  color: string;
  images: string[];
  nutritionalInfo?: Record<string, string>;
  seoKeywords: string[];
  tags: string[];
}

export interface Product extends BaseProduct {
  // Campi tradotti (si popolano dinamicamente)
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
    lastUpdated: string;
    version: string;
    currency: string;
    vatRate: string;
    freeShippingThreshold: string;
    defaultLanguage: string;
  };
}