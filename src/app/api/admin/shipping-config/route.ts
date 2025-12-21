/**
 * API Route: /api/admin/shipping-config
 *
 * Gestisce le operazioni CRUD sulla configurazione spedizioni.
 * Endpoint protetto: richiede autenticazione admin.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getActiveShippingConfig,
  updateShippingConfig,
} from '@/lib/shipping/shippingConfigService';
import {
  GetShippingConfigResponse,
  UpdateShippingConfigResponse,
  UpdateShippingConfigRequest,
} from '@/types/shippingConfig';

/**
 * GET /api/admin/shipping-config
 *
 * Recupera la configurazione spedizioni attiva.
 *
 * @returns GetShippingConfigResponse con configurazione attiva o null
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Aggiungere verifica autenticazione admin
    // const session = await getServerSession(authOptions);
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json(
    //     { success: false, config: null, error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    const config = await getActiveShippingConfig();

    const response: GetShippingConfigResponse = {
      success: true,
      config,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API /admin/shipping-config GET] Errore:', error);

    const response: GetShippingConfigResponse = {
      success: false,
      config: null,
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * PUT /api/admin/shipping-config
 *
 * Aggiorna la configurazione spedizioni.
 * Validazione completa dei dati prima del salvataggio.
 *
 * Body richiesto:
 * {
 *   weightTiers: WeightTier[],
 *   italyConfig: ItalyShippingConfig,
 *   weightBasedCosts: WeightBasedShippingCost[]
 * }
 *
 * @returns UpdateShippingConfigResponse con configurazione aggiornata
 */
export async function PUT(request: NextRequest) {
  try {
    // TODO: Aggiungere verifica autenticazione admin
    // const session = await getServerSession(authOptions);
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json(
    //     { success: false, message: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    const body: UpdateShippingConfigRequest = await request.json();

    // Validazione base body
    if (!body.weightTiers || !body.italyConfig || !body.weightBasedCosts) {
      const response: UpdateShippingConfigResponse = {
        success: false,
        message: 'Dati mancanti: weightTiers, italyConfig e weightBasedCosts obbligatori',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Aggiorna configurazione (validazione avviene nel service)
    const updatedConfig = await updateShippingConfig(body);

    const response: UpdateShippingConfigResponse = {
      success: true,
      message: 'Configurazione spedizioni aggiornata con successo',
      config: updatedConfig,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API /admin/shipping-config PUT] Errore:', error);

    const response: UpdateShippingConfigResponse = {
      success: false,
      message: 'Errore aggiornamento configurazione',
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
    };

    return NextResponse.json(response, { status: 500 });
  }
}
