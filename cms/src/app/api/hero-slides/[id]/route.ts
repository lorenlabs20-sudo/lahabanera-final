import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { webhookTriggers } from '@/lib/webhook'

// GET - Obtener un slide por ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'ID de slide requerido' },
        { status: 400 }
      )
    }

    const slide = await db.heroSlide.findUnique({
      where: { id }
    })

    if (!slide) {
      return NextResponse.json(
        { error: 'Slide no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ slide })
  } catch (error) {
    console.error('Error fetching slide:', error)
    return NextResponse.json(
      { error: 'Error al obtener el slide' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar un slide
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'ID de slide requerido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { tipo, url, titulo, subtitulo, duracion, orden, activo } = body

    // Validaciones
    if (tipo && !['imagen', 'video'].includes(tipo)) {
      return NextResponse.json(
        { error: 'Tipo debe ser "imagen" o "video"' },
        { status: 400 }
      )
    }

    if (url) {
      if (tipo === 'video' || body.tipo === 'video') {
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
    }

    if (duracion !== undefined && (duracion < 1 || duracion > 30)) {
      return NextResponse.json(
        { error: 'La duración debe estar entre 1 y 30 segundos' },
        { status: 400 }
      )
    }

    if (orden !== undefined && orden < 0) {
      return NextResponse.json(
        { error: 'El orden debe ser un número positivo' },
        { status: 400 }
      )
    }

    // Verificar que el slide existe
    const existingSlide = await db.heroSlide.findUnique({
      where: { id }
    })

    if (!existingSlide) {
      return NextResponse.json(
        { error: 'Slide no encontrado' },
        { status: 404 }
      )
    }

    const slide = await db.heroSlide.update({
      where: { id },
      data: {
        tipo: tipo || undefined,
        url: url || undefined,
        titulo: titulo !== undefined ? titulo : undefined,
        subtitulo: subtitulo !== undefined ? subtitulo : undefined,
        duracion: duracion || undefined,
        orden: orden !== undefined ? orden : undefined,
        activo: activo !== undefined ? activo : undefined,
      }
    })

    webhookTriggers.configuracionActualizada()

    return NextResponse.json({ slide })
  } catch (error) {
    console.error('Error updating slide:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el slide' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un slide
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'ID de slide requerido' },
        { status: 400 }
      )
    }

    // Verificar que el slide existe
    const existingSlide = await db.heroSlide.findUnique({
      where: { id }
    })

    if (!existingSlide) {
      return NextResponse.json(
        { error: 'Slide no encontrado' },
        { status: 404 }
      )
    }

    await db.heroSlide.delete({
      where: { id }
    })

    webhookTriggers.configuracionActualizada()

    return NextResponse.json({ message: 'Slide eliminado correctamente' })
  } catch (error) {
    console.error('Error deleting slide:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el slide' },
      { status: 500 }
    )
  }
}