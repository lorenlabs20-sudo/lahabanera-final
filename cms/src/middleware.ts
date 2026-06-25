import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Clave secreta para verificar el JWT (debe coincidir con la usada en el backend)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default_secret_key'
);

// Definir rutas públicas (no requieren autenticación)
const publicPaths = [
  '/admin/login',
  '/api/auth/login', // Asegura que esta ruta también sea pública
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar si la ruta es pública
  const isPublicPath = publicPaths.some((path) =>
    pathname.startsWith(path)
  );

  // Si es una ruta pública, continuar sin verificar autenticación
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Obtener la cookie de autenticación
  const token = request.cookies.get('auth_token')?.value; // Cambiado de 'token' a 'auth_token'

  // Si no hay token, redirigir al login
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  try {
    // Verificar el token JWT
    await jwtVerify(token, JWT_SECRET);
    // Si el token es válido, continuar
    return NextResponse.next();
  } catch (error) {
    // Si el token es inválido, redirigir al login
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }
}

// Configurar las rutas a las que se aplica el middleware
export const config = {
  matcher: ['/admin/:path*', '/api/:path*'], // Ajusta según tus rutas protegidas
};