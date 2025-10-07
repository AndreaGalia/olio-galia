// app/api/download-invoice/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Types
interface InvoiceStatus {
  hasInvoice: boolean;
  invoiceReady: boolean;
  invoiceNumber: string | null;
}

// Utilities
const validateSessionId = (sessionId: string | null) => {
  if (!sessionId) {
    throw new Error('Session ID richiesto');
  }
  return sessionId;
};

const retrieveSessionWithInvoice = async (sessionId: string) => {
  return await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['invoice']
  });
};

const extractInvoiceId = (invoice: string | Stripe.Invoice | null): string => {
  if (!invoice) {
    throw new Error('Fattura non disponibile per questo ordine');
  }

  if (typeof invoice === 'string') {
    return invoice;
  }

  if (invoice && 'id' in invoice && invoice.id) {
    return invoice.id;
  }

  throw new Error('ID fattura non valido');
};

const retrieveInvoiceDetails = async (invoiceId: string) => {
  return await stripe.invoices.retrieve(invoiceId);
};

const checkInvoiceAvailability = async (sessionId: string): Promise<InvoiceStatus> => {
  const session = await retrieveSessionWithInvoice(sessionId);
  
  if (!session.invoice) {
    return {
      hasInvoice: false,
      invoiceReady: false,
      invoiceNumber: null,
    };
  }

  try {
    const invoiceId = extractInvoiceId(session.invoice);
    const invoice = await retrieveInvoiceDetails(invoiceId);
    
    return {
      hasInvoice: true,
      invoiceReady: !!invoice.invoice_pdf,
      invoiceNumber: invoice.number,
    };
  } catch {
    return {
      hasInvoice: true,
      invoiceReady: false,
      invoiceNumber: null,
    };
  }
};


// POST: Check invoice availability
export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();
    const validSessionId = validateSessionId(sessionId);

    const invoiceStatus = await checkInvoiceAvailability(validSessionId);
    
    return NextResponse.json(invoiceStatus);

  } catch (error) {
    
    
    const message = error instanceof Error ? error.message : 'Errore nel controllo della fattura';
    const status = message.includes('richiesto') ? 400 : 500;
    
    return NextResponse.json({ error: message }, { status });
  }
}