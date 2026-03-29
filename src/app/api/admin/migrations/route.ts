import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { migrations } from '@/lib/migrations';

/** GET /api/admin/migrations — lista tutte le migrazioni registrate */
export const GET = withAuth(async (_req: NextRequest) => {
  const list = migrations.map(({ id, name, description, params }) => ({ id, name, description, params: params ?? [] }));
  return NextResponse.json({ migrations: list });
});
