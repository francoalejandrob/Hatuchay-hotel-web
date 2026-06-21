'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, CheckCircle, XCircle, Clock, X, Eye, ChevronLeft, ChevronRight, ExternalLink, Plus, Download } from 'lucide-react'
import { formatearPrecio, formatearFecha, etiquetaEstado, calcularNoches, generarCodigoReserva } from '@/lib/utils'
import { HABITACIONES_DATA } from '@/lib/constants'
import type { Reserva } from '@/types'

const LIMIT = 15

const ESTADOS: { value: string; label: string }[] = [
  { value: '', label: 'Todas' },
  { value: 'pago_pendiente_verificacion', label: 'Verificando pago' },
  { value: 'confirmada', label: 'Confirmadas' },
  { value: 'completada', label: 'Completadas' },
  { value: 'cancelada', label: 'Canceladas' },
  { value: 'pago_rechazado', label: 'Pago rechazado' },
]

const METODOS: Record<string, string> = {
  yape: 'Yape',
  transferencia_bancaria: 'Transferencia',
}

interface Pago {
  metodo: string
  estado: string
  comprobante_url?: string
  referencia_externa?: string
  monto?: number
}

interface ReservaDetalle extends Reserva {
  pagos?: Pago[]
}

export default function ReservasAdminPage() {
  const [reservas, setReservas] = useState<ReservaDetalle[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [selected, setSelected] = useState<ReservaDetalle | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  // Nueva reserva manual
  const [showNueva, setShowNueva] = useState(false)
  const [nuevaSaving, setNuevaSaving] = useState(false)
  const [nuevaError, setNuevaError] = useState('')
  const [nueva, setNueva] = useState({
    habitacion_id: HABITACIONES_DATA[0].id,
    checkin: '',
    checkout: '',
    num_huespedes: 2,
    nombre: '',
    apellido: '',
    email: '',
    whatsapp: '',
    pais: 'Perú',
    precio_total: '',
    estado: 'confirmada',
    notas: '',
  })

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 350)
    return () => clearTimeout(t)
  }, [search])

  const fetchReservas = useCallback(async () => {
    setLoading(true)

    let clienteIds: string[] = []
    if (debouncedSearch && !debouncedSearch.toUpperCase().startsWith('HTK')) {
      const { data: clientes } = await supabase
        .from('clientes')
        .select('id')
        .or(`nombre.ilike.%${debouncedSearch}%,apellido.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%`)
        .limit(100)
      clienteIds = clientes?.map((c: { id: string }) => c.id) ?? []
    }

    let query = supabase
      .from('reservas')
      .select('*, cliente:clientes(*), pagos(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * LIMIT, page * LIMIT - 1)

    if (estadoFilter) query = query.eq('estado', estadoFilter)

    if (debouncedSearch) {
      if (debouncedSearch.toUpperCase().startsWith('HTK')) {
        query = query.ilike('codigo', `%${debouncedSearch}%`)
      } else if (clienteIds.length > 0) {
        query = query.in('cliente_id', clienteIds)
      }
    }

    const { data, count } = await query
    setReservas((data as ReservaDetalle[]) ?? [])
    setTotal(count ?? 0)
    setLoading(false)
  }, [page, estadoFilter, debouncedSearch])

  useEffect(() => { fetchReservas() }, [fetchReservas])

  const aprobarPago = async (r: ReservaDetalle) => {
    setActionLoading(true)
    await supabase.from('reservas').update({ estado: 'confirmada' }).eq('id', r.id)
    await supabase.from('pagos').update({ estado: 'aprobado' }).eq('reserva_id', r.id)
    setActionLoading(false)
    setSelected(null)
    fetchReservas()
  }

  const rechazarPago = async (r: ReservaDetalle) => {
    if (!rejectReason.trim()) return
    setActionLoading(true)
    await supabase.from('reservas').update({ estado: 'pago_rechazado', notas: rejectReason }).eq('id', r.id)
    await supabase.from('pagos').update({ estado: 'rechazado' }).eq('reserva_id', r.id)
    setActionLoading(false)
    setSelected(null)
    setShowRejectForm(false)
    setRejectReason('')
    fetchReservas()
  }

  const completarReserva = async (r: ReservaDetalle) => {
    setActionLoading(true)
    await supabase.from('reservas').update({ estado: 'completada' }).eq('id', r.id)
    setActionLoading(false)
    setSelected(null)
    fetchReservas()
  }

  const confirmarCancelacion = async (r: ReservaDetalle) => {
    setActionLoading(true)
    await supabase.from('reservas').update({ estado: 'cancelada', cancelacion_solicitada: false }).eq('id', r.id)
    setActionLoading(false)
    setSelected(null)
    fetchReservas()
  }

  const descartarSolicitudCancelacion = async (r: ReservaDetalle) => {
    setActionLoading(true)
    await supabase.from('reservas').update({ cancelacion_solicitada: false }).eq('id', r.id)
    setActionLoading(false)
    setSelected(null)
    fetchReservas()
  }

  const totalPages = Math.ceil(total / LIMIT)
  const pago = selected?.pagos?.[0]

  const closeModal = () => {
    setSelected(null)
    setShowRejectForm(false)
    setRejectReason('')
  }

  const nuevaNoches = nueva.checkin && nueva.checkout ? Math.max(calcularNoches(nueva.checkin, nueva.checkout), 0) : 0
  const habNueva = HABITACIONES_DATA.find(h => h.id === nueva.habitacion_id)
  const nuevaTotalSugerido = habNueva ? habNueva.precio_por_noche * nuevaNoches : 0

  const resetNueva = () => {
    setNueva({
      habitacion_id: HABITACIONES_DATA[0].id,
      checkin: '', checkout: '', num_huespedes: 2,
      nombre: '', apellido: '', email: '', whatsapp: '', pais: 'Perú',
      precio_total: '', estado: 'confirmada', notas: '',
    })
    setNuevaError('')
  }

  const crearReservaManual = async () => {
    setNuevaError('')
    if (!nueva.checkin || !nueva.checkout || nuevaNoches <= 0) {
      setNuevaError('Selecciona fechas válidas (check-out posterior a check-in).')
      return
    }
    if (!nueva.nombre || !nueva.apellido || !nueva.email) {
      setNuevaError('Nombre, apellido y email son obligatorios.')
      return
    }
    setNuevaSaving(true)
    try {
      const { data: cliente, error: clienteError } = await supabase
        .from('clientes')
        .upsert(
          { nombre: nueva.nombre, apellido: nueva.apellido, email: nueva.email, whatsapp: nueva.whatsapp, pais: nueva.pais },
          { onConflict: 'email' }
        )
        .select()
        .single()

      if (clienteError || !cliente) throw new Error(clienteError?.message || 'Error al registrar cliente')

      const codigo = generarCodigoReserva()
      const total = Number(nueva.precio_total) || nuevaTotalSugerido

      const { data: reserva, error: reservaError } = await supabase
        .from('reservas')
        .insert({
          codigo,
          cliente_id: cliente.id,
          habitacion_id: nueva.habitacion_id,
          fecha_checkin: nueva.checkin,
          fecha_checkout: nueva.checkout,
          num_huespedes: nueva.num_huespedes,
          noches: nuevaNoches,
          precio_total: total,
          estado: nueva.estado,
          notas: nueva.notas || 'Reserva creada manualmente desde el panel admin',
        })
        .select()
        .single()

      if (reservaError || !reserva) throw new Error(reservaError?.message || 'Error al crear la reserva')

      await supabase.from('pagos').insert({
        reserva_id: reserva.id,
        monto: total,
        moneda: 'PEN',
        metodo: 'manual_admin',
        estado: nueva.estado === 'confirmada' ? 'aprobado' : 'pendiente',
      })

      setShowNueva(false)
      resetNueva()
      fetchReservas()
    } catch (e) {
      setNuevaError(e instanceof Error ? e.message : 'Error inesperado al crear la reserva.')
    } finally {
      setNuevaSaving(false)
    }
  }

  const exportarCSV = async () => {
    const { data } = await supabase
      .from('reservas')
      .select('*, cliente:clientes(*)')
      .order('created_at', { ascending: false })

    const filas = (data as ReservaDetalle[]) ?? []
    const headers = ['Código', 'Huésped', 'Email', 'Habitación', 'Check-in', 'Check-out', 'Noches', 'Huéspedes', 'Total', 'Estado', 'Creada']
    const escape = (v: string | number) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const rows = filas.map(r => [
      r.codigo,
      `${r.cliente?.nombre ?? ''} ${r.cliente?.apellido ?? ''}`.trim(),
      r.cliente?.email ?? '',
      r.habitacion_id,
      r.fecha_checkin,
      r.fecha_checkout,
      r.noches,
      r.num_huespedes,
      r.precio_total,
      etiquetaEstado(r.estado).label,
      new Date(r.created_at).toLocaleDateString('es-PE'),
    ].map(escape).join(','))

    const csv = [headers.map(escape).join(','), ...rows].join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reservas-hatuchay-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary">Reservas</h1>
          <p className="text-ink/40 text-sm mt-0.5">{total} reserva{total !== 1 ? 's' : ''} encontrada{total !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportarCSV}
            className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-ink/60 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <Download size={14} /> Exportar CSV
          </button>
          <button
            onClick={() => { resetNueva(); setShowNueva(true) }}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus size={14} /> Nueva reserva
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por código (HTK-...) o nombre de huésped..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/15 bg-[#fafaf9]"
          />
        </div>
        <select
          value={estadoFilter}
          onChange={e => { setEstadoFilter(e.target.value); setPage(1) }}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9] min-w-[170px] text-ink"
        >
          {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin w-7 h-7 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : reservas.length === 0 ? (
          <div className="text-center py-16 text-ink/40">
            <p className="text-base font-medium">No se encontraron reservas</p>
            <p className="text-sm mt-1">Intenta cambiar los filtros</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f4f3f0] border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-ink/40 font-medium text-xs uppercase tracking-wide">Código</th>
                  <th className="text-left px-4 py-3 text-ink/40 font-medium text-xs uppercase tracking-wide">Huésped</th>
                  <th className="text-left px-4 py-3 text-ink/40 font-medium text-xs uppercase tracking-wide hidden md:table-cell">Hab.</th>
                  <th className="text-left px-4 py-3 text-ink/40 font-medium text-xs uppercase tracking-wide hidden sm:table-cell">Check-in</th>
                  <th className="text-left px-4 py-3 text-ink/40 font-medium text-xs uppercase tracking-wide hidden lg:table-cell">Noches</th>
                  <th className="text-left px-4 py-3 text-ink/40 font-medium text-xs uppercase tracking-wide">Total</th>
                  <th className="text-left px-4 py-3 text-ink/40 font-medium text-xs uppercase tracking-wide">Estado</th>
                  <th className="px-4 py-3 w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reservas.map(r => {
                  const { label, color } = etiquetaEstado(r.estado)
                  const isPending = r.estado === 'pago_pendiente_verificacion'
                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelected(r)}
                      className={`hover:bg-[#f4f3f0]/60 transition-colors cursor-pointer ${isPending ? 'bg-orange-50/40' : ''} ${r.cancelacion_solicitada ? 'bg-red-50/40' : ''}`}
                    >
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-primary text-xs">{r.codigo}</span>
                        {isPending && <span className="ml-2 w-2 h-2 rounded-full bg-orange-400 inline-block" />}
                        {r.cancelacion_solicitada && <span className="ml-2 w-2 h-2 rounded-full bg-red-500 inline-block" title="Cancelación solicitada" />}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-ink text-sm">{r.cliente?.nombre} {r.cliente?.apellido}</p>
                        <p className="text-ink/35 text-xs mt-0.5">{r.cliente?.email}</p>
                      </td>
                      <td className="px-4 py-3.5 text-ink/50 hidden md:table-cell text-sm">Hab. {r.habitacion_id}</td>
                      <td className="px-4 py-3.5 text-ink/50 hidden sm:table-cell text-sm">{formatearFecha(r.fecha_checkin)}</td>
                      <td className="px-4 py-3.5 text-ink/50 hidden lg:table-cell text-sm">{r.noches}n</td>
                      <td className="px-4 py-3.5 font-semibold text-primary text-sm">{formatearPrecio(r.precio_total)}</td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${color}`}>{label}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <Eye size={14} className="text-ink/25 mx-auto" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-ink/35">Mostrando {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} de {total}</p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-ink/40 hover:bg-gray-50 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-ink/40 hover:bg-gray-50 disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div>
                <p className="font-bold text-primary text-base">{selected.codigo}</p>
                <span className={`mt-1 inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${etiquetaEstado(selected.estado).color}`}>
                  {etiquetaEstado(selected.estado).label}
                </span>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-ink/40"
              >
                <X size={17} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Guest */}
              <div>
                <p className="text-xs font-semibold text-ink/35 uppercase tracking-wider mb-2">Huésped</p>
                <p className="font-semibold text-ink">{selected.cliente?.nombre} {selected.cliente?.apellido}</p>
                <p className="text-sm text-ink/55 mt-0.5">{selected.cliente?.email}</p>
                {selected.cliente?.whatsapp && (
                  <p className="text-sm text-ink/55">{selected.cliente.whatsapp} · {selected.cliente.pais}</p>
                )}
              </div>

              {/* Reservation details */}
              <div>
                <p className="text-xs font-semibold text-ink/35 uppercase tracking-wider mb-2">Detalle de reserva</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { label: 'Habitación', value: `Hab. ${selected.habitacion_id}` },
                    { label: 'Huéspedes', value: `${selected.num_huespedes} persona${selected.num_huespedes !== 1 ? 's' : ''}` },
                    { label: 'Check-in', value: formatearFecha(selected.fecha_checkin) },
                    { label: 'Check-out', value: formatearFecha(selected.fecha_checkout) },
                    { label: 'Noches', value: String(selected.noches) },
                    { label: 'Total', value: formatearPrecio(selected.precio_total), highlight: true },
                  ].map(({ label, value, highlight }) => (
                    <div key={label} className="bg-[#f4f3f0] rounded-xl p-3">
                      <p className="text-xs text-ink/35 mb-0.5">{label}</p>
                      <p className={`font-semibold text-sm ${highlight ? 'text-secondary' : 'text-ink'}`}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment */}
              {pago && (
                <div>
                  <p className="text-xs font-semibold text-ink/35 uppercase tracking-wider mb-2">Pago</p>
                  <div className="bg-[#f4f3f0] rounded-xl p-3.5 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-ink/50">Método</span>
                      <span className="font-medium">{METODOS[pago.metodo] ?? pago.metodo}</span>
                    </div>
                    {pago.referencia_externa && (
                      <div className="flex justify-between text-sm">
                        <span className="text-ink/50">N° operación</span>
                        <span className="font-medium font-mono">{pago.referencia_externa}</span>
                      </div>
                    )}
                    {pago.comprobante_url && (
                      <a
                        href={pago.comprobante_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 mt-1 pt-2 border-t border-black/5 text-sm font-semibold text-secondary hover:text-secondary-dark transition-colors"
                      >
                        <ExternalLink size={13} /> Ver comprobante de pago
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selected.notas && (
                <div>
                  <p className="text-xs font-semibold text-ink/35 uppercase tracking-wider mb-2">Notas / Motivo</p>
                  <p className="text-sm text-ink/60 bg-[#f4f3f0] rounded-xl p-3.5">{selected.notas}</p>
                </div>
              )}

              {/* Actions */}
              {selected.estado === 'pago_pendiente_verificacion' && (
                <div className="pt-1 space-y-3">
                  {!showRejectForm ? (
                    <div className="flex gap-3">
                      <button
                        onClick={() => aprobarPago(selected)}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 text-sm"
                      >
                        <CheckCircle size={15} /> Aprobar pago
                      </button>
                      <button
                        onClick={() => setShowRejectForm(true)}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3 rounded-xl transition-colors text-sm"
                      >
                        <XCircle size={15} /> Rechazar
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <p className="text-sm font-medium text-ink">Motivo del rechazo:</p>
                      <textarea
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        placeholder="Ej: Comprobante ilegible, monto incorrecto..."
                        rows={3}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 resize-none bg-[#fafaf9]"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => rechazarPago(selected)}
                          disabled={!rejectReason.trim() || actionLoading}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
                        >
                          Confirmar rechazo
                        </button>
                        <button
                          onClick={() => { setShowRejectForm(false); setRejectReason('') }}
                          className="px-5 py-2.5 rounded-xl text-sm border border-gray-200 hover:bg-gray-50 transition-colors text-ink/60"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selected.estado === 'confirmada' && (
                <button
                  onClick={() => completarReserva(selected)}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 text-sm"
                >
                  <Clock size={15} /> Marcar como completada
                </button>
              )}

              {selected.cancelacion_solicitada && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-semibold text-red-700">El huésped solicitó cancelar esta reserva</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => confirmarCancelacion(selected)}
                      disabled={actionLoading}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
                    >
                      Confirmar cancelación
                    </button>
                    <button
                      onClick={() => descartarSolicitudCancelacion(selected)}
                      disabled={actionLoading}
                      className="px-4 py-2.5 rounded-xl text-sm border border-gray-200 hover:bg-gray-50 transition-colors text-ink/60"
                    >
                      Descartar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Nueva reserva manual ── */}
      {showNueva && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowNueva(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
              <p className="font-bold text-primary text-base">Nueva reserva manual</p>
              <button onClick={() => setShowNueva(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-ink/40">
                <X size={17} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {nuevaError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-3.5 py-2.5">{nuevaError}</div>
              )}

              <div>
                <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">Habitación</label>
                <select
                  value={nueva.habitacion_id}
                  onChange={e => setNueva({ ...nueva, habitacion_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9]"
                >
                  {HABITACIONES_DATA.map(h => <option key={h.id} value={h.id}>{h.nombre}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">Check-in</label>
                  <input type="date" value={nueva.checkin} onChange={e => setNueva({ ...nueva, checkin: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">Check-out</label>
                  <input type="date" value={nueva.checkout} min={nueva.checkin} onChange={e => setNueva({ ...nueva, checkout: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9]" />
                </div>
              </div>
              {nuevaNoches > 0 && (
                <p className="text-xs text-ink/40 -mt-2">{nuevaNoches} noche{nuevaNoches !== 1 ? 's' : ''} · sugerido {formatearPrecio(nuevaTotalSugerido)}</p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">Huéspedes</label>
                  <input type="number" min={1} max={10} value={nueva.num_huespedes}
                    onChange={e => setNueva({ ...nueva, num_huespedes: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">Total (S/)</label>
                  <input type="number" min={0} step={10} value={nueva.precio_total}
                    placeholder={String(nuevaTotalSugerido)}
                    onChange={e => setNueva({ ...nueva, precio_total: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">Nombre *</label>
                  <input value={nueva.nombre} onChange={e => setNueva({ ...nueva, nombre: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">Apellido *</label>
                  <input value={nueva.apellido} onChange={e => setNueva({ ...nueva, apellido: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9]" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">Email *</label>
                <input type="email" value={nueva.email} onChange={e => setNueva({ ...nueva, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9]" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">WhatsApp</label>
                  <input value={nueva.whatsapp} onChange={e => setNueva({ ...nueva, whatsapp: e.target.value })}
                    placeholder="51999999999"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">País</label>
                  <input value={nueva.pais} onChange={e => setNueva({ ...nueva, pais: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9]" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">Estado inicial</label>
                <select
                  value={nueva.estado}
                  onChange={e => setNueva({ ...nueva, estado: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9]"
                >
                  <option value="confirmada">Confirmada</option>
                  <option value="pago_pendiente_verificacion">Pago pendiente de verificación</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">Notas</label>
                <textarea value={nueva.notas} onChange={e => setNueva({ ...nueva, notas: e.target.value })}
                  rows={2} placeholder="Reserva tomada por teléfono, walk-in, etc."
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9] resize-none" />
              </div>

              <button
                onClick={crearReservaManual}
                disabled={nuevaSaving}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                {nuevaSaving ? 'Creando...' : 'Crear reserva'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
