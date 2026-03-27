import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { webhookTriggers } from '@/lib/webhook'

// GET - List all categorias with producto count
export async function GET() {
  try {
    const categorias = await db.categoria.findMany({
      include: {
        _count: {
          select: { productos: true },
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    })

    // Transform to include count directly
    const result = categorias.map((cat) => ({
      ...cat,
      productoCount: cat._count.productos,
      _count: undefined,
    }))

    return NextResponse.json({ categorias: result })
  } catch (error) {
    console.error('Error fetching categorias:', error)
    return NextResponse.json(
      { error: 'Error al obtener categorías' },
      { status: 500 }
    )
  }
}

// POST - Create new categoria
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nombre, descripcion } = body

    if (!nombre) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      )
    }

    // Check if categoria with same name exists
    const existingCategoria = await db.categoria.findFirst({
      where: { nombre },
    })

    if (existingCategoria) {
      return NextResponse.json(
        { error: 'Ya existe una categoría con ese nombre' },
        { status: 400 }
      )
    }

    const categoria = await db.categoria.create({
      data: {
        nombre,
        descripcion: descripcion || null,
      },
    })

    // Disparar webhook para reconstruir el Portal
    webhookTriggers.categoriaCreada(categoria.id)

    return NextResponse.json({ categoria }, { status: 201 })
  } catch (error) {
    console.error('Error creating categoria:', error)
    return NextResponse.json(
      { error: 'Error al crear categoría' },
      { status: 500 }
    )
  }
}