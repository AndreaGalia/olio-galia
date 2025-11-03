// app/api/feedback/order-info/[orderId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

/**
 * GET /api/feedback/order-info/[orderId]
 * Recupera informazioni base di un ordine per la pagina feedback
 * (pubblico, ma solo info necessarie per il form)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID ordine mancante'
        },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Cerca prima negli ordini
    let order = null;
    let orderType: 'order' | 'quote' = 'order';

    // Prova a cercare per _id MongoDB
    if (orderId.match(/^[0-9a-fA-F]{24}$/)) {
      order = await db.collection('orders').findOne({ _id: new ObjectId(orderId) });
    }

    // Se non trovato, cerca per sessionId o orderId
    if (!order) {
      order = await db.collection('orders').findOne({
        $or: [
          { sessionId: orderId },
          { orderId: orderId }
        ]
      });
    }

    // Se non è un ordine, cerca nei preventivi (forms)
    if (!order) {
      orderType = 'quote';
      if (orderId.match(/^[0-9a-fA-F]{24}$/)) {
        order = await db.collection('forms').findOne({ _id: new ObjectId(orderId) });
      }
      if (!order) {
        order = await db.collection('forms').findOne({ orderId: orderId });
      }
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
    const orderInfo = {
      orderId: order._id?.toString() || orderId,
      orderNumber: order.orderId || order.sessionId || orderId,
      customerName: order.customerName || `${order.firstName || ''} ${order.lastName || ''}`.trim(),
      customerEmail: order.customerEmail || order.email || '',
      orderType: orderType,
      items: order.items?.map((item: any) => ({
        name: item.name || item.description || 'Prodotto',
        quantity: item.quantity || 1,
      })) || [],
      createdAt: order.createdAt || order.created || new Date(),
    };

    return NextResponse.json({
      success: true,
      order: orderInfo
    });

  } catch (error) {
    console.error('[Feedback] Errore nel recupero info ordine:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Errore interno del server'
      },
      { status: 500 }
    );
  }
}
