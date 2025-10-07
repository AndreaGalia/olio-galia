import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { ProductService } from '@/services/productService';
import { isValidLocale } from '@/types/products';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const localeParam = searchParams.get('locale') || 'it';
    
    if (!isValidLocale(localeParam)) {
      return NextResponse.json(
        { error: 'Unsupported locale. Use: it, en' },
        { status: 400 }
      );
    }
    
    const product = await ProductService.getProductById(slug, localeParam);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Recupera dati stock da Stripe se il prodotto ha stripeProductId
    let stockData = {
      inStock: product.inStock,
      stockQuantity: product.stockQuantity
    };

    if (product.stripeProductId) {
      try {
        const stripeProduct = await stripe.products.retrieve(product.stripeProductId);
        const stockQuantity = parseInt(stripeProduct.metadata?.available_quantity || '0');
        const inStock = stockQuantity > 0;
        
        stockData = {
          inStock,
          stockQuantity
        };
      } catch (error) {
        // Mantieni i dati di stock dal database se Stripe fallisce
      }
    }

    // Recupera il documento completo per ottenere tutti gli slug
    const fullProduct = await ProductService.getFullProductDocument(slug, localeParam);

    // Aggiorna il prodotto con i dati di stock da Stripe e tutti gli slug
    const productWithStock = {
      ...product,
      ...stockData,
      allSlugs: fullProduct?.slug // Aggiungi tutti gli slug (it, en)
    };

    return NextResponse.json({
      product: productWithStock,
      metadata: {
        locale: localeParam,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load product' },
      { status: 500 }
    );
  }
}