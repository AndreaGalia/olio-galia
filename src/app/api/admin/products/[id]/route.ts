import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectToDatabase } from '@/lib/mongodb';
import { ProductDocument } from '@/types/products';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// GET - Ottieni singolo prodotto
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    // Ottieni prodotto da MongoDB
    const { db } = await connectToDatabase();
    const mongoProduct = await db
      .collection<ProductDocument>('products')
      .findOne({ id: productId });

    if (!mongoProduct) {
      return NextResponse.json(
        { error: 'Prodotto non trovato' },
        { status: 404 }
      );
    }

    // Ottieni dati da Stripe solo se il prodotto ha gli ID Stripe
    let productWithStripeData: any = { ...mongoProduct };

    if (mongoProduct.stripeProductId && mongoProduct.stripePriceId) {
      const [stripeProduct, stripePrice] = await Promise.all([
        stripe.products.retrieve(mongoProduct.stripeProductId),
        stripe.prices.retrieve(mongoProduct.stripePriceId)
      ]);

      productWithStripeData.stripeData = {
        name: stripeProduct.name,
        price: stripePrice.unit_amount ? stripePrice.unit_amount / 100 : 0,
        available_quantity: parseInt(stripeProduct.metadata?.available_quantity || '0'),
        active: stripeProduct.active
      };
    }

    return NextResponse.json(productWithStripeData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Errore nel caricamento del prodotto' },
      { status: 500 }
    );
  }
}

