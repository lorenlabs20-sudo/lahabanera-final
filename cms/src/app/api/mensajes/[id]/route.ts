import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Get single mensaje
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const mensaje = await db.mensaje.findUnique({
      where: { id },
    })

    if (!mensaje) {
      return NextResponse.json(
        { error: 'Mensaje no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ mensaje })
  } catch (error) {
    console.error('Error fetching mensaje:', error)
    return NextResponse.json(
      { error: 'Error al obtener mensaje' },
      { status: 500 }
    )
  }
}

// PUT - Update mensaje (for marking as read)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { leido } = body

    // Check if mensaje exists
    const existingMensaje = await db.mensaje.findUnique({
      where: { id },
    })

    if (!existingMensaje) {
      return NextResponse.json(
        { error: 'Mensaje no encontrado' },
        { status: 404 }
      )
    }

    const mensaje = await db.mensaje.update({
      where: { id },
      data: {
        leido: leido !== undefined ? leido : existingMensaje.leido,
      },
    })

    return NextResponse.json({ mensaje })
  } catch (error) {
    console.error('Error updating mensaje:', error)
    return NextResponse.json(
      { error: 'Error al actualizar mensaje' },
      { status: 500 }
    )
  }
}

// DELETE - Delete mensaje
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if mensaje exists
    const mensaje = await db.mensaje.findUnique({
      where: { id },
    })

    if (!mensaje) {
      return NextResponse.json(
        { error: 'Mensaje no encontrado' },
        { status: 404 }
      )
    }

    await db.mensaje.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Mensaje eliminado correctamente',
    })
  } catch (error) {
    console.error('Error deleting mensaje:', error)
    return NextResponse.json(
      { error: 'Error al eliminar mensaje' },
      { status: 500 }
    )
  }
}
