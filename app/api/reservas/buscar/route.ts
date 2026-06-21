import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { checkRateLimit } from '@/lib/rateLimit'

export async function GET(req: NextRequest) {
  const permitido = await checkRateLimit(req, 'buscar-reserva', 10, 10)
  if (!permitido) {
    return NextResponse.json({ success: false, error: 'Demasiados intentos. Espera unos minutos.' }, { status: 429 })
  }

  const { searchParams } = new URL(req.url)
  const codigo = searchParams.get('codigo')?.trim().toUpperCase()
  const email = searchParams.get('email')?.trim().toLowerCase()

  if (!codigo || !email) {
    return NextResponse.json({ success: false, error: 'Código y email son obligatorios.' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data: reserva } = await supabase
    .from('reservas')
    .select('*, cliente:clientes(nombre, apellido, email)')
    .ilike('codigo', codigo)
    .maybeSingle()

  if (!reserva || reserva.cliente?.email?.toLowerCase() !== email) {
    return NextResponse.json({ success: false, error: 'No encontramos una reserva con ese código y email.' }, { status: 404 })
  }

  return NextResponse.json({ success: true, reserva })
}
