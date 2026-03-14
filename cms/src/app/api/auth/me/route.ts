import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Obtener cookie
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [key, ...v] = c.trim().split('=');
      return [key, v.join('=')];
    })
  );

  const token = cookies['auth_token'];

  if (!token || token !== 'valid-admin-session') {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      email: 'admin@lahabanera.com',
      nombre: 'Administrador',
    },
  });
}
