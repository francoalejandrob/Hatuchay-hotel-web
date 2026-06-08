// iCal utilities — generation (export) + parsing (import from Airbnb/Booking.com)

export interface ReservaIcal {
  uid: string
  checkin: string    // YYYY-MM-DD
  checkout: string   // YYYY-MM-DD
  resumen?: string
}

export interface ICalEvent {
  uid: string
  dtStart: string    // YYYY-MM-DD
  dtEnd: string      // YYYY-MM-DD
  summary: string
}

// ── Export ────────────────────────────────────────────────────────────────────

export function generarICalFeed(
  reservas: ReservaIcal[],
  habitacionNombre: string,
  habitacionId: string
): string {
  const dtstamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hatuchay-inka.vercel.app'

  const eventos = reservas.map((r) => {
    const dtStart = r.checkin.replace(/-/g, '')
    const dtEnd = r.checkout.replace(/-/g, '')
    const uid = `${r.uid}@${new URL(siteUrl).hostname}`
    const summary = escapeICal(r.resumen ?? 'Reservado — Hatuchay Inka Apart Hotel')

    return [
      'BEGIN:VEVENT',
      `DTSTART;VALUE=DATE:${dtStart}`,
      `DTEND;VALUE=DATE:${dtEnd}`,
      `DTSTAMP:${dtstamp}`,
      `UID:${uid}`,
      `SUMMARY:${summary}`,
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'END:VEVENT',
    ].join('\r\n')
  })

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//Hatuchay Inka Apart Hotel//ES`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Hatuchay Inka - ${escapeICal(habitacionNombre)}`,
    `X-WR-CALDESC:Calendario de disponibilidad - Habitación ${habitacionId}`,
    'X-WR-TIMEZONE:America/Lima',
    ...eventos,
    'END:VCALENDAR',
  ]

  return lines.join('\r\n')
}

// ── Import / Parse ────────────────────────────────────────────────────────────

export function parsearICal(icalText: string): ICalEvent[] {
  const eventos: ICalEvent[] = []

  // Split by VEVENT blocks
  const partes = icalText.split(/BEGIN:VEVENT/gi)

  for (let i = 1; i < partes.length; i++) {
    const bloque = partes[i]

    const uid = leerProp(bloque, 'UID') ?? `externo-${i}-${Date.now()}`
    const dtStartRaw = leerProp(bloque, 'DTSTART')
    const dtEndRaw = leerProp(bloque, 'DTEND')
    const summary = leerProp(bloque, 'SUMMARY') ?? 'Reservado'

    if (!dtStartRaw || !dtEndRaw) continue

    const dtStart = normalizarFecha(dtStartRaw)
    const dtEnd = normalizarFecha(dtEndRaw)

    if (!dtStart || !dtEnd) continue

    eventos.push({ uid, dtStart, dtEnd, summary })
  }

  return eventos
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function leerProp(text: string, prop: string): string | null {
  // Matches PROP:value or PROP;PARAM=X:value (also handles folded lines)
  const regex = new RegExp(`^${prop}(?:;[^:\\r\\n]*)?:([^\\r\\n]+)`, 'mi')
  const match = text.match(regex)
  return match ? match[1].trim() : null
}

function normalizarFecha(raw: string): string | null {
  // Handles: 20260515, 20260515T140000Z, 20260515T140000
  const digits = raw.replace(/T.*$/, '').replace(/\D/g, '')
  if (digits.length >= 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`
  }
  return null
}

function escapeICal(text: string): string {
  return text.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, '\\n')
}
