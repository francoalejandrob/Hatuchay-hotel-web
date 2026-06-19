import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { enviarEmailContacto } from '@/lib/resend'

export async function POST(req: NextRequest) {
  try {
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
