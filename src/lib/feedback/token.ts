// lib/feedback/token.ts
import { SignJWT, jwtVerify } from 'jose';

/**
 * Payload del token feedback
 */
export interface FeedbackTokenPayload {
  orderId: string;           // MongoDB _id dell'ordine/preventivo
  orderType: 'order' | 'quote'; // Tipo ordine
  exp?: number;              // Expiry timestamp (gestito da JWT)
}

/**
 * Durata validità token (30 giorni)
 */
const TOKEN_EXPIRY = '30d';

/**
 * Secret per firmare i token (da JWT_SECRET env)
 */
function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET non configurato');
  }
  return new TextEncoder().encode(secret);
}

/**
 * Genera un token JWT sicuro per il feedback
 * @param orderId - MongoDB _id dell'ordine/preventivo
 * @param orderType - Tipo ordine ('order' o 'quote')
 * @returns Token JWT firmato
 */
export async function generateFeedbackToken(
  orderId: string,
  orderType: 'order' | 'quote'
): Promise<string> {
  try {
    const secret = getSecret();

    const token = await new SignJWT({
      orderId,
      orderType,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(TOKEN_EXPIRY)
      .setSubject('feedback')
      .sign(secret);

    return token;
  } catch (error) {
    console.error('[FeedbackToken] Errore nella generazione token:', error);
    throw new Error('Errore nella generazione del token feedback');
  }
}

/**
 * Verifica e decodifica un token feedback
 * @param token - Token JWT da verificare
 * @returns Payload decodificato o null se invalido/scaduto
 */
export async function verifyFeedbackToken(
  token: string
): Promise<FeedbackTokenPayload | null> {
  try {
    const secret = getSecret();

    const { payload } = await jwtVerify(token, secret, {
      subject: 'feedback',
    });

    // Verifica che il payload contenga i campi necessari
    if (
      !payload.orderId ||
      !payload.orderType ||
      (payload.orderType !== 'order' && payload.orderType !== 'quote')
    ) {
      console.warn('[FeedbackToken] Payload token incompleto o invalido');
      return null;
    }

    return {
      orderId: payload.orderId as string,
      orderType: payload.orderType as 'order' | 'quote',
    };
  } catch (error) {
    // Token scaduto, invalido o manomesso
    if (error instanceof Error) {
      console.warn('[FeedbackToken] Token invalido:', error.message);
    }
    return null;
  }
}

/**
 * Genera URL completo per il feedback con token
 * @param orderId - MongoDB _id dell'ordine/preventivo
 * @param orderType - Tipo ordine
 * @returns URL completo con token
 */
export async function generateFeedbackUrl(
  orderId: string,
  orderType: 'order' | 'quote'
): Promise<string> {
  const token = await generateFeedbackToken(orderId, orderType);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return `${baseUrl}/feedback/${token}`;
}
