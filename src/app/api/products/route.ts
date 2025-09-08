import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { ProductService } from '@/services/productService';
import { isValidLocale } from '@/types/products';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const localeParam = searchParams.get('locale') || 'it';
    const category = searchParams.get('category');
    
    // Valida la lingua
    if (!isValidLocale(localeParam)) {
      return NextResponse.json(
        { error: 'Unsupported locale. Use: it, en' },
        { status: 400 }
      );
    }
    
    // Carica prodotti da MongoDB
    const products = await ProductService.getProducts(localeParam, category || undefined);
    const categories = await ProductService.getCategories(localeParam);
    
    // Recupera dati stock da Stripe
    const stripeProducts = await stripe.products.list({
      active: true,
      limit: 100
    });
    
    // Mappa stock data da Stripe
    const stockMap = new Map();
    stripeProducts.data.forEach(stripeProduct => {
      const stockQuantity = parseInt(stripeProduct.metadata.available_quantity || '0');
      const inStock = stockQuantity > 0;
      
      stockMap.set(stripeProduct.id, {
        inStock,
        stockQuantity
      });
    });
    
    // Aggiorna prodotti con stock Stripe
    const productsWithStock = products.map(product => {
      const stockData = stockMap.get(product.stripeProductId) || {
        inStock: product.inStock,
        stockQuantity: product.stockQuantity
      };
      
      return {
        ...product,
        ...stockData
      };
    });
    
    return NextResponse.json({
      products: productsWithStock,
      categories,
      metadata: {
        locale: localeParam,
        count: productsWithStock.length,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error in products API:', error);
    return NextResponse.json(
      { error: 'Failed to load products' },
      { status: 500 }
    );
  }
}