import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectToDatabase } from '@/lib/mongodb';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { productId, quantity } = await request.json();

    if (!productId || quantity === undefined) {
      return NextResponse.json(
        { error: 'Product ID e quantità sono richiesti' },
        { status: 400 }
      );
    }

    const newQuantity = Math.max(0, parseInt(quantity));

    // Aggiorna su Stripe
    const stripeProduct = await stripe.products.retrieve(productId);
    await stripe.products.update(productId, {
      metadata: {
        ...stripeProduct.metadata,
        available_quantity: newQuantity.toString(),
        last_updated: new Date().toISOString()
      }
    });

    // Aggiorna cache su MongoDB
    const { db } = await connectToDatabase();
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

    

    return NextResponse.json({
      success: true,
      productId,
      newQuantity,
      productName: stripeProduct.name
    });

  } catch (error) {
    
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento dello stock' },
      { status: 500 }
    );
  }
}