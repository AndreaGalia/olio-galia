import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectToDatabase } from '@/lib/mongodb';
import { ProductDocument } from '@/types/products';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(request: NextRequest) {
  try {
    // Ottieni prodotti da MongoDB
    const { db } = await connectToDatabase();
    const mongoProducts = await db
      .collection<ProductDocument>('products')
      .find({})
      .sort({ 'metadata.createdAt': -1 })
      .toArray();

    // Ottieni prodotti e prezzi da Stripe
    const [stripeProducts, stripePrices] = await Promise.all([
      stripe.products.list({ limit: 100, active: true }),
      stripe.prices.list({ limit: 100, active: true })
    ]);

    // Crea una mappa dei prezzi per prodotto
    const priceMap = stripePrices.data.reduce((acc, price) => {
      if (typeof price.product === 'string') {
        acc[price.product] = price;
      }
      return acc;
    }, {} as Record<string, Stripe.Price>);

    // Combina i dati MongoDB con quelli di Stripe
    const productsWithStripeData = mongoProducts.map(product => {
      const stripeProduct = stripeProducts.data.find(sp => sp.id === product.stripeProductId);
      const stripePrice = priceMap[product.stripeProductId];

      return {
        ...product,
        stripeData: stripeProduct ? {
          name: stripeProduct.name,
          price: stripePrice?.unit_amount ? stripePrice.unit_amount / 100 : 0,
          available_quantity: parseInt(stripeProduct.metadata?.available_quantity || '0'),
          active: stripeProduct.active
        } : undefined
      };
    });

    return NextResponse.json(productsWithStripeData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Errore nel caricamento dei prodotti' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      category,
      price,
      originalPrice,
      size,
      color,
      images,
      nutritionalInfo,
      translations,
      slug
    } = data;

    // Validazione dei dati richiesti
    if (!category || !price || !size || !translations?.it?.name || !translations?.en?.name) {
      return NextResponse.json(
        { error: 'Dati mancanti per la creazione del prodotto' },
        { status: 400 }
      );
    }

    // 1. Crea prodotto su Stripe
    // Filtra le immagini vuote e valida gli URL
    const validImages = (images || [])
      .filter((img: string) => img && img.trim() !== '')
      .filter((img: string) => {
        try {
          new URL(img);
          return true;
        } catch {
          return false;
        }
      });

    const stripeProduct = await stripe.products.create({
      name: translations.it.name,
      description: translations.it.description,
      images: validImages,
      metadata: {
        category,
        size,
        color: color || '',
        available_quantity: '0', // Inizia con stock 0
        mongo_category: category
      }
    });

    // 2. Crea prezzo su Stripe
    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: Math.round(parseFloat(price) * 100), // Converti in centesimi
      currency: 'eur'
    });

    // 3. Imposta il prezzo come default per il prodotto
    await stripe.products.update(stripeProduct.id, {
      default_price: stripePrice.id
    });

    // 4. Salva su MongoDB
    const { db } = await connectToDatabase();

    const productDocument: ProductDocument = {
      id: stripeProduct.id, // Usa l'ID di Stripe come ID MongoDB
      category,
      price: price.toString(),
      originalPrice: originalPrice ? originalPrice.toString() : undefined,
      stripeProductId: stripeProduct.id,
      stripePriceId: stripePrice.id,
      size,
      inStock: false, // Inizialmente non in stock
      stockQuantity: 0,
      color: color || '',
      images: images || [],
      nutritionalInfo: nutritionalInfo || {},
      slug,
      translations,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      }
    };

    const { _id, ...productToInsert } = productDocument;
    await db.collection('products').insertOne(productToInsert);

    return NextResponse.json({
      success: true,
      productId: stripeProduct.id,
      stripeProductId: stripeProduct.id,
      stripePriceId: stripePrice.id
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Errore nella creazione del prodotto' },
      { status: 500 }
    );
  }
}