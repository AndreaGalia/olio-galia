import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

interface SelectedProduct {
  productId: string;
  quantity: number;
}

interface CustomQuoteData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerProvince: string;
  selectedProducts: SelectedProduct[];
  notes?: string;
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

    // I totali saranno calcolati successivamente quando l'admin imposta i prezzi finali
    // Per ora impostiamo totali a 0 dato che i prezzi verranno gestiti in seguito
    const subtotal = 0;
    const shippingCost = 0; // Anche la spedizione verrà gestita successivamente
    const finalTotal = subtotal + shippingCost;

    // Crea il documento del preventivo (seguendo la stessa struttura di save-order-pending)
    const preventivo = {
      // Dati base (come save-order-pending)
      orderId,
      createdAt: new Date(),
      timestamp: new Date().toISOString(),
      type: 'admin_custom', // Tipo specifico per preventivi admin
      status: 'pending',

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

      // I prezzi finali non sono ancora impostati, verranno gestiti successivamente
      // finalPricing verrà aggiunto quando l'admin modifica i prezzi nella pagina dei dettagli

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

    // Inserisci nel database
    const result = await formsCollection.insertOne(preventivo);

    if (!result.insertedId) {
      throw new Error('Errore nell\'inserimento del preventivo');
    }

    // Log come fa save-order-pending

    // Risposta nello stesso formato di save-order-pending
    return NextResponse.json({
      success: true,
      message: 'Preventivo creato con successo',
      orderId, // ← Chiave per il redirect
      id: result.insertedId.toString(),
      preventivo: {
        id: result.insertedId.toString(),
        orderId: preventivo.orderId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        total: finalTotal,
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