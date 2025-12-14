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

    const { db } = await connectToDatabase();

    // Verifica se è un prodotto Stripe o locale
    const isStripeProduct = productId.startsWith('prod_');
    let productName = 'Prodotto';

    if (isStripeProduct) {
      // Aggiorna su Stripe
      await stripe.products.update(productId, {
        active: active
      });

      const stripeProduct = await stripe.products.retrieve(productId);
      productName = stripeProduct.name;

      // Aggiorna su MongoDB usando stripeProductId
      await db.collection('products').updateOne(
        { stripeProductId: productId },
        {
          $set: {
            'metadata.isActive': active,
            'metadata.updatedAt': new Date()
          }
        }
      );
    } else {
      // Prodotto locale (senza Stripe) - aggiorna solo MongoDB usando id
      const result = await db.collection('products').findOneAndUpdate(
        { id: productId },
        {
          $set: {
            'metadata.isActive': active,
            'metadata.updatedAt': new Date()
          }
        },
        { returnDocument: 'after' }
      );

      if (result) {
        productName = result.translations?.it?.name || 'Prodotto';
      }
    }

    return NextResponse.json({
      success: true,
      productId,
      active,
      productName
    });

  } catch (error) {
    console.error('Errore toggle active:', error);
    return NextResponse.json(
      { error: 'Errore nel cambio di stato del prodotto' },
      { status: 500 }
    );
  }
}