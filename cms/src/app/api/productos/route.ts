import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - List all productos with categoria relation
export async function GET() {
  try {
    const productos = await db.producto.findMany({
      include: {
        categoria: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: {
        creadoEn: 'desc',
      },
    })

    return NextResponse.json({ productos })
  } catch (error) {
    console.error('Error fetching productos:', error)
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    )
  }
}

// POST - Create new producto
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nombre, descripcion, imagen, categoriaId, activo } = body

    if (!nombre || !categoriaId) {
      return NextResponse.json(
        { error: 'Nombre y categoriaId son requeridos' },
        { status: 400 }
      )
    }

    // Verify categoria exists
    const categoria = await db.categoria.findUnique({
      where: { id: categoriaId },
    })

    if (!categoria) {
      return NextResponse.json(
        { error: 'La categoría no existe' },
        { status: 400 }
      )
    }

    const producto = await db.producto.create({
      data: {
        nombre,
        descripcion: descripcion || null,
        imagen: imagen || null,
        categoriaId,
        activo: activo ?? true,
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

    return NextResponse.json({ producto }, { status: 201 })
  } catch (error) {
    console.error('Error creating producto:', error)
    return NextResponse.json(
      { error: 'Error al crear producto' },
      { status: 500 }
    )
  }
}
