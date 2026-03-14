import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Get single producto
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
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    })

    if (!producto) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ producto })
  } catch (error) {
    console.error('Error fetching producto:', error)
    return NextResponse.json(
      { error: 'Error al obtener producto' },
      { status: 500 }
    )
  }
}

// PUT - Update producto
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { nombre, descripcion, imagen, categoriaId, activo } = body

    // Check if producto exists
    const existingProducto = await db.producto.findUnique({
      where: { id },
    })

    if (!existingProducto) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // If categoriaId provided, verify it exists
    if (categoriaId) {
      const categoria = await db.categoria.findUnique({
        where: { id: categoriaId },
      })

      if (!categoria) {
        return NextResponse.json(
          { error: 'La categoría no existe' },
          { status: 400 }
        )
      }
    }

    const producto = await db.producto.update({
      where: { id },
      data: {
        nombre: nombre ?? existingProducto.nombre,
        descripcion: descripcion !== undefined ? descripcion : existingProducto.descripcion,
        imagen: imagen !== undefined ? imagen : existingProducto.imagen,
        categoriaId: categoriaId ?? existingProducto.categoriaId,
        activo: activo !== undefined ? activo : existingProducto.activo,
      },
      include: {
        categoria: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    })

    return NextResponse.json({ producto })
  } catch (error) {
    console.error('Error updating producto:', error)
    return NextResponse.json(
      { error: 'Error al actualizar producto' },
      { status: 500 }
    )
  }
}

// DELETE - Delete producto
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if producto exists
    const producto = await db.producto.findUnique({
      where: { id },
    })

    if (!producto) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    await db.producto.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Producto eliminado correctamente',
    })
  } catch (error) {
    console.error('Error deleting producto:', error)
    return NextResponse.json(
      { error: 'Error al eliminar producto' },
      { status: 500 }
    )
  }
}
