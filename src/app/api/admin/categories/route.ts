import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { CategoryDocument } from '@/types/products';

// GET - Ottieni tutte le categorie per admin (incluse inattive)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const { db } = await connectToDatabase();

    const filter = includeInactive ? {} : { 'metadata.isActive': true };

    const categories = await db
      .collection<CategoryDocument>('categories')
      .find(filter)
      .sort({ 'metadata.createdAt': 1 })
      .toArray();

    // Restituisci con informazioni aggiuntive per admin
    const categoriesWithStats = await Promise.all(
      categories.map(async (category) => {
        const productCount = await db
          .collection('products')
          .countDocuments({
            category: category.id,
            'metadata.isActive': true
          });

        return {
          ...category,
          productCount
        };
      })
    );

    return NextResponse.json({
      categories: categoriesWithStats,
      metadata: {
        count: categoriesWithStats.length,
        includeInactive,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    
    return NextResponse.json(
      { error: 'Errore nel caricamento delle categorie' },
      { status: 500 }
    );
  }
}

// POST - Crea una nuova categoria
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, translations } = data;

    // Validazione
    if (!id || !translations?.it?.name || !translations?.en?.name) {
      return NextResponse.json(
        { error: 'ID e traduzioni (IT/EN) sono obbligatori' },
        { status: 400 }
      );
    }

    // Genera ID automatico se non fornito o formato corretto
    const categoryId = id.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    if (!categoryId) {
      return NextResponse.json(
        { error: 'ID categoria non valido' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Controlla se esiste già
    const existingCategory = await db
      .collection('categories')
      .findOne({ id: categoryId });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Una categoria con questo ID esiste già' },
        { status: 400 }
      );
    }

    // Crea la categoria
    const categoryDocument: CategoryDocument = {
      id: categoryId,
      translations: {
        it: {
          name: translations.it.name.trim(),
          description: translations.it.description?.trim() || ''
        },
        en: {
          name: translations.en.name.trim(),
          description: translations.en.description?.trim() || ''
        }
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      }
    };

    const { _id, ...categoryToInsert } = categoryDocument;
    await db.collection('categories').insertOne(categoryToInsert);

    return NextResponse.json({
      success: true,
      category: categoryDocument,
      message: 'Categoria creata con successo'
    });

  } catch (error) {
    
    return NextResponse.json(
      { error: 'Errore nella creazione della categoria' },
      { status: 500 }
    );
  }
}