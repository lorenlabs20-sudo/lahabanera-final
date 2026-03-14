import { NextResponse } from 'next/server';

// Credenciales hardcodeadas para simplicidad
const ADMIN_EMAIL = 'admin@lahabanera.com';
const ADMIN_PASSWORD = 'Habanera2025!';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('Login attempt:', email);

    // Validacion simple
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Verificar credenciales (case-insensitive email)
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
      console.log('Login valid');
      
      // Crear respuesta exitosa
      const response = NextResponse.json({
        success: true,
        user: {
          email: ADMIN_EMAIL,
          nombre: 'Administrador',
        },
      });

      // Cookie con valor que el middleware espera
      response.cookies.set('auth_token', 'valid-admin-session', {
        httpOnly: true,
        secure: false, // false para desarrollo
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 dias
        path: '/',
      });

      return response;
    }

    console.log('Invalid credentials');
    return NextResponse.json(
      { error: 'Credenciales incorrectas' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    );
  }
}
