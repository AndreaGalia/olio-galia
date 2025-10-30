// app/api/admin/goals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { GoalService } from '@/services/goalService';

/**
 * GET /api/admin/goals
 * Recupera tutti gli obiettivi con paginazione
 */
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const result = await GoalService.getAllGoals(page, limit);

    return NextResponse.json({
      success: true,
      data: {
        goals: result.goals.map(goal => ({
          id: goal._id?.toString(),
          target: goal.target,
          startDate: goal.startDate,
          endDate: goal.endDate,
          year: goal.year,
          isActive: goal.isActive,
          createdAt: goal.createdAt,
          createdBy: goal.createdBy,
        })),
        pagination: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
          limit,
        },
      },
    });
  } catch (error) {
    console.error('Errore API get goals:', error);
    return NextResponse.json(
      { error: 'Errore durante il recupero degli obiettivi' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/admin/goals
 * Crea un nuovo obiettivo
 */
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { target, startDate, endDate } = body;

    // Validazione
    if (!target || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Campi obbligatori mancanti: target, startDate, endDate' },
        { status: 400 }
      );
    }

    if (typeof target !== 'number' || target <= 0) {
      return NextResponse.json(
        { error: 'L\'obiettivo deve essere un numero maggiore di zero' },
        { status: 400 }
      );
    }

    // Recupera l'admin autenticato (il middleware withAuth dovrebbe aggiungere user al request)
    // Per ora uso 'admin' come fallback
    const createdBy = 'admin';

    const result = await GoalService.createGoal(
      target,
      new Date(startDate),
      new Date(endDate),
      createdBy
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Errore durante la creazione dell\'obiettivo' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Obiettivo creato con successo',
        goalId: result.goalId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Errore API create goal:', error);
    return NextResponse.json(
      { error: 'Errore durante la creazione dell\'obiettivo' },
      { status: 500 }
    );
  }
});
