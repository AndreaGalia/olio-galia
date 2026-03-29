import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { getMigration } from '@/lib/migrations';
import { getDatabase } from '@/lib/mongodb';

/**
 * POST /api/admin/migrations/[id]
 * Body: { dryRun: boolean, force?: boolean }
 *
 * - dryRun: true  → calcola i target, non scrive nulla
 * - force: true   → sovrascrive anche se la migrazione è già stata applicata
 */
export const POST = withAuth(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const migration = getMigration(id);

    if (!migration) {
      return NextResponse.json({ error: `Migrazione "${id}" non trovata` }, { status: 404 });
    }

    let dryRun = true;
    let force = false;
    let migrationParams: Record<string, string> | undefined;

    try {
      const body = await req.json();
      dryRun = body.dryRun !== false;
      force = Boolean(body.force);
      if (body.params && typeof body.params === 'object') {
        migrationParams = body.params as Record<string, string>;
      }
    } catch {
      // body assente → defaults
    }

    try {
      const db = await getDatabase();
      const result = await migration.run(db, { dryRun, force, params: migrationParams });
      return NextResponse.json({ success: true, migration: id, ...result });
    } catch (err) {
      console.error(`[migration:${id}]`, err);
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Errore interno' },
        { status: 500 }
      );
    }
  }
);
