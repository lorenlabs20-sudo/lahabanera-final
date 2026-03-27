import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { webhookTriggers } from '@/lib/webhook'

// GET /api/productos/[id] - Obtener producto por id
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const producto = await db.producto.findUnique({
      where: { id },
      include: {
        categoria: {
          select: { id: true, nombre: true },
        },
      },
    })

    if (!producto) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ producto })
  } catch (error) {
    console.error('Error fetching producto:', error)
    return NextResponse.json({ error: 'Error al obtener producto' }, { status: 500 })
  }
}

// PUT /api/productos/[id] - Actualizar producto (activo, nombre, etc)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('[API] PUT /api/productos/' + id)
    const body = await request.json()
    console.log('[API] PUT body:', body)
    const { nombre, descripcion, imagen, categoriaId, activo } = body

    const dataToUpdate: any = {}
    if (nombre !== undefined) dataToUpdate.nombre = nombre
    if (descripcion !== undefined) dataToUpdate.descripcion = descripcion
    if (imagen !== undefined) dataToUpdate.imagen = imagen
    if (categoriaId !== undefined) dataToUpdate.categoriaId = categoriaId
    if (activo !== undefined) dataToUpdate.activo = activo

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 })
    }

    const existing = await db.producto.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    if (categoriaId !== undefined) {
      const categoria = await db.categoria.findUnique({ where: { id: categoriaId } })
      if (!categoria) {
        return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 400 })
      }
    }

    const producto = await db.producto.update({
      where: { id },
      data: dataToUpdate,
      include: {
        categoria: { select: { id: true, nombre: true } },
      },
    })

    webhookTriggers.productoActualizado(producto.id)

    return NextResponse.json({ producto })
  } catch (error) {
    console.error('Error updating producto:', error)
    return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 })
  }
}

// DELETE /api/productos/[id] - Eliminar producto
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('[API] DELETE /api/productos/' + id)

    const existing = await db.producto.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    await db.producto.delete({ where: { id } })

    webhookTriggers.productoEliminado(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting producto:', error)
    return NextResponse.json({ error: 'Error al eliminar producto' }, { status: 500 })
  }
}
