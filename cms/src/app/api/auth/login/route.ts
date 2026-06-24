import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Credenciales desde variables de entorno (seguridad)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@lahabanera.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Habanera2025!';
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-for-dev';

export async function POST(request: Request) {
  try {
    let body: any = null;

    try {
      body = await request.json();
    } catch (parseError) {
      const text = await request.text();
      try {
        body = JSON.parse(text);
      } catch {
        console.error('Login parse error:', parseError, 'payload:', text);
        return NextResponse.json(
          { error: 'Petición inválida', details: 'JSON malformado' },
          { status: 400 }
        );
      }
    }

    const { email, password } = body || {};
    console.log('Login attempt:', email);

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
      console.log('Login valid', email);

      const token = jwt.sign(
        { userId: 'admin', email: ADMIN_EMAIL, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '4h' }
      );

      const response = NextResponse.json({
        success: true,
        user: {
          email: ADMIN_EMAIL,
          nombre: 'Administrador',
        },
      });

      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });

      // Duplicado no-http cookie para desarrollo si hay problemas de transportes.
      response.cookies.set('auth_token_plain', token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });

      console.log('Cookie set, returning response');
      return response;
    }

    return NextResponse.json(
      { error: 'Credenciales incorrectas' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error del servidor', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}