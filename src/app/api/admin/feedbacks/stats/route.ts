// app/api/admin/feedbacks/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { getDatabase } from '@/lib/mongodb';
import { FeedbackDocument } from '@/types/feedback';

/**
 * GET /api/admin/feedbacks/stats
 * Statistiche aggregate dei feedback
 */
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const db = await getDatabase();
    const feedbackCollection = db.collection<FeedbackDocument>('feedbacks');

    // Totale feedback
    const totalFeedbacks = await feedbackCollection.countDocuments();

    // Media rating
    const avgRatingResult = await feedbackCollection
      .aggregate([
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' },
          },
        },
      ])
      .toArray();

    const avgRating = avgRatingResult[0]?.avgRating || 0;

    // Distribuzione rating (quanti feedback per ogni stella)
    const ratingDistribution = await feedbackCollection
      .aggregate([
        {
          $group: {
            _id: '$rating',
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ])
      .toArray();

    // Inizializza con 0 per tutte le stelle
    const distributionMap: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    ratingDistribution.forEach((item) => {
      distributionMap[item._id] = item.count;
    });

    // Feedback per tipo ordine
    const feedbackByType = await feedbackCollection
      .aggregate([
        {
          $group: {
            _id: '$orderType',
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const typeMap: Record<string, number> = {
      order: 0,
      quote: 0,
    };

    feedbackByType.forEach((item) => {
      typeMap[item._id] = item.count;
    });

    // Ultimi 5 feedback ricevuti
    const recentFeedbacks = await feedbackCollection
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .project({
        rating: 1,
        comment: 1,
        customerName: 1,
        createdAt: 1,
        orderType: 1,
      })
      .toArray();

    // Trend mensile (ultimi 6 mesi)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await feedbackCollection
      .aggregate([
        {
          $match: {
            createdAt: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
            avgRating: { $avg: '$rating' },
          },
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 },
        },
      ])
      .toArray();

    return NextResponse.json({
      success: true,
      stats: {
        total: totalFeedbacks,
        avgRating: Math.round(avgRating * 10) / 10, // Arrotonda a 1 decimale
        ratingDistribution: distributionMap,
        byType: typeMap,
        recentFeedbacks: recentFeedbacks.map((f) => ({
          _id: f._id,
          rating: f.rating,
          comment: f.comment.substring(0, 100) + (f.comment.length > 100 ? '...' : ''),
          customerName: f.customerName,
          createdAt: f.createdAt,
          orderType: f.orderType,
        })),
        monthlyTrend: monthlyTrend.map((m) => ({
          month: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
          count: m.count,
          avgRating: Math.round(m.avgRating * 10) / 10,
        })),
      },
    });
  } catch (error) {
    console.error('[Admin Feedbacks Stats] Errore:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Errore nel recupero delle statistiche',
      },
      { status: 500 }
    );
  }
});
