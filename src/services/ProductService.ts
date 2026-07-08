import { connectToDatabase } from '@/lib/mongodb';
import { Product, Category, ProductDocument, CategoryDocument, SupportedLocale } from '@/types/products';
import { PromotionCampaignDocument } from '@/types/promotionCampaign';
import {
  getActivePromotionCampaigns,
  resolveCampaignForProduct,
  getDiscountedPriceString,
  toActivePromotion,
} from '@/lib/promotions/getActivePromotions';

export class ProductService {
  
  static async getProducts(locale: SupportedLocale = 'it', category?: string): Promise<Product[]> {
    try {
      const { db } = await connectToDatabase();
      
      let filter: any = { 'metadata.isActive': true };
      if (category) {
        // Supporta sia il nuovo campo categories[] che il vecchio campo category (legacy)
        filter.$or = [
          { categories: { $in: [category] } },
          { category: category }
        ];
      }
      
      const products = await db
        .collection<ProductDocument>('products')
        .find(filter)
        .sort({ displayOrder: 1, 'metadata.createdAt': -1 })
        .toArray();
      
      const campaigns = await this.getCampaignsSafe();
      return products.map(product =>
        this.applyPromotion(this.localizeProduct(product, locale), campaigns, locale)
      );
    } catch (error) {
      throw new Error('Failed to fetch products');
    }
  }

  static async getProductById(id: string, locale: SupportedLocale = 'it'): Promise<Product | null> {
    try {
      const { db } = await connectToDatabase();

      const product = await db
        .collection<ProductDocument>('products')
        .findOne({
          $or: [
            { id: id },
            { [`slug.${locale}`]: id }
          ],
          'metadata.isActive': true
        });

      if (!product) return null;

      const campaigns = await this.getCampaignsSafe();
      return this.applyPromotion(this.localizeProduct(product, locale), campaigns, locale);
    } catch (error) {
      throw new Error('Failed to fetch product');
    }
  }

  static async getFullProductDocument(id: string, locale: SupportedLocale = 'it'): Promise<ProductDocument | null> {
    try {
      const { db } = await connectToDatabase();

      const product = await db
        .collection<ProductDocument>('products')
        .findOne({
          $or: [
            { id: id },
            { [`slug.${locale}`]: id }
          ],
          'metadata.isActive': true
        });

      return product;
    } catch (error) {
      throw new Error('Failed to fetch full product document');
    }
  }
  
  static async getCategories(locale: SupportedLocale = 'it'): Promise<Category[]> {
    try {
      const { db } = await connectToDatabase();
      
      const categories = await db
        .collection<CategoryDocument>('categories')
        .find({ 'metadata.isActive': true })
        .sort({ displayOrder: 1, 'metadata.createdAt': 1 })
        .toArray();

      return categories.map(category => this.localizeCategory(category, locale));
    } catch (error) {
      throw new Error('Failed to fetch categories');
    }
  }
  
  static async searchProducts(query: string, locale: SupportedLocale = 'it'): Promise<Product[]> {
    try {
      const { db } = await connectToDatabase();
      
      const products = await db
        .collection<ProductDocument>('products')
        .find({
          'metadata.isActive': true,
          $or: [
            { [`translations.${locale}.name`]: { $regex: query, $options: 'i' } },
            { [`translations.${locale}.description`]: { $regex: query, $options: 'i' } },
            { [`translations.${locale}.tags`]: { $in: [new RegExp(query, 'i')] } }
          ]
        })
        .toArray();

      const campaigns = await this.getCampaignsSafe();
      return products.map(product =>
        this.applyPromotion(this.localizeProduct(product, locale), campaigns, locale)
      );
    } catch (error) {
      throw new Error('Failed to search products');
    }
  }

  // Carica le campagne attive senza mai far fallire il catalogo:
  // se la lettura promozioni fallisce, il sito mostra i prezzi di listino.
  private static async getCampaignsSafe(): Promise<PromotionCampaignDocument[]> {
    try {
      return await getActivePromotionCampaigns();
    } catch (error) {
      console.error('Failed to fetch promotion campaigns:', error);
      return [];
    }
  }

  // Applica l'eventuale campagna attiva al prodotto localizzato:
  // prezzo scontato su prodotto e su tutte le varianti, prezzo di listino
  // in originalPrice (la campagna vince su un eventuale originalPrice manuale),
  // payload activePromotion per badge e countdown.
  private static applyPromotion(
    product: Product,
    campaigns: PromotionCampaignDocument[],
    locale: SupportedLocale
  ): Product {
    if (campaigns.length === 0) return product;

    const basePriceCents = Math.round(parseFloat(product.price) * 100);
    const campaign = resolveCampaignForProduct(
      campaigns,
      product.id,
      Number.isFinite(basePriceCents) ? basePriceCents : 0
    );
    if (!campaign) return product;

    return {
      ...product,
      originalPrice: product.price,
      price: getDiscountedPriceString(product.price, campaign),
      variants: product.variants?.map(variant => ({
        ...variant,
        originalPrice: variant.price,
        price: getDiscountedPriceString(variant.price, campaign),
      })),
      activePromotion: toActivePromotion(campaign, locale),
    };
  }
  
  // Helper per localizzazione
  private static localizeProduct(product: ProductDocument, locale: SupportedLocale): Product {
    const translation = product.translations[locale] || product.translations['it'];

    // Normalizza categories: usa il nuovo campo o ricava dal legacy category
    const normalizedCategories = product.categories?.length
      ? product.categories
      : product.category ? [product.category] : [];

    return {
      ...product,
      ...translation,
      categories: normalizedCategories,
      images: product.images || [], // ✅ Preserva sempre le immagini dal documento prodotto
      media: product.media || undefined, // Media ordinato (immagini + video)
      slug: product.slug[locale] || product.slug['it'],
      _id: undefined, // Rimuovi _id dalla response
      translations: undefined,
      // Preserva varianti e label varianti dal documento MongoDB
      variants: product.variants,
      variantLabel: product.variantLabel,
      displayOrder: product.displayOrder,
      metadata: {
        featured: product.metadata?.featured || false
      }
    } as Product;
  }
  
  private static localizeCategory(category: CategoryDocument, locale: SupportedLocale): Category {
    const translation = category.translations[locale] || category.translations['it'];
    
    return {
      id: category.id,
      ...translation,
      _id: undefined,
      translations: undefined,
      metadata: undefined
    } as Category;
  }
}
