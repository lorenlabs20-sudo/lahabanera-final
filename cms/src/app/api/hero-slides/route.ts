import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { webhookTriggers } from '@/lib/webhook'

// GET - Obtener todos los slides
export async function GET() {
  try {
    const slides = await db.heroSlide.findMany({
      orderBy: { orden: 'asc' }
    })

    return NextResponse.json({ slides })
  } catch (error) {
    console.error('Error fetching slides:', error)
    return NextResponse.json(
      { error: 'Error al obtener los slides' },
      { status: 500 }
    )
  }
}

// POST - Crear un nuevo slide
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tipo, url, titulo, subtitulo, duracion, orden, activo } = body

    // Validar datos requeridos
    if (!tipo || !url) {
      return NextResponse.json(
        { error: 'Tipo y URL son requeridos' },
        { status: 400 }
      )
    }

    // Validar tipo
    if (!['imagen', 'video'].includes(tipo)) {
      return NextResponse.json(
        { error: 'Tipo debe ser "imagen" o "video"' },
        { status: 400 }
      )
    }

    // Validar URL según tipo
    if (tipo === 'video') {
      const isYouTube = url.includes('youtube.com') || url.includes('youtu.be')
      const isVimeo = url.includes('vimeo.com')
      const isDirectVideo = url.match(/\.(mp4|webm|ogg)$/i)

      if (!isYouTube && !isVimeo && !isDirectVideo) {
        return NextResponse.json(
          { error: 'URL de video no válida. Soporta YouTube, Vimeo o videos directos (.mp4, .webm, .ogg)' },
          { status: 400 }
        )
      }
    }

    // Validar duración
    const duracionVal = duracion || 5
    if (duracionVal < 1 || duracionVal > 30) {
      return NextResponse.json(
        { error: 'La duración debe estar entre 1 y 30 segundos' },
        { status: 400 }
      )
    }

    // Obtener el orden más alto para el nuevo slide
    const slidesCount = await db.heroSlide.count()

    const slide = await db.heroSlide.create({
      data: {
        tipo,
        url,
        titulo: titulo || null,
        subtitulo: subtitulo || null,
        duracion: duracionVal,
        orden: orden !== undefined ? orden : slidesCount,
        activo: activo !== undefined ? activo : true,
      }
    })

    // Disparar webhook para reconstruir el portal
    webhookTriggers.configuracionActualizada()

    return NextResponse.json({ slide }, { status: 201 })
  } catch (error) {
    console.error('Error creating slide:', error)
    return NextResponse.json(
      { error: 'Error al crear el slide' },
      { status: 500 }
    )
  }
}