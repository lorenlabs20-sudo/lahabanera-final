import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { webhookTriggers } from '@/lib/webhook'

// GET - List all productos with categoria relation
export async function GET() {
  try {
    const productos = await db.producto.findMany({
      include: {
        categoria: {
          select: {
            id: true,
            nombre: true,
            _count: {  //  AÑADIR  este contador para tener controlada la cantidad de productos por categoria
              select: { productos: true }
            }
          },
        },
      },
      orderBy: {
        creadoEn: 'desc',
      },
    })

    // Transformar para incluir el contador en la respuesta
    const productosConContador = productos.map(producto => ({
      ...producto,
      categoria: producto.categoria ? {
        ...producto.categoria,
        productoCount: producto.categoria._count?.productos || 0
      } : null
    }))

    return NextResponse.json({ productos: productosConContador })
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
  console.log('===== POST /api/productos EJECUTÁNDOSE =====')

  try {
    const body = await request.json()
    const { nombre, descripcion, imagen, categoriaId, activo } = body

    console.log('Datos recibidos:', { nombre, categoriaId })

    if (!nombre || !categoriaId) {
      return NextResponse.json(
        { error: 'Nombre y categoriaId son requeridos' },
        { status: 400 }
      )
    }

    // Verify categoria exists y obtener su información
    const categoria = await db.categoria.findUnique({
      where: { id: categoriaId },
      include: {
        _count: {
          select: { productos: true }
        }
      }
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
            _count: {  // INCLUIR CONTADOR
              select: { productos: true }
            }
          },
        },
      },
    })

    console.log('Producto creado:', producto.nombre)

    // Transformar respuesta con contador actualizado
    const productoConContador = {
      ...producto,
      categoria: producto.categoria ? {
        ...producto.categoria,
        productoCount: producto.categoria._count?.productos || 0
      } : null
    }

    // Disparar webhook con la categoría para actualizar contador
    await webhookTriggers.productoCreado(producto.id)
    await webhookTriggers.categoriaActualizada(categoriaId)

    return NextResponse.json({ producto: productoConContador }, { status: 201 })
  } catch (error) {
    console.error('Error creating producto:', error)
    return NextResponse.json(
      { error: 'Error al crear producto' },
      { status: 500 }
    )
  }
}