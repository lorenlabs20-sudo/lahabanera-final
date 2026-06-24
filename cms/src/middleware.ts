import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Almacenamiento temporal en memoria para desarrollo. 
// En producción, usa Redis o una base de datos.
const ipAttempts = new Map<string, { count: number; resetTime: number }>();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const MAX_ATTEMPTS = 5; // 5 intentos por ventana

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Aplicar rate limiting solo a la ruta de login
  if (pathname === '/api/auth/login') {
    const ip = request.headers.get('x-forwarded-for') || 'unknown-ip';
    const now = Date.now();
    
    const attempt = ipAttempts.get(ip);

    if (attempt && now < attempt.resetTime) {
      if (attempt.count >= MAX_ATTEMPTS) {
        return NextResponse.json(
          { error: 'Demasiados intentos. Intente nuevamente en 15 minutos.' },
          { status: 429 }
        );
      }
      attempt.count += 1;
    } else {
      ipAttempts.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};