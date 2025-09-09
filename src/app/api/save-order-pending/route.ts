// app/api/forms/save/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

// Funzione per generare un ID ordine univoco
function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `TO-${timestamp}-${random}`.toUpperCase();
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();

    // Genera un orderId univoco
    const orderId = generateOrderId();

    // Aggiungi timestamp e orderId
    const dataToSave = {
      ...formData,
      orderId, // ← AGGIUNTO: ID ordine univoco
      createdAt: new Date(),
      type: 'torino_form', // per identificare il tipo di form
      status: 'pending' // stato iniziale
    };

    // Salva direttamente su MongoDB
    const db = await getDatabase();
    const collection = db.collection('forms'); // o 'torino_requests'
    
    const result = await collection.insertOne(dataToSave);

    console.log(`✅ Nuovo ordine Torino salvato: ${orderId}`, {
      customer: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      mongoId: result.insertedId.toString()
    });

    return NextResponse.json({
      success: true,
      message: 'Richiesta salvata con successo',
      orderId, // ← AGGIUNTO: restituisce l'orderId
      id: result.insertedId.toString()
    }, { status: 201 });

  } catch (error) {
    console.error('Errore nel salvare dati form:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Errore interno del server'
    }, { status: 500 });
  }
}