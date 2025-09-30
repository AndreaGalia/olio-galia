import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectToDatabase } from '@/lib/mongodb';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { productId, active } = await request.json();

    if (!productId || active === undefined) {
      return NextResponse.json(
        { error: 'Product ID e stato attivo sono richiesti' },
        { status: 400 }
      );
    }

    // Aggiorna su Stripe
    await stripe.products.update(productId, {
      active: active
    });

    // Aggiorna su MongoDB
    const { db } = await connectToDatabase();
    await db.collection('products').updateOne(
      { stripeProductId: productId },
      {
        $set: {
          'metadata.isActive': active,
          'metadata.updatedAt': new Date()
        }
      }
    );

    const stripeProduct = await stripe.products.retrieve(productId);
    console.log(`Stato prodotto ${stripeProduct.name}: ${active ? 'Attivo' : 'Inattivo'}`);

    return NextResponse.json({
      success: true,
      productId,
      active,
      productName: stripeProduct.name
    });

  } catch (error) {
    console.error('Error toggling product status:', error);
    return NextResponse.json(
      { error: 'Errore nel cambio di stato del prodotto' },
      { status: 500 }
    );
  }
}