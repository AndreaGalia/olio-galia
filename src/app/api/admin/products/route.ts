import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectToDatabase } from '@/lib/mongodb';
import { ProductDocument } from '@/types/products';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Valida e arricchisce subscriptionPrices con amount da Stripe
// Accetta sia stringhe "price_xxx" che oggetti { priceId: "price_xxx", amount: ... }
async function validateAndEnrichSubscriptionPrices(
  rawPrices: Record<string, Record<string, Record<string, unknown>>>
): Promise<Record<string, Record<string, Record<string, { priceId: string; amount: number }>>>> {
  const enriched: Record<string, Record<string, Record<string, { priceId: string; amount: number }>>> = {};

  for (const [qty, zones] of Object.entries(rawPrices)) {
    if (!zones || typeof zones !== 'object') continue;
    enriched[qty] = {};
    for (const [zone, intervals] of Object.entries(zones)) {
      if (!intervals || typeof intervals !== 'object') continue;
      enriched[qty][zone] = {};
      for (const [interval, entry] of Object.entries(intervals)) {
        // Estrai il priceId sia da stringa che da oggetto
        let id: string | undefined;
        if (typeof entry === 'string' && entry.trim()) {
          id = entry.trim();
        } else if (entry && typeof entry === 'object' && 'priceId' in entry && typeof (entry as any).priceId === 'string') {
          id = (entry as any).priceId.trim();
        }
        if (!id) continue;

        if (!id.startsWith('price_')) {
          throw new Error(`Price ID non valido per qty=${qty}, ${zone}/${interval}: "${id}" (deve iniziare con "price_")`);
        }
        const stripePrice = await stripe.prices.retrieve(id);
        if (!stripePrice.unit_amount) {
          throw new Error(`Prezzo non trovato su Stripe per ${id}`);
        }
        enriched[qty][zone][interval] = {
          priceId: id,
          amount: stripePrice.unit_amount / 100,
        };
      }
    }
  }

  return enriched;
}

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
      // Verifica se il prodotto ha ID Stripe prima di cercare i dati
      if (!product.stripeProductId) {
        return { ...product, stripeData: undefined };
      }

      const stripeProduct = stripeProducts.data.find(sp => sp.id === product.stripeProductId);
      const stripePrice = product.stripeProductId ? priceMap[product.stripeProductId] : undefined;

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
      weight,
      color,
      images,
      nutritionalInfo,
      translations,
      slug,
      isStripeProduct,
      stripeProductId,
      stripePriceId,
      featured,
      isSubscribable,
      stripeRecurringPriceIds,
      subscriptionPrices: rawSubscriptionPrices
    } = data;

    // Validazione dei dati richiesti
    if (!category || !price || !size || !translations?.it?.name || !translations?.en?.name) {
      return NextResponse.json(
        { error: 'Dati mancanti per la creazione del prodotto' },
        { status: 400 }
      );
    }

    // IMPORTANTE: L'ID locale è sempre permanente e non cambia mai
    // Questo permette ai preventivi/ordini di mantenere il riferimento corretto
    const localId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    let finalStripeProductId: string | undefined;
    let finalStripePriceId: string | undefined;

    // CASO 1: Prodotto con Stripe (collegamento manuale agli ID esistenti)
    if (isStripeProduct && stripeProductId && stripePriceId) {
      // Validazione ID Stripe
      if (!stripeProductId.startsWith('prod_')) {
        return NextResponse.json(
          { error: 'Stripe Product ID non valido (deve iniziare con "prod_")' },
          { status: 400 }
        );
      }
      if (!stripePriceId.startsWith('price_')) {
        return NextResponse.json(
          { error: 'Stripe Price ID non valido (deve iniziare con "price_")' },
          { status: 400 }
        );
      }

      // Verifica che il prodotto esista su Stripe
      try {
        await stripe.products.retrieve(stripeProductId);
        await stripe.prices.retrieve(stripePriceId);
      } catch (err) {
        return NextResponse.json(
          { error: 'ID Stripe non trovati. Verifica di aver inserito gli ID corretti dalla dashboard Stripe.' },
          { status: 400 }
        );
      }

      finalStripeProductId = stripeProductId;
      finalStripePriceId = stripePriceId;
    }
    // CASO 2: Prodotto senza Stripe (solo MongoDB)
    else {
      finalStripeProductId = undefined;
      finalStripePriceId = undefined;
    }

    // Valida e arricchisci subscriptionPrices se presente
    let validatedSubscriptionPrices: Record<string, Record<string, Record<string, { priceId: string; amount: number }>>> | undefined;
    if (isSubscribable && rawSubscriptionPrices) {
      try {
        validatedSubscriptionPrices = await validateAndEnrichSubscriptionPrices(rawSubscriptionPrices);
      } catch (err) {
        return NextResponse.json(
          { error: err instanceof Error ? err.message : 'Errore validazione prezzi abbonamento' },
          { status: 400 }
        );
      }
    }

    // Salva su MongoDB
    const { db } = await connectToDatabase();

    const productDocument: ProductDocument = {
      id: localId, // SEMPRE l'ID locale, mai sovrascritto
      category,
      price: price.toString(),
      originalPrice: originalPrice ? originalPrice.toString() : undefined,
      stripeProductId: finalStripeProductId, // ID Stripe separato (opzionale)
      stripePriceId: finalStripePriceId, // Price ID Stripe separato (opzionale)
      size,
      weight: weight || 0, // Peso in grammi (default 0 se non specificato)
      inStock: false, // Inizialmente non in stock
      stockQuantity: 0,
      color: color || '',
      images: images || [],
      nutritionalInfo: nutritionalInfo || {},
      isSubscribable: isSubscribable || false,
      stripeRecurringPriceIds: stripeRecurringPriceIds || undefined,
      subscriptionPrices: validatedSubscriptionPrices || undefined,
      slug,
      translations,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        featured: featured || false
      }
    };

    const { _id, ...productToInsert } = productDocument;
    const result = await db.collection('products').insertOne(productToInsert);

    return NextResponse.json({
      success: true,
      productId: localId, // Ritorna l'ID locale permanente
      mongoObjectId: result.insertedId.toString(), // Ritorna anche MongoDB _id
      stripeProductId: finalStripeProductId,
      stripePriceId: finalStripePriceId,
      isStripeProduct: !!finalStripeProductId
    });

  } catch (error) {
    console.error('Errore creazione prodotto:', error);
    return NextResponse.json(
      { error: 'Errore nella creazione del prodotto' },
      { status: 500 }
    );
  }
}