import { NextResponse } from 'next/server';

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
    
    // Combina i dati
    const translatedProducts = baseData.products.map((baseProduct: any) => {
      const translation = translations.products.find((t: any) => t.id === baseProduct.id);
      return {
        ...baseProduct,
        ...translation
      };
    });
    
    return NextResponse.json({
      ...baseData,
      products: translatedProducts,
      categories: translations.categories
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load products' },
      { status: 500 }
    );
  }
}