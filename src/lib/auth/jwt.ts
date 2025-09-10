import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');
const JWT_EXPIRES_IN = '7d'; // 7 giorni

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin';
  iat: number;
  exp: number;
}

export async function signJWT(payload: { userId: string; email: string; role: 'admin' }): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Verifica che il payload contenga i campi necessari
    if (!payload.userId || !payload.email || !payload.role) {
      throw new Error('Token JWT non valido: campi mancanti');
    }
    
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as 'admin',
      iat: payload.iat as number,
      exp: payload.exp as number,
    };
  } catch (error) {
    throw new Error('Token JWT non valido');
  }
}

export async function getTokenFromRequest(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token');
  return token?.value || null;
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('admin-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 giorni
    path: '/',
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
}

export async function getCurrentUser(): Promise<JWTPayload | null> {
  try {
    const token = await getTokenFromRequest();
    if (!token) return null;
    
    return await verifyJWT(token);
  } catch {
    return null;
  }
}