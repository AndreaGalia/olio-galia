import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { EmailTemplateService } from '@/services/emailTemplateService';

/**
 * GET /api/admin/email-templates/[id]
 * Ottiene un singolo template per ID
 */
export const GET = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const template = await EmailTemplateService.getTemplateById(id);

    if (!template) {
      return NextResponse.json(
        { error: 'Template non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, template });
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero del template' },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/admin/email-templates/[id]
 * Aggiorna un template esistente
 */
export const PUT = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const body = await request.json();

    await EmailTemplateService.updateTemplate(id, body);

    return NextResponse.json({
      success: true,
      message: 'Template aggiornato con successo'
    });
  } catch (error: any) {
    console.error('Error updating template:', error);

    if (error.message === 'Template non trovato') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento del template' },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/admin/email-templates/[id]
 * Elimina un template (solo se non è di sistema)
 */
export const DELETE = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    await EmailTemplateService.deleteTemplate(id);

    return NextResponse.json({
      success: true,
      message: 'Template eliminato con successo'
    });
  } catch (error: any) {
    console.error('Error deleting template:', error);

    if (error.message && error.message.includes('sistema')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    if (error.message === 'Template non trovato') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Errore nell\'eliminazione del template' },
      { status: 500 }
    );
  }
});
