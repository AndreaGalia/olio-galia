import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import Stripe from 'stripe';
import { CustomerService } from '@/services/customerService';
import { TelegramService } from '@/lib/telegram/telegram';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const GET = withAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id: formId } = await params;
    const db = await getDatabase();
    const collection = db.collection('forms');

    // Trova il form
    let form;
    if (formId.match(/^[0-9a-fA-F]{24}$/)) {
      form = await collection.findOne({ _id: new ObjectId(formId) });
    } else {
      form = await collection.findOne({ orderId: formId });
    }

    if (!form) {
      return NextResponse.json(
        { error: 'Preventivo non trovato' },
        { status: 404 }
      );
    }

    // Recupera informazioni sui prodotti da MongoDB e/o Stripe
    const productsInfo = [];
    const productsCollection = db.collection('products');

    if (form.cart && Array.isArray(form.cart)) {
      for (const item of form.cart) {
        try {
          // Prima cerca il prodotto in MongoDB per ID locale
          let mongoProduct = await productsCollection.findOne({ id: item.id });

          // Fallback: se non trovato per ID locale, prova con stripeProductId (per vecchi dati)
          if (!mongoProduct && item.id.startsWith('prod_')) {
            mongoProduct = await productsCollection.findOne({ stripeProductId: item.id });
          }

          // Se il prodotto ha Stripe IDs, recupera anche da Stripe
          if (mongoProduct?.stripeProductId) {
            try {
              const stripeProduct = await stripe.products.retrieve(mongoProduct.stripeProductId);
              const prices = await stripe.prices.list({ product: mongoProduct.stripeProductId });

              productsInfo.push({
                id: item.id,
                name: stripeProduct.name,
                description: stripeProduct.description,
                image: stripeProduct.images?.[0] || mongoProduct.images?.[0] || null,
                quantity: item.quantity,
                price: prices.data[0] ? (prices.data[0].unit_amount || 0) / 100 : mongoProduct.price || 0,
                currency: prices.data[0]?.currency || 'eur',
              });
            } catch (stripeError) {
              // Fallback a dati MongoDB se Stripe fallisce
              productsInfo.push({
                id: item.id,
                name: mongoProduct.translations?.it?.name || mongoProduct.name || 'Prodotto',
                description: mongoProduct.translations?.it?.description || mongoProduct.description || null,
                image: mongoProduct.images?.[0] || null,
                quantity: item.quantity,
                price: mongoProduct.price || 0,
                currency: 'eur',
              });
            }
          } else if (mongoProduct) {
            // Prodotto solo MongoDB (senza Stripe)
            productsInfo.push({
              id: item.id,
              name: mongoProduct.translations?.it?.name || mongoProduct.name || 'Prodotto',
              description: mongoProduct.translations?.it?.description || mongoProduct.description || null,
              image: mongoProduct.images?.[0] || null,
              quantity: item.quantity,
              price: mongoProduct.price || 0,
              currency: 'eur',
            });
          } else {
            // Prodotto non trovato né in MongoDB né in Stripe
            productsInfo.push({
              id: item.id,
              name: `Prodotto ${item.id}`,
              description: null,
              image: null,
              quantity: item.quantity,
              price: 0,
              currency: 'eur',
            });
          }
        } catch (error) {
          console.error('Errore recupero prodotto:', error);
          productsInfo.push({
            id: item.id,
            name: `Prodotto ${item.id}`,
            description: null,
            image: null,
            quantity: item.quantity,
            price: 0,
            currency: 'eur',
          });
        }
      }
    }

    // Calcola totali (indicativi)
    const subtotal = productsInfo.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Recupera il telefono aggiornato dal database clienti
    let customerPhone = form.phone || 'N/D';
    if (form.email) {
      try {
        const customersCollection = db.collection('customers');
        const customer = await customersCollection.findOne({
          email: form.email.toLowerCase()
        });

        // Se troviamo il cliente, usa il telefono aggiornato
        if (customer && customer.phone) {
          customerPhone = customer.phone;
        }
      } catch (error) {
        // Se c'è un errore nel recupero del cliente, usa il telefono del form
        console.warn('[Forms API] Errore recupero cliente:', error);
      }
    }

    const formattedForm = {
      id: form._id.toString(),
      orderId: form.orderId,
      customer: {
        name: `${form.firstName} ${form.lastName}`,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: customerPhone, // ← Usa il telefono aggiornato dal database clienti
      },
      address: {
        street: form.address,
        postalCode: form.postalCode,
        province: form.province,
      },
      cart: form.cart,
      products: productsInfo,
      pricing: {
        subtotal,
        estimatedShipping: 0, // Da calcolare in base alla provincia
        estimatedTotal: subtotal,
      },
      status: form.status || 'pending',
      type: form.type,
      created: form.createdAt?.toISOString() || form.timestamp,
      notes: form.notes || '',
      itemCount: form.cart?.length || 0,
      finalPricing: form.finalPricing || null, // Aggiungi i prezzi finali se presenti
    };

    return NextResponse.json({
      success: true,
      form: formattedForm,
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Errore nel recupero del preventivo' },
      { status: 500 }
    );
  }
});

