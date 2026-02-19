// app/api/feedback/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { verifyFeedbackToken } from '@/lib/feedback/token';

/**
 * POST /api/feedback/verify
 * Verifica un token feedback e restituisce le info ordine
 */
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token mancante'
        },
        { status: 400 }
      );
    }

    // Verifica token JWT
    const payload = await verifyFeedbackToken(token);

    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: 'Link non valido o scaduto. Il link è valido per 30 giorni dalla consegna.'
        },
        { status: 401 }
      );
    }

    const { orderId, orderType } = payload;

    const db = await getDatabase();

    // Cerca l'ordine nel database
    let order = null;
    const collection = orderType === 'order' ? 'orders' : 'forms';

    // Cerca per MongoDB _id
    if (orderId.match(/^[0-9a-fA-F]{24}$/)) {
      order = await db.collection(collection).findOne({ _id: new ObjectId(orderId) });
    }

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: 'Ordine non trovato'
        },
        { status: 404 }
      );
    }

    // Verifica lo stato dell'ordine/preventivo
    if (orderType === 'order') {
      // Per gli ordini: deve essere consegnato (shippingStatus === 'delivered')
      if (order.shippingStatus !== 'delivered') {
        return NextResponse.json(
          {
            success: false,
            error: 'Il feedback può essere lasciato solo dopo la consegna dell\'ordine'
          },
          { status: 403 }
        );
      }
    } else {
      // Per i preventivi: deve essere confermato (status === 'confermato')
      if (order.status !== 'confermato') {
        return NextResponse.json(
          {
            success: false,
            error: 'Il feedback può essere lasciato solo dopo la conferma del preventivo'
          },
          { status: 403 }
        );
      }
    }

    // Estrai solo le informazioni necessarie per il feedback
    const orderEmail = (order.customerEmail || order.email || order.customer?.email || '').toLowerCase().trim();

    // Prova più fonti per il nome del cliente
    let customerName = order.customerName || order.customer?.name || '';

    // Se ancora vuoto, prova firstName + lastName
    if (!customerName || customerName.trim().length === 0) {
      const firstName = order.firstName || order.customer?.firstName || '';
      const lastName = order.lastName || order.customer?.lastName || '';
      customerName = `${firstName} ${lastName}`.trim();
    }

    // Fallback a "Cliente" se ancora vuoto
    if (!customerName || customerName.trim().length === 0) {
      customerName = 'Cliente';
    }

    // Gestisci items diversamente per ordini e preventivi
    let items: Array<{ productId: string | null; name: string; quantity: number }> = [];

    if (orderType === 'order') {
      // Per gli ordini: usa order.items direttamente
      items = order.items?.map((item: any) => ({
        productId: item.productId || item.product_id || item.id || null,
        name: item.name || item.description || 'Prodotto',
        quantity: item.quantity || 1,
      })) || [];
    } else {
      // Per i preventivi: usa order.cart e recupera nomi prodotti dal DB
      if (order.cart && order.cart.length > 0) {
        // Supporto per compound ID con variante: "local_beauty-oil::zagara"
        const parsedItems = order.cart.map((cartItem: any) => {
          const parts = (cartItem.id as string).split('::');
          return {
            productId: parts[0],                              // "local_beauty-oil"
            variantId: parts.length > 1 ? parts[1] : null,  // "zagara" | null
            quantity: cartItem.quantity || 1,
          };
        });

        const productIds = [...new Set(parsedItems.map((i: any) => i.productId))];

        // Recupera informazioni prodotti dal database
        const productsCollection = db.collection('products');
        const products = await productsCollection.find({
          id: { $in: productIds }
        }).toArray();

        const productMap: Record<string, any> = {};
        products.forEach((p: any) => { productMap[p.id] = p; });

        // Mappa cart items con nomi prodotti, risolvendo la variante se presente
        items = parsedItems.map((parsed: any) => {
          const product = productMap[parsed.productId];
          let name = product?.translations?.it?.name || `Prodotto ${parsed.productId.slice(0, 8)}`;

          if (parsed.variantId && product?.variants?.length) {
            const variant = product.variants.find((v: any) => v.variantId === parsed.variantId);
            if (variant?.translations?.it?.variantName) {
              name = `${name} - ${variant.translations.it.variantName}`;
            }
          }

          return {
            productId: parsed.productId,  // ID padre, non il compound ID
            name,
            quantity: parsed.quantity,
          };
        });
      }
    }

    const orderInfo = {
      orderId: order._id?.toString() || orderId,
      orderNumber: order.orderId || order.sessionId || orderId,
      customerName: customerName,
      customerEmail: orderEmail || 'noemail@example.com', // Fallback se non c'è email
      orderType: orderType,
      items: items,
      createdAt: order.createdAt || order.created || new Date(),
    };

    return NextResponse.json({
      success: true,
      order: orderInfo
    });

  } catch (error) {
    console.error('[Feedback] Errore nella verifica token:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Errore interno del server'
      },
      { status: 500 }
    );
  }
}
