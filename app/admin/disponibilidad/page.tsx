'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { ChevronLeft, ChevronRight, Trash2, Lock } from 'lucide-react'
import { HABITACIONES_DATA } from '@/lib/constants'

interface Bloqueo {
  id: string
  habitacion_id: string
  fecha_inicio: string
  fecha_fin: string
  motivo?: string
}

interface ReservaSimple {
  id: string
  fecha_checkin: string
  fecha_checkout: string
  estado: string
  codigo: string
}

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function isInRange(dateStr: string, inicio: string, fin: string) {
  return dateStr >= inicio && dateStr <= fin
}

export default function DisponibilidadPage() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [habId, setHabId] = useState(HABITACIONES_DATA[0].id)
  const [bloqueos, setBloqueos] = useState<Bloqueo[]>([])
  const [reservas, setReservas] = useState<ReservaSimple[]>([])
  const [loading, setLoading] = useState(true)

  // Block form
  const [showForm, setShowForm] = useState(false)
  const [formInicio, setFormInicio] = useState('')
  const [formFin, setFormFin] = useState('')
  const [formMotivo, setFormMotivo] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const inicioMes = toDateStr(year, month, 1)
    const finMes = toDateStr(year, month, new Date(year, month + 1, 0).getDate())

    const [{ data: bData }, { data: rData }] = await Promise.all([
      supabase.from('bloqueos').select('*').eq('habitacion_id', habId),
      supabase
        .from('reservas')
        .select('id, fecha_checkin, fecha_checkout, estado, codigo')
        .eq('habitacion_id', habId)
        .in('estado', ['confirmada', 'pago_pendiente_verificacion', 'pendiente'])
        .or(`fecha_checkin.lte.${finMes},fecha_checkout.gte.${inicioMes}`),
    ])

    setBloqueos((bData as Bloqueo[]) ?? [])
    setReservas((rData as ReservaSimple[]) ?? [])
    setLoading(false)
  }, [habId, year, month])

  useEffect(() => { fetchData() }, [fetchData])

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const getDayStatus = (day: number): 'reservado' | 'pendiente' | 'bloqueado' | 'libre' => {
    const d = toDateStr(year, month, day)
    const reserva = reservas.find(r => {
      const ci = r.fecha_checkin
      const co = r.fecha_checkout
      return d >= ci && d < co
    })
    if (reserva) return reserva.estado === 'confirmada' ? 'reservado' : 'pendiente'
    const bloqueado = bloqueos.some(b => isInRange(d, b.fecha_inicio, b.fecha_fin))
    return bloqueado ? 'bloqueado' : 'libre'
  }

  const getReservaForDay = (day: number) => {
    const d = toDateStr(year, month, day)
    return reservas.find(r => d >= r.fecha_checkin && d < r.fecha_checkout)
  }

  const addBloqueo = async () => {
    if (!formInicio || !formFin || formInicio > formFin) return
    setSaving(true)
    await supabase.from('bloqueos').insert({
      habitacion_id: habId,
      fecha_inicio: formInicio,
      fecha_fin: formFin,
      motivo: formMotivo || null,
    })
    setSaving(false)
    setShowForm(false)
    setFormInicio('')
    setFormFin('')
    setFormMotivo('')
    fetchData()
  }

  const deleteBloqueo = async (id: string) => {
    await supabase.from('bloqueos').delete().eq('id', id)
    fetchData()
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const todayStr = today.toISOString().split('T')[0]

  const habActual = HABITACIONES_DATA.find(h => h.id === habId)
  const bloqueosMes = bloqueos.filter(b => b.fecha_fin >= toDateStr(year, month, 1) && b.fecha_inicio <= toDateStr(year, month, daysInMonth))

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Disponibilidad</h1>
          <p className="text-ink/40 text-sm mt-0.5">Gestiona la ocupación y bloqueos por habitación</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors self-start sm:self-auto"
        >
          <Lock size={14} /> Bloquear fechas
        </button>
      </div>

      {/* Room selector */}
      <div className="flex flex-wrap gap-2 mb-5">
        {HABITACIONES_DATA.map(h => (
          <button
            key={h.id}
            onClick={() => setHabId(h.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
              habId === h.id
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white text-ink/60 border-gray-200 hover:border-primary/40 hover:text-primary'
            }`}
          >
            Hab. {h.id}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-5">
            <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-ink/50">
              <ChevronLeft size={18} />
            </button>
            <h2 className="font-semibold text-primary">
              {MESES[month]} {year} — {habActual?.nombre}
            </h2>
            <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-ink/50">
              <ChevronRight size={18} />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {DIAS.map(d => (
                  <div key={d} className="text-center text-xs text-ink/35 py-2 font-medium">{d}</div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1">
                {Array(firstDayOfMonth).fill(null).map((_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const status = getDayStatus(day)
                  const dateStr = toDateStr(year, month, day)
                  const isToday = dateStr === todayStr
                  const reserva = getReservaForDay(day)
                  const isPast = dateStr < todayStr

                  return (
                    <div
                      key={day}
                      title={reserva ? `${reserva.codigo}` : status === 'bloqueado' ? 'Bloqueado' : ''}
                      className={`
                        relative aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-colors
                        ${status === 'reservado' ? 'bg-green-100 text-green-800' : ''}
                        ${status === 'pendiente' ? 'bg-orange-100 text-orange-700' : ''}
                        ${status === 'bloqueado' ? 'bg-gray-200 text-gray-400' : ''}
                        ${status === 'libre' && !isPast ? 'bg-[#f4f3f0] text-ink/70' : ''}
                        ${status === 'libre' && isPast ? 'text-ink/25' : ''}
                        ${isToday ? 'ring-2 ring-secondary ring-offset-1' : ''}
                      `}
                    >
                      {day}
                    </div>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-gray-100">
                {[
                  { color: 'bg-green-100', text: 'text-green-800', label: 'Confirmada' },
                  { color: 'bg-orange-100', text: 'text-orange-700', label: 'Pendiente' },
                  { color: 'bg-gray-200', text: 'text-gray-500', label: 'Bloqueado' },
                  { color: 'bg-[#f4f3f0]', text: 'text-ink/70', label: 'Disponible' },
                ].map(({ color, text, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className={`w-4 h-4 rounded ${color}`} />
                    <span className={`text-xs ${text}`}>{label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Block form */}
          {showForm && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
                <Lock size={15} /> Bloquear fechas — Hab. {habId}
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">Desde</label>
                  <input
                    type="date"
                    value={formInicio}
                    min={todayStr}
                    onChange={e => setFormInicio(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary bg-[#fafaf9]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">Hasta</label>
                  <input
                    type="date"
                    value={formFin}
                    min={formInicio || todayStr}
                    onChange={e => setFormFin(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary bg-[#fafaf9]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">Motivo (opcional)</label>
                  <input
                    type="text"
                    value={formMotivo}
                    onChange={e => setFormMotivo(e.target.value)}
                    placeholder="Ej: Mantenimiento, uso personal..."
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary bg-[#fafaf9]"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={addBloqueo}
                    disabled={!formInicio || !formFin || saving}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Guardando...' : 'Confirmar bloqueo'}
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2.5 rounded-xl text-sm border border-gray-200 hover:bg-gray-50 transition-colors text-ink/50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Active blocks */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
              <Lock size={15} /> Bloqueos activos
            </h3>
            {bloqueosMes.length === 0 ? (
              <p className="text-sm text-ink/35 text-center py-4">No hay bloqueos este mes</p>
            ) : (
              <div className="space-y-2">
                {bloqueosMes.map(b => (
                  <div key={b.id} className="flex items-start justify-between gap-2 p-3 bg-gray-50 rounded-xl">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink">{b.fecha_inicio} → {b.fecha_fin}</p>
                      {b.motivo && <p className="text-xs text-ink/45 mt-0.5 truncate">{b.motivo}</p>}
                    </div>
                    <button
                      onClick={() => deleteBloqueo(b.id)}
                      className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-100 text-ink/30 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* This month reservations */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-primary mb-3">Reservas del mes</h3>
            {reservas.length === 0 ? (
              <p className="text-sm text-ink/35 text-center py-4">No hay reservas este mes</p>
            ) : (
              <div className="space-y-2">
                {reservas.map(r => (
                  <div key={r.id} className="p-3 bg-[#f4f3f0] rounded-xl">
                    <p className="text-xs font-bold text-primary">{r.codigo}</p>
                    <p className="text-xs text-ink/50 mt-0.5">{r.fecha_checkin} → {r.fecha_checkout}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
