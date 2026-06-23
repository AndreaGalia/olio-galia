import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { connectToDatabase } from '@/lib/mongodb';

// GET /api/admin/orders/customers
// Aggrega clienti unici dalla collection orders per la selezione destinatari
export const GET = withAuth(async (_request: NextRequest) => {
  try {
    const { db } = await connectToDatabase();

    const customers = await db.collection('orders').aggregate([
      {
        $project: {
          email: {
            $ifNull: [
              '$customer.email',
              { $ifNull: ['$customerEmail', '$email'] },
            ],
          },
          name: {
            $ifNull: [
              '$customer.name',
              {
                $ifNull: [
                  '$customerName',
                  {
                    $trim: {
                      input: {
                        $concat: [
                          { $ifNull: ['$firstName', ''] },
                          ' ',
                          { $ifNull: ['$lastName', ''] },
                        ],
                      },
                    },
                  },
                ],
              },
            ],
          },
          createdAt: 1,
        },
      },
      // Scarta documenti senza email valida
      {
        $match: {
          email: { $exists: true, $ne: null, $nin: ['', 'N/D'] },
        },
      },
      // Raggruppa per email (case-insensitive)
      {
        $group: {
          _id: { $toLower: '$email' },
          customerName: { $last: '$name' },
          totalOrders: { $sum: 1 },
          lastOrderAt: { $max: '$createdAt' },
        },
      },
      {
        $project: {
          _id: 0,
          email: '$_id',
          customerName: 1,
          totalOrders: 1,
          lastOrderAt: 1,
        },
      },
      { $sort: { lastOrderAt: -1 } },
    ]).toArray();

    return NextResponse.json({ success: true, customers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dei clienti' },
      { status: 500 }
    );
  }
});
