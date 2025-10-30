// app/api/admin/goals/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { GoalService } from '@/services/goalService';

/**
 * PUT /api/admin/goals/[id]
 * Aggiorna un obiettivo esistente
 */
export const PUT = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id: goalId } = await params;
    const body = await request.json();
    const { target, startDate, endDate, isActive } = body;

    const updates: any = {};

    if (target !== undefined) {
      if (typeof target !== 'number' || target <= 0) {
        return NextResponse.json(
          { error: 'L\'obiettivo deve essere un numero maggiore di zero' },
          { status: 400 }
        );
      }
      updates.target = target;
    }

    if (startDate !== undefined) {
      updates.startDate = new Date(startDate);
    }

    if (endDate !== undefined) {
      updates.endDate = new Date(endDate);
    }

    if (isActive !== undefined) {
      updates.isActive = isActive;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'Nessun campo da aggiornare' },
        { status: 400 }
      );
    }

    const result = await GoalService.updateGoal(goalId, updates);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Errore durante l\'aggiornamento dell\'obiettivo' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Obiettivo aggiornato con successo',
    });
  } catch (error) {
    console.error('Errore API update goal:', error);
    return NextResponse.json(
      { error: 'Errore durante l\'aggiornamento dell\'obiettivo' },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/admin/goals/[id]
 * Elimina un obiettivo
 */
export const DELETE = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id: goalId } = await params;

    const result = await GoalService.deleteGoal(goalId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Errore durante l\'eliminazione dell\'obiettivo' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Obiettivo eliminato con successo',
    });
  } catch (error) {
    console.error('Errore API delete goal:', error);
    return NextResponse.json(
      { error: 'Errore durante l\'eliminazione dell\'obiettivo' },
      { status: 500 }
    );
  }
});
