import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { EmailTemplateService } from '@/services/emailTemplateService';

/**
 * POST /api/admin/email-templates/[id]/test
 * Invia email di test con dati di esempio
 */
export const POST = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const body = await request.json();
    const { testEmail, locale = 'it' } = body;

    // Validazione email destinatario
    if (!testEmail) {
      return NextResponse.json(
        { error: 'Email destinatario obbligatoria' },
        { status: 400 }
      );
    }

    // Validazione formato email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      return NextResponse.json(
        { error: 'Formato email non valido' },
        { status: 400 }
      );
    }

    // Validazione locale
    if (locale !== 'it' && locale !== 'en') {
      return NextResponse.json(
        { error: 'Lingua non valida (it/en)' },
        { status: 400 }
      );
    }

    const success = await EmailTemplateService.sendTestEmail(id, testEmail, locale);

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Email di test inviata a ${testEmail}`
      });
    } else {
      return NextResponse.json(
        { error: 'Errore nell\'invio dell\'email di test' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error sending test email:', error);

    if (error.message === 'Template non trovato') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Errore nell\'invio dell\'email di test' },
      { status: 500 }
    );
  }
});
