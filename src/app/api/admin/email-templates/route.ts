import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { EmailTemplateService } from '@/services/emailTemplateService';

/**
 * GET /api/admin/email-templates
 * Lista tutti i template email
 */
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const templates = await EmailTemplateService.getAllTemplates();
    return NextResponse.json({ success: true, templates });
  } catch (error) {
    console.error('Error fetching email templates:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dei template' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/admin/email-templates
 * Crea un nuovo template email
 */
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const {
      templateKey,
      name,
      subjectIT,
      htmlBodyIT,
      subjectEN,
      htmlBodyEN,
      availableVariables
    } = body;

    // Validazione campi obbligatori
    if (!templateKey || !name || !subjectIT || !htmlBodyIT || !subjectEN || !htmlBodyEN) {
      return NextResponse.json(
        { error: 'Tutti i campi sono obbligatori' },
        { status: 400 }
      );
    }

    // Validazione templateKey format (solo lowercase, underscore, numeri)
    if (!/^[a-z0-9_]+$/.test(templateKey)) {
      return NextResponse.json(
        { error: 'Template key deve contenere solo lettere minuscole, numeri e underscore' },
        { status: 400 }
      );
    }

    const templateId = await EmailTemplateService.createTemplate({
      templateKey,
      name,
      subjectIT,
      htmlBodyIT,
      subjectEN,
      htmlBodyEN,
      availableVariables
    });

    return NextResponse.json({
      success: true,
      templateId,
      message: 'Template creato con successo'
    });
  } catch (error: any) {
    console.error('Error creating email template:', error);

    // Gestisci errore templateKey duplicato
    if (error.message && error.message.includes('già esistente')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Errore nella creazione del template' },
      { status: 500 }
    );
  }
});
