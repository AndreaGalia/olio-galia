// app/api/forms/save/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { CustomerService } from '@/services/customerService';

// Funzione per generare un ID ordine univoco
function generateOrderId(type: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  // Prefisso basato sul tipo: TO per Torino, IT per Italia/Europa
  const prefix = type === 'italia_delivery' ? 'IT' : 'TO';
  return `${prefix}-${timestamp}-${random}`.toUpperCase();
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();

    // Ottieni il tipo dalla request o usa torino_delivery come default
    const deliveryType = formData.type || 'torino_delivery';

    // Genera un orderId univoco in base al tipo
    const orderId = generateOrderId(deliveryType);

    // Aggiungi timestamp e orderId
    const dataToSave = {
      ...formData,
      orderId, // ← AGGIUNTO: ID ordine univoco
      createdAt: new Date(),
      type: deliveryType, // usa il tipo dalla request
      status: 'pending' // stato iniziale
    };

    // Salva direttamente su MongoDB
    const db = await getDatabase();
    const collection = db.collection('forms'); // o 'torino_requests'

    const result = await collection.insertOne(dataToSave);

    // Crea o aggiorna il cliente nella collection customers
    try {
      await CustomerService.createOrUpdateFromOrder(
        formData.email,
        formData.firstName,
        formData.lastName,
        formData.phone,
        formData.address ? {
          line1: formData.address,
          city: deliveryType === 'italia_delivery' ? (formData.city || '') : 'Torino',
          state: formData.province || (deliveryType === 'italia_delivery' ? '' : 'TO'),
          country: formData.country || 'IT'
        } : undefined,
        orderId,
        0, // Total in centesimi (preventivo non ha ancora un totale)
        'quote' // Source type
      );
    } catch (customerError) {
      console.error('Errore creazione/aggiornamento cliente:', customerError);
      // Non bloccare il salvataggio del form anche se il cliente fallisce
    }

    return NextResponse.json({
      success: true,
      message: 'Richiesta salvata con successo',
      orderId, // ← AGGIUNTO: restituisce l'orderId
      id: result.insertedId.toString()
    }, { status: 201 });

  } catch (error) {
    
    
    return NextResponse.json({
      success: false,
      message: 'Errore interno del server'
    }, { status: 500 });
  }
}