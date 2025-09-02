import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function GET(request: Request) {
  try {
    // Estrai locale dalla query string o usa italiano come default
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'it';
    
    // Carica dati base
    const baseResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/products/base`);
    const baseData = await baseResponse.json();
    
    // Carica traduzioni
    const translationsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/products/translations/${locale}`);
    const translations = await translationsResponse.json();
    
    // Recupera i dati di stock da Stripe per tutti i prodotti
    const stripeProducts = await stripe.products.list({
      active: true,
      limit: 100 // Aumenta se hai più di 100 prodotti
    });
    
    // Crea una mappa dei dati di stock da Stripe
    const stockMap = new Map();
    stripeProducts.data.forEach(stripeProduct => {
      const stockQuantity = parseInt(stripeProduct.metadata.available_quantity || '0');
      const inStock = stockQuantity > 0;
      
      stockMap.set(stripeProduct.id, {
        inStock,
        stockQuantity
      });
    });
    
    // Combina i dati
    const translatedProducts = baseData.products.map((baseProduct: any) => {
      const translation = translations.products.find((t: any) => t.id === baseProduct.id);
      const stockData = stockMap.get(baseProduct.stripeProductId) || {
        inStock: false,
        stockQuantity: 0
      };
      
      return {
        ...baseProduct,
        ...translation,
        ...stockData // Sovrascrivi i dati di stock con quelli di Stripe
      };
    });
    
    return NextResponse.json({
      ...baseData,
      products: translatedProducts,
      categories: translations.categories
    });
  } catch (error) {
    console.error('Error loading products with stock data:', error);
    return NextResponse.json(
      { error: 'Failed to load products' },
      { status: 500 }
    );
  }
}