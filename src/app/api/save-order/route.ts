// app/api/save-order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/services/orderService';
import { OrderDetails } from '@/types/checkoutSuccessTypes';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID richiesto' },
        { status: 400 }
      );
    }

    // Verifica se l'ordine esiste già per evitare duplicati
    const orderExists = await OrderService.orderExists(sessionId);
    if (orderExists) {
      return NextResponse.json({
        success: true,
        message: 'Ordine già esistente',
        duplicate: true
      });
    }

    // Recupera i dettagli dell'ordine da Stripe
    // (Usa la stessa logica dell'API order-details)
    const orderDetailsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/order-details?session_id=${sessionId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!orderDetailsResponse.ok) {
      throw new Error('Impossibile recuperare dettagli ordine');
    }

    const orderDetails: OrderDetails = await orderDetailsResponse.json();

    // Salva l'ordine in MongoDB
    const mongoId = await OrderService.createOrder(orderDetails);

    return NextResponse.json({
      success: true,
      message: 'Ordine salvato con successo',
      mongoId,
      sessionId
    });

  } catch (error) {
    console.error('Errore nel salvare l\'ordine:', error);
    
    const message = error instanceof Error ? error.message : 'Errore nel salvare l\'ordine';
    
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}