import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

// 1. Obtener y VALIDAR estrictamente la variable
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('❌ ERROR CRÍTICO: JWT_SECRET no está definida en las variables de entorno.');
  // En producción, esto detiene la ejecución para evitar inseguridad
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Configuración de seguridad incompleta: Falta JWT_SECRET');
  }
  // En desarrollo, usamos un valor fallback solo para que TypeScript no llore, 
  // pero el login fallará o se logueará el error arriba.
  // NOTA: Lo ideal es que el proceso muera aquí mismo si es crítico.
}

export async function POST(request: Request) {
  try {
    // ... (código anterior de parseo del body) ...
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 });
    }

    // Validaciones básicas
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Formato de email inválido' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
    }

    // 2. Verificación doble de seguridad antes de usar JWT_SECRET
    if (!JWT_SECRET) {
       return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 });
    }

    // Buscar usuario
    const user = await db.usuario.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, nombre: true, rol: true, password: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
    }

    // 3. AHORA SÍ: TypeScript sabe que JWT_SECRET es un string aquí gracias al 'if' de arriba
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.rol }, // Ojo: era 'rol', debe ser 'role' si así está en la DB
      JWT_SECRET, 
      { expiresIn: '4h' }
    );

    const response = NextResponse.json({
      success: true,
      user: {
        email: user.email,
        nombre: user.nombre,
        role: user.rol,
      },
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 4,
    });

    console.log(`Login exitoso: ${user.email}`);
    return response;

  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}