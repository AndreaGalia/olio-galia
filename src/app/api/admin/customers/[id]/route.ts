import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { CustomerService } from '@/services/customerService';

// GET - Dettaglio cliente singolo con storico ordini
export const GET = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;

    const customer = await CustomerService.getCustomerById(id);

    if (!customer) {
      return NextResponse.json(
        { error: 'Cliente non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      customer,
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Errore nel recupero del cliente' },
      { status: 500 }
    );
  }
});

// PUT - Aggiorna dati cliente
export const PUT = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const body = await request.json();
    const { firstName, lastName, phone, address } = body;

    const success = await CustomerService.updateCustomer(id, {
      firstName,
      lastName,
      phone,
      address,
    });

    if (!success) {
      return NextResponse.json(
        { error: 'Cliente non trovato o nessuna modifica effettuata' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cliente aggiornato con successo',
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento del cliente' },
      { status: 500 }
    );
  }
});

// DELETE - Elimina cliente
export const DELETE = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;

    // Verifica se il cliente ha ordini
    const customer = await CustomerService.getCustomerById(id);
    if (customer && customer.orders.length > 0) {
      return NextResponse.json(
        { error: 'Impossibile eliminare un cliente con ordini associati' },
        { status: 400 }
      );
    }

    const success = await CustomerService.deleteCustomer(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Cliente non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cliente eliminato con successo',
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione del cliente' },
      { status: 500 }
    );
  }
});