// Aggiorna lo stato del form
export const PATCH = withAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id: formId } = await params;
    const { status, notes, finalPricing } = await request.json();

    const db = await getDatabase();
    const collection = db.collection('forms');

    // Recupera il form prima dell'aggiornamento per creare/aggiornare il cliente
    let form;
    if (formId.match(/^[0-9a-fA-F]{24}$/)) {
      form = await collection.findOne({ _id: new ObjectId(formId) });
    } else {
      form = await collection.findOne({ orderId: formId });
    }

    if (!form) {
      return NextResponse.json(
        { error: 'Preventivo non trovato' },
        { status: 404 }
      );
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (finalPricing) updateData.finalPricing = finalPricing;

    let result;
    if (formId.match(/^[0-9a-fA-F]{24}$/)) {
      result = await collection.updateOne(
        { _id: new ObjectId(formId) },
        { $set: updateData }
      );
    } else {
      result = await collection.updateOne(
        { orderId: formId },
        { $set: updateData }
      );
    }

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Preventivo non trovato' },
        { status: 404 }
      );
    }

    // Se il preventivo è stato segnato come pagato, crea/aggiorna il cliente e invia notifica
    if (status === 'paid') {
      try {
        // Usa il finalPricing appena passato nella request, altrimenti quello già salvato
        const totalInEuros = finalPricing?.finalTotal || form.finalPricing?.finalTotal || 0;
        const totalInCents = Math.round(totalInEuros * 100);

        // Estrai indirizzo dall'address string (formato: "Via 123, Città")
        const addressParts = (form.address || '').split(',').map((p: string) => p.trim());
        const addressDetails = addressParts.length > 0 ? {
          line1: addressParts[0] || undefined,
          city: addressParts[1] || undefined,
          state: form.province || undefined,
          postal_code: form.postalCode || '', // Usa il CAP salvato nel form
          country: 'IT'
        } : undefined;

        await CustomerService.createOrUpdateFromOrder(
          form.email || '',
          form.firstName || 'Cliente',
          form.lastName || '',
          form.phone || undefined,
          addressDetails,
          form.orderId || formId,
          totalInCents,
          'quote'
        );
      } catch (customerError) {
        // Non bloccare il processo se c'è un errore nel salvare il cliente
      }

      // Invia notifica Telegram per preventivo pagato
      try {
        // Recupera informazioni sui prodotti da MongoDB e/o Stripe per la notifica
        const productsInfo = [];
        const productsCollection = db.collection('products');

        if (form.cart && Array.isArray(form.cart)) {
          for (const item of form.cart) {
            try {
              // Prima cerca il prodotto in MongoDB per ID locale
              let mongoProduct = await productsCollection.findOne({ id: item.id });

              // Fallback: se non trovato per ID locale, prova con stripeProductId (per vecchi dati)
              if (!mongoProduct && item.id.startsWith('prod_')) {
                mongoProduct = await productsCollection.findOne({ stripeProductId: item.id });
              }

              // Se il prodotto ha Stripe IDs, recupera anche da Stripe
              if (mongoProduct?.stripeProductId) {
                try {
                  const stripeProduct = await stripe.products.retrieve(mongoProduct.stripeProductId);
                  const prices = await stripe.prices.list({ product: mongoProduct.stripeProductId });

                  productsInfo.push({
                    id: item.id,
                    name: stripeProduct.name,
                    description: stripeProduct.description,
                    quantity: item.quantity,
                    price: prices.data[0] ? (prices.data[0].unit_amount || 0) / 100 : mongoProduct.price || 0,
                  });
                } catch (stripeError) {
                  // Fallback a dati MongoDB se Stripe fallisce
                  productsInfo.push({
                    id: item.id,
                    name: mongoProduct.translations?.it?.name || mongoProduct.name || 'Prodotto',
                    description: mongoProduct.translations?.it?.description || mongoProduct.description || null,
                    quantity: item.quantity,
                    price: mongoProduct.price || 0,
                  });
                }
              } else if (mongoProduct) {
                // Prodotto solo MongoDB (senza Stripe)
                productsInfo.push({
                  id: item.id,
                  name: mongoProduct.translations?.it?.name || mongoProduct.name || 'Prodotto',
                  description: mongoProduct.translations?.it?.description || mongoProduct.description || null,
                  quantity: item.quantity,
                  price: mongoProduct.price || 0,
                });
              } else {
                // Prodotto non trovato
                productsInfo.push({
                  id: item.id,
                  name: `Prodotto ${item.id}`,
                  quantity: item.quantity,
                  price: 0,
                });
              }
            } catch (error) {
              console.error('Errore recupero prodotto per notifica:', error);
              productsInfo.push({
                id: item.id,
                name: `Prodotto ${item.id}`,
                quantity: item.quantity,
                price: 0,
              });
            }
          }
        }

        // Prepara i dati del form aggiornati con finalPricing
        const formDataWithPricing = {
          ...form,
          finalPricing: finalPricing || form.finalPricing,
        };

        await TelegramService.sendQuotePaidNotification(
          formDataWithPricing,
          productsInfo,
          formId
        );
      } catch (telegramError) {
        // Non bloccare il processo se c'è un errore nell'invio della notifica
        console.error('Errore invio notifica Telegram:', telegramError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Preventivo aggiornato con successo',
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento del preventivo' },
      { status: 500 }
    );
  }
});