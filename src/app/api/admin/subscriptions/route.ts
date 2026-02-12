// app/api/admin/subscriptions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/services/subscriptionService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || undefined;
    const zone = searchParams.get('zone') || undefined;

    const result = await SubscriptionService.getAllSubscriptions(page, limit, { status, zone });
    const stats = await SubscriptionService.getStats();

    return NextResponse.json({ ...result, stats });
  } catch (error) {
    return NextResponse.json(
      { error: 'Errore nel caricamento degli abbonamenti' },
      { status: 500 }
    );
  }
}
