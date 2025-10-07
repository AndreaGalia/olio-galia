import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/services/productService';
import { isValidLocale } from '@/types/products';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const localeParam = searchParams.get('locale') || 'it';
    
    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }
    
    if (!isValidLocale(localeParam)) {
      return NextResponse.json(
        { error: 'Unsupported locale. Use: it, en' },
        { status: 400 }
      );
    }
    
    const products = await ProductService.searchProducts(query, localeParam);
    
    return NextResponse.json({
      products,
      metadata: {
        locale: localeParam,
        query,
        count: products.length,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    
    return NextResponse.json(
      { error: 'Failed to search products' },
      { status: 500 }
    );
  }
}