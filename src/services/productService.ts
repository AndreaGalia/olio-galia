import { connectToDatabase } from '@/lib/mongodb';
import { Product, Category, ProductDocument, CategoryDocument, SupportedLocale } from '@/types/products';

export class ProductService {
  
  static async getProducts(locale: SupportedLocale = 'it', category?: string): Promise<Product[]> {
    try {
      const { db } = await connectToDatabase();
      
      let filter: any = { 'metadata.isActive': true };
      if (category) {
        filter.category = category;
      }
      
      const products = await db
        .collection<ProductDocument>('products')
        .find(filter)
        .sort({ 'metadata.createdAt': -1 })
        .toArray();
      
      return products.map(product => this.localizeProduct(product, locale));
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

      return product ? this.localizeProduct(product, locale) : null;
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
        .sort({ 'metadata.createdAt': 1 })
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
      
      return products.map(product => this.localizeProduct(product, locale));
    } catch (error) {
      throw new Error('Failed to search products');
    }
  }
  
  // Helper per localizzazione
  private static localizeProduct(product: ProductDocument, locale: SupportedLocale): Product {
    const translation = product.translations[locale] || product.translations['it'];
    
    return {
      ...product,
      ...translation,
      slug: product.slug[locale] || product.slug['it'],
      _id: undefined, // Rimuovi _id dalla response
      translations: undefined,
      metadata: undefined
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
