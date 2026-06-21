import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { enviarEmailContacto } from '@/lib/resend'
import { checkRateLimit } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  try {
    const permitido = await checkRateLimit(req, 'contacto', 5, 10)
    if (!permitido) {
      return NextResponse.json({ success: false, error: 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.' }, { status: 429 })
    }

    const { nombre, email, asunto, mensaje } = await req.json()

    if (!nombre || !email || !mensaje) {
      return NextResponse.json({ success: false, error: 'Faltan campos obligatorios.' }, { status: 400 })
    }

    const supabase = createServerClient()
    const { error: dbError } = await supabase
      .from('contactos')
      .insert({ nombre, email, asunto: asunto || null, mensaje })

    if (dbError) {
      console.error('Error guardando contacto:', dbError)
      return NextResponse.json({ success: false, error: 'Error al guardar el mensaje.' }, { status: 500 })
    }

    try {
      await enviarEmailContacto({ nombre, email, asunto, mensaje })
    } catch (emailError) {
      console.error('Error enviando email de contacto (no fatal):', emailError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contacto error:', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 })
  }
}
