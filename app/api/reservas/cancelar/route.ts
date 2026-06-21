import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { checkRateLimit } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  const permitido = await checkRateLimit(req, 'cancelar-reserva', 5, 10)
  if (!permitido) {
    return NextResponse.json({ success: false, error: 'Demasiados intentos. Espera unos minutos.' }, { status: 429 })
  }

  const { codigo, email } = await req.json()
  if (!codigo || !email) {
    return NextResponse.json({ success: false, error: 'Código y email son obligatorios.' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data: reserva } = await supabase
    .from('reservas')
    .select('id, estado, cliente:clientes(email)')
    .ilike('codigo', codigo.trim())
    .maybeSingle()

  const clienteEmail = Array.isArray(reserva?.cliente) ? reserva?.cliente[0]?.email : (reserva?.cliente as { email: string } | undefined)?.email
  if (!reserva || clienteEmail?.toLowerCase() !== email.trim().toLowerCase()) {
    return NextResponse.json({ success: false, error: 'No encontramos esa reserva.' }, { status: 404 })
  }

  if (reserva.estado === 'cancelada' || reserva.estado === 'completada') {
    return NextResponse.json({ success: false, error: 'Esta reserva ya no se puede cancelar.' }, { status: 400 })
  }

  await supabase.from('reservas').update({ cancelacion_solicitada: true }).eq('id', reserva.id)

  return NextResponse.json({ success: true })
}
