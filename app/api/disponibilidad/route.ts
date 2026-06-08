import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const habitacion_id = searchParams.get('habitacion_id')
  const checkin = searchParams.get('checkin')
  const checkout = searchParams.get('checkout')

  if (!habitacion_id || !checkin || !checkout) {
    return NextResponse.json({ disponible: false, error: 'Faltan parámetros' }, { status: 400 })
  }

  const supabase = createServerClient()

  const { data: reservas } = await supabase
    .from('reservas')
    .select('id, fecha_checkin, fecha_checkout')
    .eq('habitacion_id', habitacion_id)
    .not('estado', 'in', '(cancelada,pago_rechazado)')
    .or(`fecha_checkin.lt.${checkout},fecha_checkout.gt.${checkin}`)

  const { data: bloqueos } = await supabase
    .from('bloqueos')
    .select('fecha_inicio, fecha_fin')
    .eq('habitacion_id', habitacion_id)
    .lt('fecha_inicio', checkout)
    .gt('fecha_fin', checkin)

  // External platform blocks (Airbnb, Booking.com) synced via iCal
  const { data: bloqueos_externos } = await supabase
    .from('bloqueos_externos')
    .select('fecha_inicio, fecha_fin')
    .eq('habitacion_id', habitacion_id)
    .lt('fecha_inicio', checkout)
    .gt('fecha_fin', checkin)

  const disponible =
    (!reservas || reservas.length === 0) &&
    (!bloqueos || bloqueos.length === 0) &&
    (!bloqueos_externos || bloqueos_externos.length === 0)

  const { data: todasReservas } = await supabase
    .from('reservas')
    .select('fecha_checkin, fecha_checkout')
    .eq('habitacion_id', habitacion_id)
    .not('estado', 'in', '(cancelada,pago_rechazado)')

  const { data: todosBloqueos } = await supabase
    .from('bloqueos_externos')
    .select('fecha_inicio, fecha_fin')
    .eq('habitacion_id', habitacion_id)
    .gte('fecha_fin', new Date().toISOString().slice(0, 10))

  const fechasOcupadas = [
    ...(todasReservas || []).map((r) => ({
      from: new Date(r.fecha_checkin),
      to: new Date(r.fecha_checkout),
    })),
    ...(todosBloqueos || []).map((b) => ({
      from: new Date(b.fecha_inicio),
      to: new Date(b.fecha_fin),
    })),
  ]

  return NextResponse.json({ disponible, fechasOcupadas })
}
