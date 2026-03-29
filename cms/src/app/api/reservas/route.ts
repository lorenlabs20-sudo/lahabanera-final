import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// GET - List all reservas (public route for now, protect later)
export async function GET() {
  try {
    const reservas = await db.reserva.findMany({
      orderBy: {
        creadoEn: 'desc',
      },
    })

    return NextResponse.json({ reservas }, { headers: CORS_HEADERS })
  } catch (error) {
    console.error('Error fetching reservas:', error)
    return NextResponse.json(
      { error: 'Error al obtener reservas' },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}

// POST - Create reserva from public form
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nombre, email, telefono, fecha, personas, comentarios } = body

    if (!nombre || !email || !fecha || !personas) {
      return NextResponse.json(
        { error: 'Nombre, email, fecha y número de personas son requeridos' },
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

    // Validate personas is a positive number
    if (typeof personas !== 'number' || personas < 1) {
      return NextResponse.json(
        { error: 'El número de personas debe ser mayor a 0' },
        { status: 400 }
      )
    }

    const reserva = await db.reserva.create({
      data: {
        nombre,
        email,
        telefono: telefono || null,
        fecha,
        personas,
        comentarios: comentarios || null,
        estado: 'pendiente',
      },
    })

    return NextResponse.json({ reserva }, { status: 201, headers: CORS_HEADERS })
  } catch (error) {
    console.error('Error creating reserva:', error)
    return NextResponse.json(
      { error: 'Error al crear reserva' },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}

export function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS })
}
