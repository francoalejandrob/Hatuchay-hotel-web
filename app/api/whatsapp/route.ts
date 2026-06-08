import { NextRequest, NextResponse } from 'next/server'
import { enviarWhatsApp } from '@/lib/twilio'

export async function POST(req: NextRequest) {
  try {
    const { destinatario, mensaje } = await req.json()
    if (!destinatario || !mensaje) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
    }
    await enviarWhatsApp(destinatario, mensaje)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Error al enviar WhatsApp.' }, { status: 500 })
  }
}
