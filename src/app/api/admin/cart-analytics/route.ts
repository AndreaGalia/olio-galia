import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { getDatabase } from '@/lib/mongodb';

export const GET = withAuth(async () => {
  try {
    const db = await getDatabase();
    const collection = db.collection('cart_events');

    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalEvents, last7DaysCount, last30DaysCount, topProducts, recentEvents] =
      await Promise.all([
        collection.countDocuments(),
        collection.countDocuments({ timestamp: { $gte: last7Days } }),
        collection.countDocuments({ timestamp: { $gte: last30Days } }),

        collection
          .aggregate([
            {
              $group: {
                _id: '$productId',
                productName: { $last: '$productName' },
                totalAdds: { $sum: 1 },
                totalQuantity: { $sum: '$quantity' },
              },
            },
            { $sort: { totalAdds: -1 } },
            { $limit: 10 },
          ])
          .toArray(),

        collection
          .find()
          .sort({ timestamp: -1 })
          .limit(30)
          .toArray(),
      ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalEvents,
        last7DaysCount,
        last30DaysCount,
      },
      topProducts: topProducts.map(p => ({
        productId: p._id,
        productName: p.productName,
        totalAdds: p.totalAdds,
        totalQuantity: p.totalQuantity,
      })),
      recentEvents: recentEvents.map(e => ({
        id: e._id.toString(),
        productId: e.productId,
        variantId: e.variantId,
        productName: e.productName,
        price: e.price,
        quantity: e.quantity,
        timestamp: e.timestamp,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: 'Errore nel recupero dei dati' },
      { status: 500 }
    );
  }
});
