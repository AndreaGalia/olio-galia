import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { getDatabase } from '@/lib/mongodb';

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;
    const db = await getDatabase();
    const collection = db.collection('forms');

    // Costruisci il filtro
    let filter: any = { type: 'torino_form' };
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Aggiungi ricerca unificata
    if (search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      filter.$or = [
        { orderId: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { address: searchRegex },
        { province: searchRegex }
      ];
    }

    const forms = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await collection.countDocuments(filter);

    // Trasforma i dati dei forms per l'admin
    const formattedForms = forms.map(form => ({
      id: form._id.toString(),
      orderId: form.orderId,
      customerName: `${form.firstName} ${form.lastName}`,
      customerEmail: form.email,
      phone: form.phone,
      address: form.address,
      province: form.province,
      cart: form.cart,
      status: form.status,
      type: form.type,
      created: form.createdAt?.toISOString() || form.timestamp,
      itemCount: form.cart?.length || 0,
    }));

    return NextResponse.json({
      success: true,
      forms: formattedForms,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });

  } catch (error) {
    console.error('Errore recupero forms admin:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dei forms' },
      { status: 500 }
    );
  }
});