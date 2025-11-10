import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import {
  createScenario,
  getAllScenarios,
} from '@/lib/scenario/database';
import { validateScenarioData } from '@/lib/scenario/calculations';
import type { CreateScenarioData } from '@/types/scenario';

/**
 * GET /api/admin/scenarios
 * Recupera la lista di tutti gli scenari
 */
export async function GET(request: NextRequest) {
  try {
    // Verifica autenticazione admin
    const authError = await requireAuth(request);
    if (authError) {
      return authError;
    }

    const scenarios = await getAllScenarios();

    return NextResponse.json({
      success: true,
      scenarios,
    });
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    return NextResponse.json(
      { success: false, error: 'Errore nel recupero degli scenari' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/scenarios
 * Crea un nuovo scenario
 */
export async function POST(request: NextRequest) {
  try {
    // Verifica autenticazione admin
    const authError = await requireAuth(request);
    if (authError) {
      return authError;
    }

    const body = await request.json();

    // Validazione base
    if (!body.name || body.name.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Nome scenario richiesto' },
        { status: 400 }
      );
    }

    const data: CreateScenarioData = {
      name: body.name.trim(),
      description: body.description?.trim(),
      variousCosts: body.variousCosts || [],
      productCosts: body.productCosts || [],
      salesEstimates: body.salesEstimates || [],
      productPricing: body.productPricing || [],
    };

    // Validazione dati scenario
    const validation = validateScenarioData(data);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dati non validi',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Crea scenario
    const scenario = await createScenario(data);

    return NextResponse.json({
      success: true,
      scenario,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating scenario:', error);
    return NextResponse.json(
      { success: false, error: 'Errore nella creazione dello scenario' },
      { status: 500 }
    );
  }
}
