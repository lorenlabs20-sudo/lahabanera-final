import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Get configuracion (should be only one record)
export async function GET() {
  try {
    let configuracion = await db.configuracion.findFirst()

    // If no configuracion exists, create default one
    if (!configuracion) {
      configuracion = await db.configuracion.create({
        data: {
          telefono: '+53 5 3972047',
          email: 'lahaban3ra@gmail.com',
          whatsapp: '+53 5 3972047',
          direccion: 'Km 38-1/2, Carretera Central, San Pedro, San Jose de Las Lajas, Mayabeque, Cuba',
          instagram: null,
          facebook: null,
        },
      })
    }

    return NextResponse.json({ configuracion })
  } catch (error) {
    console.error('Error fetching configuracion:', error)
    return NextResponse.json(
      { error: 'Error al obtener configuración' },
      { status: 500 }
    )
  }
}

// PUT - Update configuracion
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { telefono, email, whatsapp, instagram, facebook, direccion } = body

    // Get existing configuracion
    let configuracion = await db.configuracion.findFirst()

    if (!configuracion) {
      // Create if doesn't exist
      configuracion = await db.configuracion.create({
        data: {
          telefono: telefono || '',
          email: email || '',
          whatsapp: whatsapp || '',
          direccion: direccion || '',
          instagram: instagram || null,
          facebook: facebook || null,
        },
      })
    } else {
      // Update existing
      configuracion = await db.configuracion.update({
        where: { id: configuracion.id },
        data: {
          telefono: telefono ?? configuracion.telefono,
          email: email ?? configuracion.email,
          whatsapp: whatsapp ?? configuracion.whatsapp,
          direccion: direccion ?? configuracion.direccion,
          instagram: instagram !== undefined ? instagram : configuracion.instagram,
          facebook: facebook !== undefined ? facebook : configuracion.facebook,
        },
      })
    }

    return NextResponse.json({ configuracion })
  } catch (error) {
    console.error('Error updating configuracion:', error)
    return NextResponse.json(
      { error: 'Error al actualizar configuración' },
      { status: 500 }
    )
  }
}
