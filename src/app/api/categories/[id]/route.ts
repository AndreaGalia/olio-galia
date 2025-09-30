import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { CategoryDocument } from '@/types/products';

// GET - Ottieni singola categoria
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: categoryId } = await params;

    const { db } = await connectToDatabase();
    const category = await db
      .collection<CategoryDocument>('categories')
      .findOne({
        id: categoryId,
        'metadata.isActive': true
      });

    if (!category) {
      return NextResponse.json(
        { error: 'Categoria non trovata' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Errore nel caricamento della categoria' },
      { status: 500 }
    );
  }
}

// PUT - Aggiorna categoria
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: categoryId } = await params;
    const data = await request.json();
    const { translations } = data;

    if (!translations?.it?.name || !translations?.en?.name) {
      return NextResponse.json(
        { error: 'Traduzioni (IT/EN) sono obbligatorie' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Verifica che la categoria esista
    const existingCategory = await db
      .collection<CategoryDocument>('categories')
      .findOne({ id: categoryId });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Categoria non trovata' },
        { status: 404 }
      );
    }

    // Aggiorna la categoria
    await db.collection('categories').updateOne(
      { id: categoryId },
      {
        $set: {
          translations,
          'metadata.updatedAt': new Date()
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Categoria aggiornata con successo'
    });

  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento della categoria' },
      { status: 500 }
    );
  }
}

// DELETE - Elimina categoria (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: categoryId } = await params;

    const { db } = await connectToDatabase();

    // Verifica che la categoria esista
    const existingCategory = await db
      .collection<CategoryDocument>('categories')
      .findOne({ id: categoryId });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Categoria non trovata' },
        { status: 404 }
      );
    }

    // Controlla se ci sono prodotti che usano questa categoria
    const productsUsingCategory = await db
      .collection('products')
      .countDocuments({ category: categoryId, 'metadata.isActive': true });

    if (productsUsingCategory > 0) {
      return NextResponse.json(
        { error: `Impossibile eliminare la categoria. È utilizzata da ${productsUsingCategory} prodotto/i.` },
        { status: 400 }
      );
    }

    // Disattiva la categoria (soft delete)
    await db.collection('categories').updateOne(
      { id: categoryId },
      {
        $set: {
          'metadata.isActive': false,
          'metadata.updatedAt': new Date()
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Categoria eliminata con successo'
    });

  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione della categoria' },
      { status: 500 }
    );
  }
}