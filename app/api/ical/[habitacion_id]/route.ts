import { NextRequest, NextResponse } from 'next/server'
import { generarICalFeed } from '@/lib/ical'
import { HABITACIONES_DATA } from '@/lib/constants'
import { createServerClient } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: { habitacion_id: string } }
) {
  const { habitacion_id } = params

  const habitacion = HABITACIONES_DATA.find((h) => h.id === habitacion_id)
  if (!habitacion) {
    return NextResponse.json({ error: 'Habitación no encontrada' }, { status: 404 })
  }

  let reservasIcal: { uid: string; checkin: string; checkout: string; resumen?: string }[] = []

  try {
    const supabase = createServerClient()

    const { data: reservas } = await supabase
      .from('reservas')
      .select('id, codigo, fecha_checkin, fecha_checkout')
      .eq('habitacion_id', habitacion_id)
      .not('estado', 'in', '(cancelada,pago_rechazado)')

    reservasIcal = (reservas ?? []).map((r) => ({
      uid: `HTK-${r.codigo ?? r.id}`,
      checkin: r.fecha_checkin,
      checkout: r.fecha_checkout,
      resumen: 'Reservado — Hatuchay Inka Apart Hotel',
    }))
  } catch {
    // Supabase not configured yet — return empty calendar (no error to caller)
  }

  const ical = generarICalFeed(reservasIcal, habitacion.nombre, habitacion_id)

  return new NextResponse(ical, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `inline; filename="hatuchay-inka-${habitacion_id}.ics"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}
