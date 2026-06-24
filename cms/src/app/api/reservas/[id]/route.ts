import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Valid estados
const VALID_ESTADOS = ['pendiente', 'confirmada', 'cancelada']

// GET - Get single reserva
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const reserva = await db.reserva.findUnique({
      where: { id },
    })

    if (!reserva) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ reserva })
  } catch (error) {
    console.error('Error fetching reserva:', error)
    return NextResponse.json(
      { error: 'Error al obtener reserva' },
      { status: 500 }
    )
  }
}

// PUT - Update reserva (mainly for estado: pendiente/confirmada/cancelada)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { nombre, email, telefono, fecha, personas, comentarios, estado } = body

    // Check if reserva exists
    const existingReserva = await db.reserva.findUnique({
      where: { id },
    })

    if (!existingReserva) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      )
    }

    // Validate estado if provided
    if (estado && !VALID_ESTADOS.includes(estado)) {
      return NextResponse.json(
        { error: 'Estado inválido. Debe ser: pendiente, confirmada o cancelada' },
        { status: 400 }
      )
    }

    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Email inválido' },
          { status: 400 }
        )
      }
    }

    // Validate personas if provided
    if (personas !== undefined && (typeof personas !== 'number' || personas < 1)) {
      return NextResponse.json(
        { error: 'El número de personas debe ser mayor a 0' },
        { status: 400 }
      )
    }

    const reserva = await db.reserva.update({
      where: { id },
      data: {
        nombre: nombre ?? existingReserva.nombre,
        email: email ?? existingReserva.email,
        telefono: telefono !== undefined ? telefono : existingReserva.telefono,
        fecha: fecha ?? existingReserva.fecha,
        personas: personas ?? existingReserva.personas,
        comentarios: comentarios !== undefined ? comentarios : existingReserva.comentarios,
        estado: estado ?? existingReserva.estado,
      },
    })

    return NextResponse.json({ reserva })
  } catch (error) {
    console.error('Error updating reserva:', error)
    return NextResponse.json(
      { error: 'Error al actualizar reserva' },
      { status: 500 }
    )
  }
}

// DELETE - Delete reserva
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if reserva exists
    const reserva = await db.reserva.findUnique({
      where: { id },
    })

    if (!reserva) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      )
    }

    await db.reserva.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Reserva eliminada correctamente',
    })
  } catch (error) {
    console.error('Error deleting reserva:', error)
    return NextResponse.json(
      { error: 'Error al eliminar reserva' },
      { status: 500 }
    )
  }
}
