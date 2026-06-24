import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// GET - List all mensajes
export async function GET() {
  try {
    const mensajes = await db.mensaje.findMany({
      orderBy: {
        creadoEn: 'desc',
      },
    })

    return NextResponse.json({ mensajes }, { headers: CORS_HEADERS })
  } catch (error) {
    console.error('Error fetching mensajes:', error)
    return NextResponse.json(
      { error: 'Error al obtener mensajes' },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}

// POST - Create mensaje from public contact form
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nombre, email, telefono, asunto, mensaje } = body

    if (!nombre || !email || !asunto || !mensaje) {
      return NextResponse.json(
        { error: 'Nombre, email, asunto y mensaje son requeridos' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    const nuevoMensaje = await db.mensaje.create({
      data: {
        nombre,
        email,
        telefono: telefono || null,
        asunto,
        mensaje,
        leido: false,
      },
    })

    return NextResponse.json({ mensaje: nuevoMensaje }, { status: 201, headers: CORS_HEADERS })
  } catch (error) {
    console.error('Error creating mensaje:', error)
    return NextResponse.json(
      { error: 'Error al enviar mensaje' },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}

export function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS })
}
