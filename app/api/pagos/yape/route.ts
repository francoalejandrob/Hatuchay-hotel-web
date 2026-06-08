import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { enviarWhatsApp, mensajeAdminPagoPendiente } from '@/lib/twilio'

export async function POST(req: NextRequest) {
  try {
    const { reserva_id, num_operacion, comprobante_url } = await req.json()
    const supabase = createServerClient()

    await supabase.from('pagos').update({
      referencia_externa: num_operacion,
      comprobante_url,
      estado: 'pendiente',
    }).eq('reserva_id', reserva_id)

    await supabase.from('reservas').update({ estado: 'pago_pendiente_verificacion' }).eq('id', reserva_id)

    const { data: reserva } = await supabase
      .from('reservas')
      .select('*, cliente:clientes(*)')
      .eq('id', reserva_id)
      .single()

    if (reserva) {
      await enviarWhatsApp(
        process.env.NEXT_PUBLIC_HOTEL_WHATSAPP || '',
        mensajeAdminPagoPendiente({
          codigo: reserva.codigo,
          cliente: `${reserva.cliente.nombre} ${reserva.cliente.apellido}`,
          metodo: 'yape',
          monto: reserva.precio_total,
        })
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Error al registrar pago Yape.' }, { status: 500 })
  }
}
