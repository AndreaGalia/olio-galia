import { NextRequest, NextResponse } from 'next/server';
import { TelegramService } from '@/lib/telegram/telegram';

// Vercel chiama questo endpoint automaticamente ogni mattina alle 8:00 UTC.
// La richiesta include l'header Authorization: Bearer {CRON_SECRET}.
// Se CRON_SECRET non è configurato, l'endpoint è comunque protetto solo su Vercel
// (i cron interni non sono raggiungibili dall'esterno in produzione).

export async function GET(request: NextRequest) {
  // Verifica il secret se configurato — utile anche per invocazioni manuali/test
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }
  }

  try {
    const sent = await TelegramService.sendDailyReport();

    return NextResponse.json({
      success: true,
      sent,
      message: sent ? 'Report inviato su Telegram' : 'Report non inviato (Telegram disabilitato o non configurato)',
    });
  } catch (error) {
    console.error('❌ Errore cron daily-report:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
