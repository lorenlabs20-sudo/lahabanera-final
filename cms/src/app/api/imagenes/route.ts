import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { webhookTriggers } from '@/lib/webhook'

// Valid tipos
const VALID_TIPOS = ['producto', 'galeria', 'general']

// GET - List all imagenes
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo')
    const enGaleria = searchParams.get('enGaleria')

    const where: {
      tipo?: string
      enGaleria?: boolean
    } = {}

    if (tipo && VALID_TIPOS.includes(tipo)) {
      where.tipo = tipo
    }

    if (enGaleria !== null) {
      where.enGaleria = enGaleria === 'true'
    }

    const imagenes = await db.imagen.findMany({
      where,
      orderBy: {
        creadoEn: 'desc',
      },
    })

    return NextResponse.json({ imagenes })
  } catch (error) {
    console.error('Error fetching imagenes:', error)
    return NextResponse.json(
      { error: 'Error al obtener imágenes' },
      { status: 500 }
    )
  }
}

// POST - Create new imagen (for now just save URL, Supabase Storage later)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { url, nombre, alt, tipo, enGaleria } = body

    if (!url || !nombre) {
      return NextResponse.json(
        { error: 'URL y nombre son requeridos' },
        { status: 400 }
      )
    }

    // Validate tipo if provided
    if (tipo && !VALID_TIPOS.includes(tipo)) {
      return NextResponse.json(
        { error: 'Tipo inválido. Debe ser: producto, galeria o general' },
        { status: 400 }
      )
    }

    const imagen = await db.imagen.create({
      data: {
        url,
        nombre,
        alt: alt || null,
        tipo: tipo || 'general',
        enGaleria: enGaleria ?? false,
      },
    })

    // Disparar webhook si la imagen está en galería
    if (imagen.enGaleria) {
      webhookTriggers.imagenCreada(imagen.id)
    }

    return NextResponse.json({ imagen }, { status: 201 })
  } catch (error) {
    console.error('Error creating imagen:', error)
    return NextResponse.json(
      { error: 'Error al crear imagen' },
      { status: 500 }
    )
  }
}