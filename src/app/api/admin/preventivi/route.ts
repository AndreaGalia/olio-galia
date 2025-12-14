import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

interface FormSummary {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  created: string;
  itemCount: number;
  finalTotal?: number;
  hasFeedback?: boolean;
}

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const feedbackFilter = searchParams.get('feedbackFilter') || 'all';

    const skip = (page - 1) * limit;

    // Costruisci il filtro
    let filter: any = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    // Aggiungi ricerca unificata
    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      filter.$or = [
        { orderId: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { 'customer.name': searchRegex },
        { 'customer.email': searchRegex }
      ];
    }

    const db = await getDatabase();
    const collection = db.collection('forms');
    const feedbackCollection = db.collection('feedbacks');

    // Se c'è un filtro feedback, dobbiamo applicarlo PRIMA della paginazione
    if (feedbackFilter && feedbackFilter !== 'all') {
      // Recupera tutti i formIds che hanno feedback
      const feedbackDocs = await feedbackCollection
        .find({ orderType: 'quote' })
        .project({ orderId: 1 })
        .toArray();

      const formIdsWithFeedback = feedbackDocs.map(f => f.orderId);

      if (feedbackFilter === 'with') {
        // Solo preventivi CON feedback
        filter.$and = filter.$and || [];
        filter.$and.push({ _id: { $in: formIdsWithFeedback.map((id: string) => new ObjectId(id)) } });
      } else if (feedbackFilter === 'without') {
        // Solo preventivi SENZA feedback
        filter._id = { $nin: formIdsWithFeedback.map((id: string) => new ObjectId(id)) };
      }
    }

    // Recupera i preventivi con paginazione
    const forms = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await collection.countDocuments(filter);

    // Recupera tutti i form IDs
    const formIds = forms.map(form => form._id.toString());

    // Verifica quali form hanno feedback (query singola per performance)
    const feedbackMap = new Map<string, boolean>();
    const feedbacks = await feedbackCollection
      .find({ orderId: { $in: formIds }, orderType: 'quote' })
      .project({ orderId: 1 })
      .toArray();

    feedbacks.forEach(feedback => {
      feedbackMap.set(feedback.orderId, true);
    });

    // Formatta i risultati
    const productsCollection = db.collection('products');

    const formattedForms: FormSummary[] = await Promise.all(
      forms.map(async (form) => {
        let itemCount = 0;
        let estimatedTotal = 0;

        // Calcola il numero di prodotti e il totale stimato
        if (form.cart && Array.isArray(form.cart)) {
          itemCount = form.cart.length;

          // Recupera i prezzi da MongoDB e/o Stripe
          for (const item of form.cart) {
            try {
              // Prima cerca il prodotto in MongoDB per ID locale
              let mongoProduct = await productsCollection.findOne({ id: item.id });

              // Fallback: se non trovato per ID locale, prova con stripeProductId (per vecchi dati)
              if (!mongoProduct && item.id.startsWith('prod_')) {
                mongoProduct = await productsCollection.findOne({ stripeProductId: item.id });
              }

              let productPrice = 0;

              // Se il prodotto ha Stripe IDs, recupera da Stripe
              if (mongoProduct?.stripeProductId) {
                try {
                  const prices = await stripe.prices.list({ product: mongoProduct.stripeProductId });
                  if (prices.data[0] && prices.data[0].unit_amount) {
                    productPrice = prices.data[0].unit_amount / 100;
                  } else {
                    productPrice = mongoProduct.price || 0;
                  }
                } catch (stripeError) {
                  // Fallback a MongoDB se Stripe fallisce
                  productPrice = mongoProduct.price || 0;
                }
              } else if (mongoProduct) {
                // Prodotto solo MongoDB (senza Stripe)
                productPrice = mongoProduct.price || 0;
              }

              estimatedTotal += productPrice * item.quantity;
            } catch (error) {
              console.error('Errore recupero prezzo prodotto:', error);
              // Continua con gli altri prodotti
            }
          }
        }

        return {
          id: form._id.toString(),
          orderId: form.orderId,
          customerName: `${form.firstName} ${form.lastName}`,
          customerEmail: form.email,
          total: estimatedTotal,
          status: form.status || 'pending',
          created: form.createdAt?.toISOString() || form.timestamp || new Date().toISOString(),
          itemCount,
          finalTotal: form.finalPricing?.finalTotal,
          hasFeedback: feedbackMap.has(form._id.toString()),
        };
      })
    );

    return NextResponse.json({
      success: true,
      forms: formattedForms,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {

    return NextResponse.json(
      { error: 'Errore nel recupero dei preventivi' },
      { status: 500 }
    );
  }
});