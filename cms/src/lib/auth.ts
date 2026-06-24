import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// ==========================================
// 1. VALIDACIÓN ESTRICTA DE ENTORNO
// ==========================================
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  throw new Error("ERROR DE SEGURIDAD: Falta JWT_SECRET o es demasiado corta (< 16 chars). Revisa tu archivo .env.local");
}

if (!process.env.ADMIN_PASSWORD) {
  throw new Error("ERROR DE SEGURIDAD: Falta ADMIN_PASSWORD. Revisa tu archivo .env.local");
}

const JWT_SECRET = process.env.JWT_SECRET;

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export const comparePassword = verifyPassword;

export function generateToken(payload: object): string {
  // Usamos la variable validada arriba
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '4h' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// Función para obtener usuario desde Request (Edge/API Routes)
export function getAuthUser(request: Request): JWTPayload | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return verifyToken(authHeader.substring(7));
  }

  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookiesObj = Object.fromEntries(
      cookieHeader.split(';').map((c) => {
        const [key, ...v] = c.trim().split('=');
        return [key, v.join('=')];
      })
    );
    if (cookiesObj.auth_token) {
      return verifyToken(cookiesObj.auth_token);
    }
  }

  return null;
}

// Función corregida y completa para extraer token
export function extractToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookiesObj = Object.fromEntries(
      cookieHeader.split(';').map((c) => {
        const [key, ...v] = c.trim().split('=');
        return [key, v.join('=')];
      })
    );
    return cookiesObj.auth_token || null;
  }

  return null;
}

// Función para Server Components (usando next/headers)
export async function getCurrentUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) return null;
  return verifyToken(token);
}