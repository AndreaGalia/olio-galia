import { NextRequest, NextResponse } from 'next/server';
import { CustomerService } from '@/services/customerService';
import { withAuth } from '@/lib/auth/middleware';

async function searchCustomersHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ customers: [] });
    }

    // Riutilizziamo getAllCustomers con la ricerca
    const result = await CustomerService.getAllCustomers(
      1, // page
      10, // limit
      query.trim() // searchQuery
    );

    // Restituiamo solo i campi necessari per l'autocomplete
    const customers = result.customers.map(customer => ({
      _id: customer._id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      address: customer.address,
      totalOrders: customer.totalOrders,
      totalSpent: customer.totalSpent,
      metadata: customer.metadata
    }));

    return NextResponse.json({ customers });
  } catch (error) {
    console.error('Error searching customers:', error);
    return NextResponse.json(
      { error: 'Errore nella ricerca dei clienti' },
      { status: 500 }
    );
  }
}

// Proteggi la route con autenticazione admin
export const GET = withAuth(searchCustomersHandler);
