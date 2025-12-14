import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectToDatabase } from '@/lib/mongodb';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { productId, mongoId, quantity, hasStripe } = await request.json();

    if ((!productId && !mongoId) || quantity === undefined) {
      return NextResponse.json(
        { error: 'Product ID e quantità sono richiesti' },
        { status: 400 }
      );
    }

    const newQuantity = Math.max(0, parseInt(quantity));
    const { db } = await connectToDatabase();

    let productName = '';

    // Se il prodotto ha Stripe IDs, aggiorna anche Stripe
    if (hasStripe && productId) {
      try {
        const stripeProduct = await stripe.products.retrieve(productId);
        await stripe.products.update(productId, {
          metadata: {
            ...stripeProduct.metadata,
            available_quantity: newQuantity.toString(),
            last_updated: new Date().toISOString()
          }
        });
        productName = stripeProduct.name;

        // Aggiorna MongoDB usando stripeProductId
        await db.collection('products').updateOne(
          { stripeProductId: productId },
          {
            $set: {
              stockQuantity: newQuantity,
              inStock: newQuantity > 0,
              'metadata.updatedAt': new Date()
            }
          }
        );
      } catch (stripeError) {
        console.error('Errore Stripe:', stripeError);
        throw new Error('Errore nell\'aggiornamento su Stripe');
      }
    } else {
      // Prodotto senza Stripe - aggiorna solo MongoDB usando mongoId
      if (!mongoId) {
        return NextResponse.json(
          { error: 'MongoDB ID è richiesto per prodotti non-Stripe' },
          { status: 400 }
        );
      }

      const result = await db.collection('products').updateOne(
        { id: mongoId },
        {
          $set: {
            stockQuantity: newQuantity,
            inStock: newQuantity > 0,
            'metadata.updatedAt': new Date()
          }
        }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json(
          { error: 'Prodotto non trovato' },
          { status: 404 }
        );
      }

      // Recupera il nome del prodotto
      const product = await db.collection('products').findOne({ id: mongoId });
      productName = product?.translations?.it?.name || 'Prodotto';
    }

    return NextResponse.json({
      success: true,
      productId: productId || mongoId,
      newQuantity,
      productName
    });

  } catch (error) {
    console.error('Errore aggiornamento stock:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Errore nell\'aggiornamento dello stock' },
      { status: 500 }
    );
  }
}