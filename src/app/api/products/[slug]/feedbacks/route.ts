// app/api/products/[slug]/feedbacks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { FeedbackDocument } from '@/types/feedback';
import { ProductService } from '@/services/productService';
import { isValidLocale } from '@/types/products';

/**
 * GET /api/products/[slug]/feedbacks
 * Recupera i feedback pubblici per un prodotto specifico con paginazione e filtri
 * API PUBBLICA - Non richiede autenticazione
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const rating = searchParams.get('rating'); // Filtro per stelle specifiche (1-5) o 'all'
    const localeParam = searchParams.get('locale') || 'it';

    if (!isValidLocale(localeParam)) {
      return NextResponse.json(
        { error: 'Unsupported locale. Use: it, en' },
        { status: 400 }
      );
    }

    // Recupera il prodotto usando lo slug per ottenere il productId
    const product = await ProductService.getProductById(slug, localeParam);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Costruisci array di possibili productId (locale e/o Stripe)
    // I feedback potrebbero essere salvati con uno dei due ID
    const possibleProductIds = [product.id]; // ID locale (local_xxx)
    if (product.stripeProductId) {
      possibleProductIds.push(product.stripeProductId); // ID Stripe (prod_xxx)
    }

    const db = await getDatabase();
    const feedbackCollection = db.collection<FeedbackDocument>('feedbacks');

    // Costruisci il filtro - cerca feedback con uno qualsiasi degli ID
    const filter: any = {
      productId: { $in: possibleProductIds },
    };

    // Filtro per rating (se specificato)
    if (rating && rating !== 'all') {
      const ratingNum = parseInt(rating, 10);
      if (ratingNum >= 1 && ratingNum <= 5) {
        filter.rating = ratingNum;
      }
    }

    // Calcola skip per paginazione
    const skip = (page - 1) * limit;

    // Recupera feedback con paginazione (ordinati dal più recente)
    const [feedbacks, total] = await Promise.all([
      feedbackCollection
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      feedbackCollection.countDocuments(filter),
    ]);

    // Calcola statistiche (media e distribuzione stelle)
    const allFeedbacks = await feedbackCollection.find({ productId: { $in: possibleProductIds } }).toArray();

    const totalRatings = allFeedbacks.length;
    const averageRating = totalRatings > 0
      ? allFeedbacks.reduce((sum, f) => sum + f.rating, 0) / totalRatings
      : 0;

    // Distribuzione stelle (1-5)
    const distribution = {
      1: allFeedbacks.filter(f => f.rating === 1).length,
      2: allFeedbacks.filter(f => f.rating === 2).length,
      3: allFeedbacks.filter(f => f.rating === 3).length,
      4: allFeedbacks.filter(f => f.rating === 4).length,
      5: allFeedbacks.filter(f => f.rating === 5).length,
    };

    const totalPages = Math.ceil(total / limit);

    // Prepara i feedback per il frontend (nascondendo dati sensibili)
    const publicFeedbacks = feedbacks.map((feedback) => ({
      _id: feedback._id,
      productName: feedback.productName,
      rating: feedback.rating,
      comment: feedback.comment,
      customerName: feedback.isAnonymous ? null : feedback.customerName,
      isAnonymous: feedback.isAnonymous || false,
      createdAt: feedback.createdAt,
      // Non inviamo email e orderId per privacy
    }));

    return NextResponse.json({
      success: true,
      feedbacks: publicFeedbacks,
      stats: {
        total: totalRatings,
        averageRating: Math.round(averageRating * 10) / 10, // Arrotonda a 1 decimale
        distribution,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error('[Product Feedbacks API] Errore:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Errore nel recupero dei feedback',
      },
      { status: 500 }
    );
  }
}
