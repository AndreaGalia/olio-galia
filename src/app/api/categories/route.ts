import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/services/productService';
import { isValidLocale, CategoryDocument } from '@/types/products';
import { connectToDatabase } from '@/lib/mongodb';

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
    
    return NextResponse.json(
      { error: 'Failed to load categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      id,
      translations
    } = data;

    // Validazione dei dati richiesti
    if (!id || !translations?.it?.name || !translations?.en?.name) {
      return NextResponse.json(
        { error: 'ID e traduzioni (IT/EN) sono obbligatori' },
        { status: 400 }
      );
    }

    // Controlla se la categoria esiste già
    const { db } = await connectToDatabase();
    const existingCategory = await db
      .collection('categories')
      .findOne({ id });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Una categoria con questo ID esiste già' },
        { status: 400 }
      );
    }

    // Crea il documento categoria
    const categoryDocument: CategoryDocument = {
      id,
      translations,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      }
    };

    // Inserisci nel database
    const { _id, ...categoryToInsert } = categoryDocument;
    await db.collection('categories').insertOne(categoryToInsert);

    return NextResponse.json({
      success: true,
      categoryId: id,
      message: 'Categoria creata con successo'
    });

  } catch (error) {
    
    return NextResponse.json(
      { error: 'Errore nella creazione della categoria' },
      { status: 500 }
    );
  }
}