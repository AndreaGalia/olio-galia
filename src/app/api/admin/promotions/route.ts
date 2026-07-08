import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { getCurrentUser } from '@/lib/auth/jwt';
import { connectToDatabase } from '@/lib/mongodb';
import { validateCampaignInput } from '@/lib/promotions/validateCampaignInput';
import type { PromotionCampaignDocument } from '@/types/promotionCampaign';

// Genera lo slug interno della campagna dal nome (es. "Saldi Estate 2026" → "saldi-estate-2026")
const slugify = (name: string): string =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// GET /api/admin/promotions
// Lista completa delle campagne, più recenti prima
export const GET = withAuth(async (_request: NextRequest) => {
  try {
    const { db } = await connectToDatabase();

    const campaigns = await db
      .collection<PromotionCampaignDocument>('promotion_campaigns')
      .find({})
      .sort({ 'metadata.createdAt': -1 })
      .toArray();

    return NextResponse.json({ success: true, campaigns });
  } catch (error) {
    console.error('Error fetching promotion campaigns:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero delle campagne' },
      { status: 500 }
    );
  }
});

// POST /api/admin/promotions
// Crea una nuova campagna promozionale (solo Mongo, nessuna chiamata a Stripe)
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validation = await validateCampaignInput(body);

    if (validation.error !== undefined) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const input = validation.input;

    const { db } = await connectToDatabase();
    const collection = db.collection<PromotionCampaignDocument>('promotion_campaigns');

    // Indici idempotenti: lookup per prodotto + finestra di attivazione, slug unico
    await Promise.all([
      collection.createIndex({ active: 1, startDate: 1, endDate: 1 }),
      collection.createIndex({ productIds: 1 }),
      collection.createIndex({ id: 1 }, { unique: true }),
    ]);

    // Slug unico: se già esistente aggiunge un suffisso numerico
    const baseSlug = slugify(input.name) || 'campagna';
    let id = baseSlug;
    let suffix = 2;
    while (await collection.findOne({ id }, { projection: { _id: 1 } })) {
      id = `${baseSlug}-${suffix++}`;
    }

    const user = await getCurrentUser();
    const now = new Date();

    const campaign: PromotionCampaignDocument = {
      id,
      ...input,
      metadata: {
        createdAt: now,
        updatedAt: now,
        createdBy: user?.email ?? 'admin',
      },
    };

    await collection.insertOne(campaign);

    return NextResponse.json({ success: true, campaign }, { status: 201 });
  } catch (error) {
    console.error('Error creating promotion campaign:', error);
    return NextResponse.json(
      { error: 'Errore nella creazione della campagna' },
      { status: 500 }
    );
  }
});
