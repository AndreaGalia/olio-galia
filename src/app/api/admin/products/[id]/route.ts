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

    // Ottieni dati da Stripe
    const [stripeProduct, stripePrice] = await Promise.all([
      stripe.products.retrieve(mongoProduct.stripeProductId),
      stripe.prices.retrieve(mongoProduct.stripePriceId)
    ]);

    const productWithStripeData = {
      ...mongoProduct,
      stripeData: {
        name: stripeProduct.name,
        price: stripePrice.unit_amount ? stripePrice.unit_amount / 100 : 0,
        available_quantity: parseInt(stripeProduct.metadata?.available_quantity || '0'),
        active: stripeProduct.active
      }
    };

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
      slug
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

    // Aggiorna prodotto su Stripe se necessario
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

      await stripe.products.update(existingProduct.stripeProductId, {
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
        product: existingProduct.stripeProductId,
        unit_amount: Math.round(parseFloat(price) * 100),
        currency: 'eur'
      });

      // Aggiorna il prodotto Stripe per impostare il nuovo prezzo come default
      await stripe.products.update(existingProduct.stripeProductId, {
        default_price: newPrice.id
      });

      // Ora possiamo disattivare il prezzo vecchio
      try {
        await stripe.prices.update(existingProduct.stripePriceId, {
          active: false
        });
      } catch (priceError) {
        // Se non riusciamo a disattivare il prezzo vecchio, non è un errore critico
      }

      // Aggiorna il prodotto su MongoDB con il nuovo price ID
      await db.collection('products').updateOne(
        { id: productId },
        {
          $set: {
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
      // Aggiorna solo MongoDB
      await db.collection('products').updateOne(
        { id: productId },
        {
          $set: {
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

    // Disattiva prodotto su Stripe (non può essere eliminato se ha transazioni)
    await stripe.products.update(existingProduct.stripeProductId, {
      active: false
    });

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

    return NextResponse.json({
      success: true,
      message: 'Prodotto eliminato con successo da MongoDB e disattivato su Stripe'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione del prodotto' },
      { status: 500 }
    );
  }
}