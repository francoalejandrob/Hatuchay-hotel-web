import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { enviarWhatsApp, mensajeLlegada, mensajeReseña } from '@/lib/twilio'
import { formatearFecha } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerClient()
  const hoy = new Date()
  const manana = new Date(hoy.getTime() + 24 * 60 * 60 * 1000)
  const mananaStr = manana.toISOString().split('T')[0]
  const hoyStr = hoy.toISOString().split('T')[0]

  // Mensajes de llegada (24h antes del check-in)
  const { data: checkinsManana } = await supabase
    .from('reservas')
    .select('*, cliente:clientes(*)')
    .eq('fecha_checkin', mananaStr)
    .eq('estado', 'confirmada')

  for (const reserva of checkinsManana || []) {
    const whatsappNum = `+${reserva.cliente.whatsapp?.replace(/\D/g, '')}`
    await enviarWhatsApp(whatsappNum, mensajeLlegada({
      nombre: `${reserva.cliente.nombre} ${reserva.cliente.apellido}`,
      checkin: formatearFecha(reserva.fecha_checkin),
      codigo: reserva.codigo,
    }))
  }

  // Mensajes de reseña (2h post checkout = mismo día, ejecutar en la tarde)
  const { data: checkoutsHoy } = await supabase
    .from('reservas')
    .select('*, cliente:clientes(*)')
    .eq('fecha_checkout', hoyStr)
    .eq('estado', 'confirmada')

  for (const reserva of checkoutsHoy || []) {
    const whatsappNum = `+${reserva.cliente.whatsapp?.replace(/\D/g, '')}`
    await enviarWhatsApp(whatsappNum, mensajeReseña(`${reserva.cliente.nombre} ${reserva.cliente.apellido}`))
    await supabase.from('reservas').update({ estado: 'completada' }).eq('id', reserva.id)
  }

  return NextResponse.json({ success: true, llegadas: checkinsManana?.length || 0, checkouts: checkoutsHoy?.length || 0 })
}
