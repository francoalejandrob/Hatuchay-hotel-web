import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { enviarWhatsApp, mensajeConfirmacion } from '@/lib/twilio'
import { formatearFecha } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = createServerClient()

    // Niubiz webhook - verifica firma de Niubiz en producción
    const { transactionToken, dataMap } = body

    if (!transactionToken || !dataMap) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    const estado = dataMap.ACTION_CODE === '000' ? 'aprobado' : 'rechazado'
    const codigoReserva = dataMap.TRACE_NUMBER

    if (!codigoReserva) return NextResponse.json({ received: true })

    const { data: reserva } = await supabase
      .from('reservas')
      .select('*, cliente:clientes(*)')
      .eq('codigo', codigoReserva)
      .single()

    if (!reserva) return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })

    await supabase.from('pagos').update({
      estado,
      referencia_externa: transactionToken,
      fecha_pago: new Date().toISOString(),
    }).eq('reserva_id', reserva.id)

    if (estado === 'aprobado') {
      await supabase.from('reservas').update({ estado: 'confirmada' }).eq('id', reserva.id)

      const whatsappNum = `+${reserva.cliente.whatsapp?.replace(/\D/g, '')}`
      await enviarWhatsApp(whatsappNum, mensajeConfirmacion({
        nombre: `${reserva.cliente.nombre} ${reserva.cliente.apellido}`,
        codigo: reserva.codigo,
        habitacion: reserva.habitacion_id,
        checkin: formatearFecha(reserva.fecha_checkin),
        checkout: formatearFecha(reserva.fecha_checkout),
        huespedes: reserva.num_huespedes,
        total: reserva.precio_total,
      }))
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
