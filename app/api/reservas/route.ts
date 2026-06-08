import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { generarCodigoReserva } from '@/lib/utils'
import { enviarEmailConfirmacion } from '@/lib/resend'
import { enviarWhatsApp, mensajeConfirmacion, mensajePagoVerificacion, mensajeAdminPagoPendiente } from '@/lib/twilio'
import { formatearFecha } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData()

    const habitacion_id = body.get('habitacion_id') as string
    const checkin = body.get('checkin') as string
    const checkout = body.get('checkout') as string
    const num_huespedes = Number(body.get('num_huespedes'))
    const noches = Number(body.get('noches'))
    const precio_total = Number(body.get('precio_total'))
    const metodo_pago = body.get('metodo_pago') as string
    const nombre = body.get('nombre') as string
    const apellido = body.get('apellido') as string
    const email = body.get('email') as string
    const whatsapp = body.get('whatsapp') as string
    const pais = body.get('pais') as string
    const notas = body.get('notas') as string
    const num_operacion = body.get('num_operacion') as string
    const comprobante = body.get('comprobante') as File | null

    const supabase = createServerClient()
    const codigo = generarCodigoReserva()

    // Upsert client
    const { data: clienteData, error: clienteError } = await supabase
      .from('clientes')
      .upsert({ nombre, apellido, email, whatsapp, pais }, { onConflict: 'email' })
      .select()
      .single()

    if (clienteError) {
      console.error('Error cliente:', clienteError)
      return NextResponse.json({ success: false, error: 'Error al registrar cliente.' }, { status: 500 })
    }

    let comprobante_url = null
    if (comprobante && comprobante.size > 0) {
      const bytes = await comprobante.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const fileName = `comprobantes/${codigo}-${Date.now()}.${comprobante.name.split('.').pop()}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('comprobantes')
        .upload(fileName, buffer, { contentType: comprobante.type })
      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage.from('comprobantes').getPublicUrl(fileName)
        comprobante_url = urlData.publicUrl
      }
    }

    const esNiubiz = metodo_pago === 'niubiz'
    const estado = esNiubiz ? 'confirmada' : 'pago_pendiente_verificacion'

    const { data: reserva, error: reservaError } = await supabase
      .from('reservas')
      .insert({
        codigo,
        cliente_id: clienteData.id,
        habitacion_id,
        fecha_checkin: checkin,
        fecha_checkout: checkout,
        num_huespedes,
        noches,
        precio_total,
        estado,
        notas,
      })
      .select()
      .single()

    if (reservaError) {
      console.error('Error reserva:', reservaError)
      return NextResponse.json({ success: false, error: 'Error al crear reserva.' }, { status: 500 })
    }

    await supabase.from('pagos').insert({
      reserva_id: reserva.id,
      monto: precio_total,
      moneda: 'PEN',
      metodo: metodo_pago,
      estado: esNiubiz ? 'aprobado' : 'pendiente',
      referencia_externa: num_operacion || null,
      comprobante_url,
    })

    // WhatsApp notifications
    const nombreCompleto = `${nombre} ${apellido}`
    const whatsappNum = `+${whatsapp.replace(/\D/g, '')}`

    try {
      if (esNiubiz) {
        await enviarWhatsApp(whatsappNum, mensajeConfirmacion({
          nombre: nombreCompleto,
          codigo,
          habitacion: habitacion_id,
          checkin: formatearFecha(checkin),
          checkout: formatearFecha(checkout),
          huespedes: num_huespedes,
          total: precio_total,
        }))
      } else {
        await enviarWhatsApp(whatsappNum, mensajePagoVerificacion(metodo_pago))
        await enviarWhatsApp(
          process.env.NEXT_PUBLIC_HOTEL_WHATSAPP || '',
          mensajeAdminPagoPendiente({
            codigo,
            cliente: nombreCompleto,
            metodo: metodo_pago,
            monto: precio_total,
          })
        )
      }

      // Email
      await enviarEmailConfirmacion({
        email,
        nombre: nombreCompleto,
        codigo,
        habitacion: habitacion_id,
        checkin: formatearFecha(checkin),
        checkout: formatearFecha(checkout),
        noches,
        huespedes: num_huespedes,
        total: precio_total,
      })

      await supabase.from('reservas').update({ whatsapp_enviado: true, email_enviado: true }).eq('id', reserva.id)
    } catch (notifError) {
      console.error('Notification error (non-fatal):', notifError)
    }

    return NextResponse.json({
      success: true,
      reserva_id: reserva.id,
      codigo,
      estado,
    })
  } catch (error) {
    console.error('Reserva error:', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const supabase = createServerClient()

  const page = Number(searchParams.get('page') || 1)
  const limit = Number(searchParams.get('limit') || 20)
  const estado = searchParams.get('estado')

  let query = supabase
    .from('reservas')
    .select('*, cliente:clientes(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (estado) query = query.eq('estado', estado)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data, count, page, limit })
}
