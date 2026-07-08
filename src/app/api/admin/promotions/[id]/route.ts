import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { connectToDatabase } from '@/lib/mongodb';
import { validateCampaignInput } from '@/lib/promotions/validateCampaignInput';
import type { PromotionCampaignDocument } from '@/types/promotionCampaign';

type Params = { params: Promise<{ id: string }> };

// GET /api/admin/promotions/[id]
// Dettaglio di una singola campagna (lookup per slug interno)
export const GET = withAuth(async (_request: NextRequest, { params }: Params) => {
  try {
    const { id } = await params;

    const { db } = await connectToDatabase();
    const campaign = await db
      .collection<PromotionCampaignDocument>('promotion_campaigns')
      .findOne({ id });

    if (!campaign) {
      return NextResponse.json({ error: 'Campagna non trovata' }, { status: 404 });
    }

    return NextResponse.json({ success: true, campaign });
  } catch (error) {
    console.error('Error fetching promotion campaign:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero della campagna' },
      { status: 500 }
    );
  }
});

// PUT /api/admin/promotions/[id]
// Aggiorna una campagna esistente. Lo slug `id` non è modificabile.
export const PUT = withAuth(async (request: NextRequest, { params }: Params) => {
  try {
    const { id } = await params;
    const body = await request.json();

    const validation = await validateCampaignInput(body);
    if (validation.error !== undefined) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const input = validation.input;

    const { db } = await connectToDatabase();
    const collection = db.collection<PromotionCampaignDocument>('promotion_campaigns');

    const result = await collection.findOneAndUpdate(
      { id },
      {
        $set: {
          ...input,
          'metadata.updatedAt': new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Campagna non trovata' }, { status: 404 });
    }

    return NextResponse.json({ success: true, campaign: result });
  } catch (error) {
    console.error('Error updating promotion campaign:', error);
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento della campagna' },
      { status: 500 }
    );
  }
});

// DELETE /api/admin/promotions/[id]
// Elimina definitivamente una campagna (per metterla in pausa usare il toggle `active`)
export const DELETE = withAuth(async (_request: NextRequest, { params }: Params) => {
  try {
    const { id } = await params;

    const { db } = await connectToDatabase();
    const result = await db
      .collection<PromotionCampaignDocument>('promotion_campaigns')
      .deleteOne({ id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Campagna non trovata' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting promotion campaign:', error);
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione della campagna' },
      { status: 500 }
    );
  }
});
