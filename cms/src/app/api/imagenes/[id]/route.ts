import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Get single imagen
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const imagen = await db.imagen.findUnique({
      where: { id },
    })

    if (!imagen) {
      return NextResponse.json(
        { error: 'Imagen no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ imagen })
  } catch (error) {
    console.error('Error fetching imagen:', error)
    return NextResponse.json(
      { error: 'Error al obtener imagen' },
      { status: 500 }
    )
  }
}

// PUT - Update imagen
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { nombre, alt, tipo, enGaleria } = body

    // Check if imagen exists
    const existingImagen = await db.imagen.findUnique({
      where: { id },
    })

    if (!existingImagen) {
      return NextResponse.json(
        { error: 'Imagen no encontrada' },
        { status: 404 }
      )
    }

    const VALID_TIPOS = ['producto', 'galeria', 'general']
    if (tipo && !VALID_TIPOS.includes(tipo)) {
      return NextResponse.json(
        { error: 'Tipo inválido. Debe ser: producto, galeria o general' },
        { status: 400 }
      )
    }

    const imagen = await db.imagen.update({
      where: { id },
      data: {
        nombre: nombre ?? existingImagen.nombre,
        alt: alt !== undefined ? alt : existingImagen.alt,
        tipo: tipo ?? existingImagen.tipo,
        enGaleria: enGaleria !== undefined ? enGaleria : existingImagen.enGaleria,
      },
    })

    return NextResponse.json({ imagen })
  } catch (error) {
    console.error('Error updating imagen:', error)
    return NextResponse.json(
      { error: 'Error al actualizar imagen' },
      { status: 500 }
    )
  }
}

// DELETE - Delete imagen
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if imagen exists
    const imagen = await db.imagen.findUnique({
      where: { id },
    })

    if (!imagen) {
      return NextResponse.json(
        { error: 'Imagen no encontrada' },
        { status: 404 }
      )
    }

    // TODO: Also delete from Supabase Storage when implemented

    await db.imagen.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Imagen eliminada correctamente',
    })
  } catch (error) {
    console.error('Error deleting imagen:', error)
    return NextResponse.json(
      { error: 'Error al eliminar imagen' },
      { status: 500 }
    )
  }
}
