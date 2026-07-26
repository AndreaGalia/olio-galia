// app/api/admin/feedbacks/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { getDatabase } from '@/lib/mongodb';
import { FeedbackDocument } from '@/types/feedback';
import { ProductService } from '@/services/ProductService';
import { GeneratedReview } from '@/lib/fakeReviews/generator';

// orderId placeholder per le recensioni generate dall'admin (non legate a un ordine reale)
const ADMIN_GENERATED_ORDER_ID = 'admin-generated';
const MAX_REVIEWS_PER_REQUEST = 500;

/**
 * GET /api/admin/feedbacks/generate
 * Lista dei prodotti attivi del catalogo (stessa fonte della pagina pubblica /products)
 * da usare nel picker della pagina di generazione recensioni.
 */
export const GET = withAuth(async (_request: NextRequest) => {
  try {
    const products = await ProductService.getProducts('it');

    return NextResponse.json({
      success: true,
      products: products.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        categories: product.categories || [],
      })),
    });
  } catch (error) {
    console.error('[Admin Feedbacks Generate] Errore recupero prodotti:', error);
    return NextResponse.json(
      { success: false, error: 'Errore nel recupero dei prodotti' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/admin/feedbacks/generate
 * Salva un batch di recensioni generate dall'admin.
 * Body: { reviews: GeneratedReview[] }
 */
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const reviews: GeneratedReview[] = body?.reviews;

    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nessuna recensione da salvare' },
        { status: 400 }
      );
    }

    if (reviews.length > MAX_REVIEWS_PER_REQUEST) {
      return NextResponse.json(
        { success: false, error: `Massimo ${MAX_REVIEWS_PER_REQUEST} recensioni per richiesta` },
        { status: 400 }
      );
    }

    // Valida ogni recensione (stesse regole del feedback cliente)
    const errors: string[] = [];
    const documents: FeedbackDocument[] = [];
    const now = Date.now();

    reviews.forEach((review, i) => {
      const label = `Recensione ${i + 1}`;

      if (!review.productId || !review.productName?.trim()) {
        errors.push(`${label}: prodotto mancante`);
        return;
      }
      if (!review.rating || !Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5) {
        errors.push(`${label} (${review.productName}): rating deve essere 1-5`);
        return;
      }
      if (!review.comment?.trim()) {
        errors.push(`${label} (${review.productName}): commento mancante`);
        return;
      }
      if (review.comment.length > 500) {
        errors.push(`${label} (${review.productName}): commento troppo lungo (max 500 caratteri)`);
        return;
      }
      if (!review.customerName?.trim()) {
        errors.push(`${label} (${review.productName}): nome cliente mancante`);
        return;
      }

      const createdAt = review.createdAt ? new Date(review.createdAt) : new Date();
      if (isNaN(createdAt.getTime()) || createdAt.getTime() > now) {
        errors.push(`${label} (${review.productName}): data non valida o futura`);
        return;
      }

      documents.push({
        orderId: ADMIN_GENERATED_ORDER_ID,
        productId: review.productId,
        productName: review.productName.trim(),
        rating: review.rating,
        comment: review.comment.trim(),
        customerEmail: (review.customerEmail || 'noreply@oliogalia.com').toLowerCase().trim(),
        customerName: review.customerName.trim(),
        isAnonymous: review.isAnonymous || false,
        orderType: 'order',
        createdAt,
        source: 'admin',
      });
    });

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: `Errori di validazione:\n${errors.join('\n')}` },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const result = await db.collection<FeedbackDocument>('feedbacks').insertMany(documents);

    return NextResponse.json(
      {
        success: true,
        message: `${result.insertedCount} recensioni salvate`,
        count: result.insertedCount,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Admin Feedbacks Generate] Errore salvataggio:', error);
    return NextResponse.json(
      { success: false, error: 'Errore interno del server' },
      { status: 500 }
    );
  }
});
