// ===========================================
// PUBLIC DATA API - Endpoint consolidado para el Portal
// ===========================================
// Este endpoint retorna todos los datos necesarios para el Portal Astro
// en una sola petición, optimizando la carga inicial.

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Obtener todos los datos públicos del CMS
// Este endpoint es público (sin autenticación) y optimizado para el Portal
export async function GET() {
  try {
    // Ejecutar todas las consultas en paralelo para mejor rendimiento
    const [productos, categorias, galeria, configuracion, heroSlides] = await Promise.all([
      // Productos activos con su categoría
      db.producto.findMany({
        where: { activo: true },
        include: {
          categoria: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
        orderBy: { creadoEn: 'desc' },
      }),

      // Todas las categorías con conteo de productos activos
      db.categoria.findMany({
        include: {
          _count: {
            select: {
              productos: {
                where: { activo: true },
              },
            },
          },
        },
        orderBy: { nombre: 'asc' },
      }),

      // Imágenes de la galería pública
      db.imagen.findMany({
        where: {
          enGaleria: true,
        },
        orderBy: { creadoEn: 'desc' },
      }),

      // Configuración del sitio
      db.configuracion.findFirst(),

      // ✅ HERO SLIDES - Slides activos del carrusel ordenados
      db.heroSlide.findMany({
        where: { activo: true },
        orderBy: { orden: 'asc' },
        select: {
          id: true,
          tipo: true,
          url: true,
          titulo: true,
          subtitulo: true,
          duracion: true,
          orden: true,
          activo: true,
        },
      }),
    ])

    // Transformar categorías para incluir el conteo directamente
    const categoriasConConteo = categorias.map((cat) => ({
      id: cat.id,
      nombre: cat.nombre,
      descripcion: cat.descripcion,
      productoCount: cat._count.productos,
    }))

    // Retornar todos los datos en una sola respuesta
    return NextResponse.json({
      // Metadatos
      generatedAt: new Date().toISOString(),
      version: '1.1', // ← Actualizar versión

      // Datos principales
      productos,
      categorias: categoriasConConteo,
      galeria,
      heroSlides, // ✅ Agregar slides del carrusel

      // Configuración del sitio
      configuracion: configuracion || {
        telefono: '',
        email: '',
        whatsapp: '',
        direccion: '',
        instagram: null,
        facebook: null,
      },
    })
  } catch (error) {
    console.error('Error fetching public data:', error)
    return NextResponse.json(
      { error: 'Error al obtener datos públicos' },
      { status: 500 }
    )
  }
}