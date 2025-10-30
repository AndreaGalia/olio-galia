import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { TelegramService } from '@/lib/telegram/telegram';
import { CustomerService } from '@/services/customerService';

interface SelectedProduct {
  productId: string;
  quantity: number;
}

interface FinalPricing {
  finalSubtotal: number;
  finalShipping: number;
  finalTotal: number;
}

interface CustomQuoteData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerProvince: string;
  selectedProducts: SelectedProduct[];
  notes?: string;
  createAsConfirmed?: boolean;
  finalPricing?: FinalPricing;
}

interface ProductInfo {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

/**
 * Recupera i nomi dei prodotti dal database
 */
async function getProductNames(db: any, productIds: string[]): Promise<Record<string, string>> {
  const productsCollection = db.collection('products');
  const dbProducts = await productsCollection.find({ id: { $in: productIds } }).toArray();

  const productNameMap: Record<string, string> = {};
  dbProducts.forEach((p: any) => {
    productNameMap[p.id] = p.translations?.it?.name || p.name || `Prodotto ${p.id.slice(0, 8)}`;
  });

  return productNameMap;
}

/**
 * Prepara le informazioni prodotti per la notifica Telegram
 */
function prepareProductsInfo(
  selectedProducts: SelectedProduct[],
  productNameMap: Record<string, string>,
  avgPrice: number
): ProductInfo[] {
  return selectedProducts.map(sp => ({
    id: sp.productId,
    name: productNameMap[sp.productId] || `Prodotto ${sp.productId.slice(0, 8)}`,
    quantity: sp.quantity,
    price: avgPrice,
  }));
}

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const data: CustomQuoteData = await request.json();

    // Validazione dati
    if (!data.customerName || !data.customerEmail || !data.selectedProducts || data.selectedProducts.length === 0) {
      return NextResponse.json(
        { error: 'Dati mancanti: nome cliente, email e almeno un prodotto sono richiesti' },
        { status: 400 }
      );
    }

    // Validazione email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.customerEmail)) {
      return NextResponse.json(
        { error: 'Email non valida' },
        { status: 400 }
      );
    }

    // Validazione prodotti
    for (const selectedProduct of data.selectedProducts) {
      if (!selectedProduct.productId || selectedProduct.quantity <= 0) {
        return NextResponse.json(
          { error: 'Tutti i prodotti devono essere selezionati con quantità positiva' },
          { status: 400 }
        );
      }
    }

    const db = await getDatabase();
    const formsCollection = db.collection('forms');

    // Genera un ID univoco per l'ordine (stessa logica di CheckoutTorinoButton)
    const generateOrderId = (): string => {
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 8);
      return `TO-${timestamp}-${random}`.toUpperCase();
    };

    const orderId = generateOrderId();

    // Determina lo status in base al flag createAsConfirmed
    const status = data.createAsConfirmed ? 'confermato' : 'pending';

    // I totali saranno calcolati successivamente quando l'admin imposta i prezzi finali
    // Per ora impostiamo totali a 0 dato che i prezzi verranno gestiti in seguito
    const subtotal = 0;
    const shippingCost = 0; // Anche la spedizione verrà gestita successivamente
    const finalTotal = subtotal + shippingCost;

    // Crea il documento del preventivo (seguendo la stessa struttura di save-order-pending)
    const now = new Date();
    const preventivo: any = {
      // Dati base (come save-order-pending)
      orderId,
      createdAt: now,
      updatedAt: now, // IMPORTANTE: necessario per le statistiche dashboard
      timestamp: now.toISOString(),
      type: 'admin_custom', // Tipo specifico per preventivi admin
      status: status,

      // Dati cliente (compatibili con lo schema esistente)
      firstName: data.customerName.split(' ')[0] || data.customerName,
      lastName: data.customerName.split(' ').slice(1).join(' ') || '',
      email: data.customerEmail,
      phone: data.customerPhone || '',

      // Indirizzo
      address: data.customerAddress || '',
      province: data.customerProvince || '',

      // Cart nel formato standard (come TorinoForm)
      cart: data.selectedProducts.map(selectedProduct => ({
        id: selectedProduct.productId,
        quantity: selectedProduct.quantity
      })),

      // Prezzi stimati (da calcolare successivamente)
      pricing: {
        subtotal: subtotal,
        estimatedShipping: shippingCost,
        estimatedTotal: finalTotal
      },

      // Note interne
      notes: data.notes || '',

      // Flag per identificare preventivi creati dall'admin
      isAdminCreated: true,
      createdBy: 'admin'
    };

    // Se createAsConfirmed è true, aggiungi i prezzi finali
    if (data.createAsConfirmed && data.finalPricing) {
      preventivo.finalPricing = data.finalPricing;
    }

    // Inserisci nel database
    const result = await formsCollection.insertOne(preventivo);

    if (!result.insertedId) {
      throw new Error('Errore nell\'inserimento del preventivo');
    }

    // Se createAsConfirmed è true, gestisci cliente e notifica Telegram
    if (data.createAsConfirmed && data.finalPricing) {
      // Crea o aggiorna il cliente
      try {
        const totalInCents = Math.round(data.finalPricing.finalTotal * 100);

        const addressParts = (data.customerAddress || '').split(',').map((p: string) => p.trim());
        const addressDetails = addressParts.length > 0 ? {
          line1: addressParts[0] || undefined,
          city: addressParts[1] || undefined,
          state: data.customerProvince || undefined,
          postal_code: undefined,
          country: 'IT'
        } : undefined;

        await CustomerService.createOrUpdateFromOrder(
          data.customerEmail || '',
          data.customerName.split(' ')[0] || 'Cliente',
          data.customerName.split(' ').slice(1).join(' ') || '',
          data.customerPhone || undefined,
          addressDetails,
          orderId,
          totalInCents,
          'quote'
        );
      } catch (customerError) {
        console.error('Errore nel salvare il cliente:', customerError);
        // Non bloccare il processo
      }

      // Invia notifica Telegram (SENZA email)
      try {
        const productIds = data.selectedProducts.map(sp => sp.productId);
        const productNameMap = await getProductNames(db, productIds);

        const totalQuantity = data.selectedProducts.reduce((sum, sp) => sum + sp.quantity, 0);
        const avgPrice = totalQuantity > 0 ? data.finalPricing.finalSubtotal / totalQuantity : 0;

        const productsInfo = prepareProductsInfo(data.selectedProducts, productNameMap, avgPrice);

        await TelegramService.sendQuoteConfirmedNotification(
          preventivo,
          productsInfo,
          result.insertedId.toString()
        );

        console.log('✅ Notifica Telegram inviata per preventivo confermato');
      } catch (telegramError) {
        console.error('Errore invio notifica Telegram:', telegramError);
      }
    }

    // Risposta nello stesso formato di save-order-pending
    return NextResponse.json({
      success: true,
      message: data.createAsConfirmed
        ? 'Preventivo confermato creato con successo e notifica Telegram inviata'
        : 'Preventivo creato con successo',
      orderId, // ← Chiave per il redirect
      id: result.insertedId.toString(),
      preventivo: {
        id: result.insertedId.toString(),
        orderId: preventivo.orderId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        total: data.finalPricing?.finalTotal || finalTotal,
        status: preventivo.status,
        itemCount: data.selectedProducts.length
      }
    }, { status: 201 });

  } catch (error) {
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Errore interno del server',
        details: 'Errore nella creazione del preventivo personalizzato'
      },
      { status: 500 }
    );
  }
});