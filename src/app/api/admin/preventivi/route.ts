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
}

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

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
    
    // Recupera i preventivi con paginazione
    const forms = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await collection.countDocuments(filter);

    // Formatta i risultati
    const formattedForms: FormSummary[] = await Promise.all(
      forms.map(async (form) => {
        let itemCount = 0;
        let estimatedTotal = 0;

        // Calcola il numero di prodotti e il totale stimato
        if (form.cart && Array.isArray(form.cart)) {
          itemCount = form.cart.length;
          
          // Prova a recuperare i prezzi da Stripe per calcolare il totale stimato
          try {
            for (const item of form.cart) {
              const product = await stripe.products.retrieve(item.id);
              const prices = await stripe.prices.list({ product: item.id });
              
              if (prices.data[0] && prices.data[0].unit_amount) {
                estimatedTotal += (prices.data[0].unit_amount / 100) * item.quantity;
              }
            }
          } catch (error) {
            console.error('Errore calcolo totale stimato:', error);
            estimatedTotal = 0;
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
          finalTotal: form.finalPricing?.finalTotal
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
    console.error('Errore recupero preventivi:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dei preventivi' },
      { status: 500 }
    );
  }
});