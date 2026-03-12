import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'Olio Galia <onboarding@resend.dev>';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'info@oliogalia.com';

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Campi mancanti' }, { status: 400 });
    }

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: [SUPPORT_EMAIL],
      subject: `Nuovo messaggio da ${name} - Olio Galia`,
      html: `
        <h2>Nuovo messaggio dal form di contatto</h2>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Messaggio:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
      replyTo: email,
    });

    if (result.error) {
      return NextResponse.json({ error: 'Errore invio email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
