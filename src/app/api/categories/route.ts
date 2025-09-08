import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/services/productService';
import { isValidLocale } from '@/types/products';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const localeParam = searchParams.get('locale') || 'it';
    
    if (!isValidLocale(localeParam)) {
      return NextResponse.json(
        { error: 'Unsupported locale. Use: it, en' },
        { status: 400 }
      );
    }
    
    const categories = await ProductService.getCategories(localeParam);
    
    return NextResponse.json({
      categories,
      metadata: {
        locale: localeParam,
        count: categories.length,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error in categories API:', error);
    return NextResponse.json(
      { error: 'Failed to load categories' },
      { status: 500 }
    );
  }
}