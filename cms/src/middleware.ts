import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-for-dev';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // En desarrollo no bloqueamos admin con middleware para evitar bloqueos de cookie
  // y dejar que el frontend maneje la sesión. En producción se mantiene la seguridad.
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.next();
  }

  // API routes siempre permitidas
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // Login page - si ya tiene token válido, redirigir al dashboard
  if (pathname === '/admin/login') {
    const token = request.cookies.get('auth_token')?.value;
    console.log('middleware login check: token?', Boolean(token), 'cookie raw:', request.cookies.get('auth_token'));
    if (token) {
      try {
        jwt.verify(token, JWT_SECRET);
        console.log('middleware: token válido, redirigir dashboard');
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      } catch (error) {
        console.log('middleware: token inválido/login', error);
        // Token inválido o expirado, dejar que entre al login
      }
    }
    return NextResponse.next();
  }
  
  // Rutas admin - verificar que el token JWT sea válido
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    // Verificar que el token sea válido y no haya expirado
    try {
      jwt.verify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      // Token inválido o expirado - redirigir al login
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      // Limpiar cookie inválida
      response.cookies.delete('auth_token');
      return response;
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};