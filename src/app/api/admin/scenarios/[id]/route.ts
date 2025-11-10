import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import {
  getScenarioById,
  updateScenario,
  deleteScenario,
} from '@/lib/scenario/database';
import { validateScenarioData } from '@/lib/scenario/calculations';
import type { UpdateScenarioData } from '@/types/scenario';

/**
 * GET /api/admin/scenarios/[id]
 * Recupera un singolo scenario per ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verifica autenticazione admin
    const authError = await requireAuth(request);
    if (authError) {
      return authError;
    }

    const { id } = await params;

    const scenario = await getScenarioById(id);

    if (!scenario) {
      return NextResponse.json(
        { success: false, error: 'Scenario non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      scenario,
    });
  } catch (error) {
    console.error('Error fetching scenario:', error);
    return NextResponse.json(
      { success: false, error: 'Errore nel recupero dello scenario' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/scenarios/[id]
 * Aggiorna uno scenario esistente
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verifica autenticazione admin
    const authError = await requireAuth(request);
    if (authError) {
      return authError;
    }

    const { id } = await params;
    const body = await request.json();

    const updateData: UpdateScenarioData = {};

    // Campi opzionali
    if (body.name !== undefined) {
      updateData.name = body.name.trim();
    }
    if (body.description !== undefined) {
      updateData.description = body.description?.trim();
    }
    if (body.variousCosts !== undefined) {
      updateData.variousCosts = body.variousCosts;
    }
    if (body.productCosts !== undefined) {
      updateData.productCosts = body.productCosts;
    }
    if (body.salesEstimates !== undefined) {
      updateData.salesEstimates = body.salesEstimates;
    }
    if (body.productPricing !== undefined) {
      updateData.productPricing = body.productPricing;
    }
    if (body.metadata?.isActive !== undefined) {
      updateData.metadata = {
        isActive: body.metadata.isActive,
      };
    }

    // Se vengono aggiornati dati finanziari, valida
    if (
      updateData.variousCosts ||
      updateData.productCosts ||
      updateData.salesEstimates ||
      updateData.productPricing
    ) {
      // Recupera scenario corrente per merge
      const currentScenario = await getScenarioById(id);
      if (!currentScenario) {
        return NextResponse.json(
          { success: false, error: 'Scenario non trovato' },
          { status: 404 }
        );
      }

      const dataToValidate = {
        variousCosts: updateData.variousCosts || currentScenario.variousCosts,
        productCosts: updateData.productCosts || currentScenario.productCosts,
        salesEstimates:
          updateData.salesEstimates || currentScenario.salesEstimates,
        productPricing:
          updateData.productPricing || currentScenario.productPricing,
      };

      const validation = validateScenarioData(dataToValidate);
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
    }

    const scenario = await updateScenario(id, updateData);

    if (!scenario) {
      return NextResponse.json(
        { success: false, error: 'Scenario non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      scenario,
    });
  } catch (error) {
    console.error('Error updating scenario:', error);
    return NextResponse.json(
      { success: false, error: "Errore nell'aggiornamento dello scenario" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/scenarios/[id]
 * Elimina uno scenario
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verifica autenticazione admin
    const authError = await requireAuth(request);
    if (authError) {
      return authError;
    }

    const { id } = await params;

    const deleted = await deleteScenario(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Scenario non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Scenario eliminato con successo',
    });
  } catch (error) {
    console.error('Error deleting scenario:', error);
    return NextResponse.json(
      { success: false, error: "Errore nell'eliminazione dello scenario" },
      { status: 500 }
    );
  }
}
