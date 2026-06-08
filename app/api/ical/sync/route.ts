import { NextRequest, NextResponse } from 'next/server'
import { parsearICal } from '@/lib/ical'
import { createServerClient } from '@/lib/supabase'

// External iCal URLs — set these in Vercel env vars once you have the links from Airbnb/Booking.com
// Format per room: ICAL_AIRBNB_102, ICAL_BOOKING_102, etc.
const HABITACIONES = ['102', '105', '106', '107']
const FUENTES = ['airbnb', 'booking'] as const
type Fuente = typeof FUENTES[number]

function getIcalUrl(fuente: Fuente, habitacionId: string): string | undefined {
  const key = `ICAL_${fuente.toUpperCase()}_${habitacionId}`
  return process.env[key]
}

export async function GET(req: NextRequest) {
  // Protect with CRON_SECRET (same as other cron endpoints)
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const supabase = createServerClient()
  const resultados: Record<string, unknown> = {}
  let totalSincronizados = 0
  let totalErrores = 0

  for (const habitacionId of HABITACIONES) {
    resultados[habitacionId] = { sincronizados: 0, errores: [] as string[] }

    for (const fuente of FUENTES) {
      const url = getIcalUrl(fuente, habitacionId)
      if (!url) continue

      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'HatuchayInka-CalSync/1.0' },
          // No cache — always fresh
          cache: 'no-store',
        })

        if (!res.ok) throw new Error(`HTTP ${res.status} desde ${fuente}`)

        const icalText = await res.text()
        const eventos = parsearICal(icalText)

        // Upsert cada evento — uid_externo es único por habitación para evitar duplicados
        for (const evento of eventos) {
          const { error } = await supabase.from('bloqueos_externos').upsert(
            {
              habitacion_id: habitacionId,
              fecha_inicio: evento.dtStart,
              fecha_fin: evento.dtEnd,
              fuente,
              uid_externo: evento.uid,
              resumen: evento.summary,
              sincronizado_en: new Date().toISOString(),
            },
            { onConflict: 'habitacion_id,uid_externo' }
          )

          if (error) {
            console.error(`[iCal Sync] Error upsert ${fuente}/${habitacionId}:`, error.message)
          }
        }

        const r = resultados[habitacionId] as { sincronizados: number; errores: string[] }
        r.sincronizados += eventos.length
        totalSincronizados += eventos.length
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        const r = resultados[habitacionId] as { sincronizados: number; errores: string[] }
        r.errores.push(`${fuente}: ${msg}`)
        totalErrores++
        console.error(`[iCal Sync] ${fuente}/${habitacionId}: ${msg}`)
      }
    }
  }

  // Clean up old blocks (past dates no longer relevant)
  try {
    await supabase
      .from('bloqueos_externos')
      .delete()
      .lt('fecha_fin', new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10))
  } catch {
    // Non-fatal
  }

  return NextResponse.json({
    ok: true,
    totalSincronizados,
    totalErrores,
    resultados,
    timestamp: new Date().toISOString(),
  })
}