// PUT - Aggiorna prodotto
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
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
      slug,
      stripeProductId: newStripeProductId,
      stripePriceId: newStripePriceId
    } = data;

    // Ottieni prodotto esistente da MongoDB
    const { db } = await connectToDatabase();
    const existingProduct = await db
      .collection<ProductDocument>('products')
      .findOne({ id: productId });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Prodotto non trovato' },
        { status: 404 }
      );
    }

    // Determina gli ID Stripe da usare (nuovi se forniti, altrimenti esistenti)
    const finalStripeProductId = newStripeProductId !== undefined ? newStripeProductId : existingProduct.stripeProductId;
    const finalStripePriceId = newStripePriceId !== undefined ? newStripePriceId : existingProduct.stripePriceId;

    // Validazione ID Stripe se forniti
    if (finalStripeProductId && !finalStripeProductId.startsWith('prod_')) {
      return NextResponse.json(
        { error: 'Stripe Product ID non valido (deve iniziare con "prod_")' },
        { status: 400 }
      );
    }
    if (finalStripePriceId && !finalStripePriceId.startsWith('price_')) {
      return NextResponse.json(
        { error: 'Stripe Price ID non valido (deve iniziare con "price_")' },
        { status: 400 }
      );
    }

    // Verifica se gli ID Stripe esistono su Stripe (se forniti)
    if (finalStripeProductId && finalStripePriceId) {
      try {
        await stripe.products.retrieve(finalStripeProductId);
        await stripe.prices.retrieve(finalStripePriceId);
      } catch (err) {
        return NextResponse.json(
          { error: 'ID Stripe non trovati. Verifica di aver inserito gli ID corretti dalla dashboard Stripe.' },
          { status: 400 }
        );
      }
    }

    // Aggiorna prodotto su Stripe SOLO se aveva già Stripe IDs prima
    // Se stiamo AGGIUNGENDO Stripe IDs per la prima volta, NON aggiorniamo Stripe
    const isAddingStripeForFirstTime = !existingProduct.stripeProductId && finalStripeProductId;

    if (finalStripeProductId && finalStripePriceId && !isAddingStripeForFirstTime) {
      if (translations.it.name || translations.it.description || images) {
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

        await stripe.products.update(finalStripeProductId, {
          name: translations.it.name,
          description: translations.it.description,
          images: validImages,
          metadata: {
            category,
            size,
            color: color || '',
            mongo_category: category,
            last_updated: new Date().toISOString()
          }
        });
      }

      // Aggiorna prezzo su Stripe se cambiato
      if (price && parseFloat(price) !== parseFloat(existingProduct.price)) {
        // Crea nuovo prezzo
        const newPrice = await stripe.prices.create({
          product: finalStripeProductId,
          unit_amount: Math.round(parseFloat(price) * 100),
          currency: 'eur'
        });

        // Aggiorna il prodotto Stripe per impostare il nuovo prezzo come default
        await stripe.products.update(finalStripeProductId, {
          default_price: newPrice.id
        });

        // Ora possiamo disattivare il prezzo vecchio (se esiste)
        try {
          if (finalStripePriceId) {
            await stripe.prices.update(finalStripePriceId, {
              active: false
            });
          }
        } catch (priceError) {
          // Se non riusciamo a disattivare il prezzo vecchio, non è un errore critico
        }

        // Aggiorna il prodotto su MongoDB con il nuovo price ID e gli ID Stripe
        // IMPORTANTE: NON aggiorniamo il campo 'id' per mantenere l'ID locale permanente
        await db.collection('products').updateOne(
          { id: productId },
          {
            $set: {
              // id: NON aggiornato - rimane quello locale originale
              stripeProductId: finalStripeProductId,
              stripePriceId: newPrice.id,
              category,
              price: price.toString(),
              originalPrice,
              size,
              color: color || '',
              images: images || [],
              nutritionalInfo: nutritionalInfo || {},
              translations,
              slug,
              'metadata.updatedAt': new Date()
            }
          }
        );
      } else {
        // Aggiorna MongoDB con gli ID Stripe (potrebbero essere cambiati)
        // IMPORTANTE: NON aggiorniamo il campo 'id' per mantenere l'ID locale permanente
        await db.collection('products').updateOne(
          { id: productId },
          {
            $set: {
              // id: NON aggiornato - rimane quello locale originale
              stripeProductId: finalStripeProductId,
              stripePriceId: finalStripePriceId,
              category,
              price: price?.toString() || existingProduct.price,
              originalPrice,
              size,
              color: color || '',
              images: images || [],
              nutritionalInfo: nutritionalInfo || {},
              translations,
              slug,
              'metadata.updatedAt': new Date()
            }
          }
        );
      }
    } else if (isAddingStripeForFirstTime) {
      // CASO SPECIALE: Stiamo AGGIUNGENDO Stripe IDs per la prima volta
      // Non aggiorniamo Stripe, solo salviamo gli ID in MongoDB
      await db.collection('products').updateOne(
        { id: productId },
        {
          $set: {
            // id: NON aggiornato - rimane quello locale originale
            stripeProductId: finalStripeProductId,
            stripePriceId: finalStripePriceId,
            category,
            price: price?.toString() || existingProduct.price,
            originalPrice,
            size,
            color: color || '',
            images: images || [],
            nutritionalInfo: nutritionalInfo || {},
            translations,
            slug,
            'metadata.updatedAt': new Date()
          }
        }
      );
    } else {
      // Prodotto senza Stripe - aggiorna solo MongoDB (rimuovi ID Stripe se erano presenti)
      // IMPORTANTE: NON aggiorniamo il campo 'id' per mantenere l'ID locale permanente
      await db.collection('products').updateOne(
        { id: productId },
        {
          $set: {
            // id: NON aggiornato - rimane quello locale originale
            stripeProductId: undefined,
            stripePriceId: undefined,
            category,
            price: price?.toString() || existingProduct.price,
            originalPrice,
            size,
            color: color || '',
            images: images || [],
            nutritionalInfo: nutritionalInfo || {},
            translations,
            slug,
            'metadata.updatedAt': new Date()
          }
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Prodotto aggiornato con successo'
    });

  } catch (error) {
    // Gestione errori specifici di Stripe
    if (error instanceof Error) {
      if (error.message.includes('Not a valid URL')) {
        return NextResponse.json(
          { error: 'Una o più immagini hanno URL non validi. Verifica che tutti gli URL delle immagini siano corretti.' },
          { status: 400 }
        );
      }
      if (error.message.includes('default price') || error.message.includes('cannot be archived')) {
        return NextResponse.json(
          { error: 'Errore nell\'aggiornamento del prezzo di default. Il sistema ha tentato di gestire automaticamente l\'aggiornamento.' },
          { status: 400 }
        );
      }
      if (error.message.includes('price')) {
        return NextResponse.json(
          { error: 'Errore nell\'aggiornamento del prezzo. Verifica che il prezzo sia un numero valido.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento del prodotto. Verifica i dati inseriti.' },
      { status: 500 }
    );
  }
}

// DELETE - Elimina prodotto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    // Ottieni prodotto da MongoDB
    const { db } = await connectToDatabase();
    const existingProduct = await db
      .collection<ProductDocument>('products')
      .findOne({ id: productId });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Prodotto non trovato' },
        { status: 404 }
      );
    }

    // Disattiva prodotto su Stripe se è un prodotto Stripe (non può essere eliminato se ha transazioni)
    if (existingProduct.stripeProductId) {
      await stripe.products.update(existingProduct.stripeProductId, {
        active: false
      });
    }

    // Elimina definitivamente da MongoDB
    const deleteResult = await db.collection('products').deleteOne(
      { id: productId }
    );

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Prodotto non trovato in MongoDB' },
        { status: 404 }
      );
    }

    const message = existingProduct.stripeProductId
      ? 'Prodotto eliminato con successo da MongoDB e disattivato su Stripe'
      : 'Prodotto eliminato con successo da MongoDB';

    return NextResponse.json({
      success: true,
      message
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione del prodotto' },
      { status: 500 }
    );
  }
}