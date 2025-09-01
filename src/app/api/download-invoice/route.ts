// app/api/download-invoice/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID richiesto' }, { status: 400 });
  }

  try {
    // Recupera la sessione Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['invoice']
    });

    // Controlla se è stata richiesta fattura
    if (!session.invoice) {
      return NextResponse.json({ error: 'Fattura non disponibile per questo ordine' }, { status: 404 });
    }

    // Gestisci il tipo di session.invoice correttamente
    let invoiceId: string;
    if (typeof session.invoice === 'string') {
      invoiceId = session.invoice;
    } else if (session.invoice && 'id' in session.invoice && session.invoice.id) {
      invoiceId = session.invoice.id;
    } else {
      return NextResponse.json({ error: 'ID fattura non valido' }, { status: 400 });
    }
    
    // Recupera la fattura con tutti i dettagli
    const invoice = await stripe.invoices.retrieve(invoiceId);

    // Controlla se la fattura ha un PDF disponibile
    if (!invoice.invoice_pdf) {
      return NextResponse.json({ error: 'PDF della fattura non ancora disponibile' }, { status: 404 });
    }

    // Scarica il PDF da Stripe
    const pdfResponse = await fetch(invoice.invoice_pdf);
    
    if (!pdfResponse.ok) {
      throw new Error('Impossibile scaricare il PDF da Stripe');
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();

    // Restituisci il PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="fattura-${invoice.number || sessionId.slice(-8)}.pdf"`,
        'Content-Length': pdfBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('Errore nel download della fattura:', error);
    return NextResponse.json({ 
      error: 'Errore nel download della fattura',
      details: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 });
  }
}

// Endpoint per controllare se la fattura è disponibile
export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID richiesto' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['invoice']
    });

    const hasInvoice = !!session.invoice;
    let invoiceReady = false;
    let invoiceNumber = null;

    if (hasInvoice && session.invoice) {
      // Gestisci il tipo di session.invoice correttamente
      let invoiceId: string;
      if (typeof session.invoice === 'string') {
        invoiceId = session.invoice;
      } else if (session.invoice && 'id' in session.invoice && session.invoice.id) {
        invoiceId = session.invoice.id;
      } else {
        return NextResponse.json({ error: 'ID fattura non valido' }, { status: 400 });
      }

      const invoice = await stripe.invoices.retrieve(invoiceId);
      invoiceReady = !!invoice.invoice_pdf;
      invoiceNumber = invoice.number;
    }

    return NextResponse.json({
      hasInvoice,
      invoiceReady,
      invoiceNumber,
    });

  } catch (error) {
    console.error('Errore nel controllo fattura:', error);
    return NextResponse.json({ 
      error: 'Errore nel controllo della fattura' 
    }, { status: 500 });
  }
}