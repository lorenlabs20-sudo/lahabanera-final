import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-for-dev';

export async function GET(request: Request) {
  // `request.cookies` no siempre está disponible en handler de ruta (Request tipo Fetch)
  // usamos cabecera Cookie para compatibilidad total.
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader
      .split(';')
      .filter(Boolean)
      .map((c) => {
        const [key, ...v] = c.trim().split('=');
        return [key, v.join('=')];
      })
  );

  const token = cookies['auth_token'] || '';
  console.log('auth/me token (dev trace):', token ? 'PRESENT' : 'MISSING');

  if (!token) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return NextResponse.json({
      authenticated: true,
      user: {
        email: decoded.email,
        nombre: 'Administrador',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Token invalido' }, { status: 401 });
  }
}
