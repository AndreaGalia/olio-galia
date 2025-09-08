import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/services/productService';
import { isValidLocale } from '@/types/products';

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
    
    return NextResponse.json({
      product,
      metadata: {
        locale: localeParam,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error in single product API:', error);
    return NextResponse.json(
      { error: 'Failed to load product' },
      { status: 500 }
    );
  }
}