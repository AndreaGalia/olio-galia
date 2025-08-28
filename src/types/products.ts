// types/products.ts

export interface NutritionalInfo {
  energy: string;
  fat: string;
  saturatedFat: string;
  carbs: string;
  protein: string;
  salt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  categoryDisplay: string;
  description: string;
  longDescription: string;
  details: string;
  price: string;
  originalPrice: string | null;
  stripeProductId: string;
  stripePriceId: string;
  size: string;
  inStock: boolean;
  stockQuantity: number;
  badge: string;
  color: string;
  images: string[];
  features: string[];
  nutritionalInfo: NutritionalInfo | null;
  bestFor: string;
  origin: string;
  harvest: string;
  processing: string;
  awards: string[];
  seoKeywords: string[];
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface ProductsMetadata {
  lastUpdated: string;
  version: string;
  currency: string;
  vatRate: string;
  freeShippingThreshold: string;
  defaultLanguage: string;
}

export interface ProductsData {
  products: Product[];
  categories: Category[];
  metadata: ProductsMetadata;
}

// Utility types per i prodotti
export type ProductCategory = 'premium' | 'beauty' | 'famiglia';

export type ProductSortBy = 'name' | 'price' | 'newest' | 'popular';

export interface ProductFilterOptions {
  category?: ProductCategory;
  priceRange?: [number, number];
  inStock?: boolean;
  sortBy?: ProductSortBy;
}