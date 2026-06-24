import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { webhookTriggers } from '@/lib/webhook'

// GET - Get single categoria
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const categoria = await db.categoria.findUnique({
      where: { id },
      include: {
        productos: {
          orderBy: {
            creadoEn: 'desc',
          },
        },
        _count: {
          select: { productos: true },
        },
      },
    })

    if (!categoria) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      )
    }

    const result = {
      ...categoria,
      productoCount: categoria._count.productos,
      _count: undefined,
    }

    return NextResponse.json({ categoria: result })
  } catch (error) {
    console.error('Error fetching categoria:', error)
    return NextResponse.json(
      { error: 'Error al obtener categoría' },
      { status: 500 }
    )
  }
}

// PUT - Update categoria
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { nombre, descripcion } = body

    // Check if categoria exists
    const existingCategoria = await db.categoria.findUnique({
      where: { id },
    })

    if (!existingCategoria) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      )
    }

    // If nombre is being changed, check for duplicates
    if (nombre && nombre !== existingCategoria.nombre) {
      const duplicate = await db.categoria.findFirst({
        where: {
          nombre,
          id: { not: id },
        },
      })

      if (duplicate) {
        return NextResponse.json(
          { error: 'Ya existe una categoría con ese nombre' },
          { status: 400 }
        )
      }
    }

    const categoria = await db.categoria.update({
      where: { id },
      data: {
        nombre: nombre ?? existingCategoria.nombre,
        descripcion: descripcion !== undefined ? descripcion : existingCategoria.descripcion,
      },
    })

    // Disparar webhook para reconstruir el Portal
    webhookTriggers.categoriaActualizada(categoria.id)

    return NextResponse.json({ categoria })
  } catch (error) {
    console.error('Error updating categoria:', error)
    return NextResponse.json(
      { error: 'Error al actualizar categoría' },
      { status: 500 }
    )
  }
}

// DELETE - Delete categoria
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if categoria exists
    const categoria = await db.categoria.findUnique({
      where: { id },
      include: {
        _count: {
          select: { productos: true },
        },
      },
    })

    if (!categoria) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      )
    }

    // Check if categoria has productos
    if (categoria._count.productos > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar una categoría que tiene productos asociados' },
        { status: 400 }
      )
    }

    await db.categoria.delete({
      where: { id },
    })

    // Disparar webhook para reconstruir el Portal
    webhookTriggers.categoriaEliminada(id)

    return NextResponse.json({
      success: true,
      message: 'Categoría eliminada correctamente',
    })
  } catch (error) {
    console.error('Error deleting categoria:', error)
    return NextResponse.json(
      { error: 'Error al eliminar categoría' },
      { status: 500 }
    )
  }
}