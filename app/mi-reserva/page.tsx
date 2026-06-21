'use client'

import { useState } from 'react'
import { Search, Loader2, MapPin, Users, CalendarDays, AlertTriangle, CheckCircle } from 'lucide-react'
import { formatearPrecio, formatearFecha, etiquetaEstado } from '@/lib/utils'

interface Reserva {
  id: string
  codigo: string
  habitacion_id: string
  fecha_checkin: string
  fecha_checkout: string
  noches: number
  num_huespedes: number
  precio_total: number
  estado: string
  cancelacion_solicitada?: boolean
  cliente?: { nombre: string; apellido: string }
}

export default function MiReservaPage() {
  const [codigo, setCodigo] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [reserva, setReserva] = useState<Reserva | null>(null)
  const [cancelando, setCancelando] = useState(false)
  const [cancelOk, setCancelOk] = useState(false)

  const buscar = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setReserva(null)
    setCancelOk(false)
    try {
      const res = await fetch(`/api/reservas/buscar?codigo=${encodeURIComponent(codigo)}&email=${encodeURIComponent(email)}`)
      const data = await res.json()
      if (data.success) {
        setReserva(data.reserva)
      } else {
        setError(data.error || 'No se encontró la reserva.')
      }
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const solicitarCancelacion = async () => {
    if (!confirm('¿Confirmas que deseas solicitar la cancelación de esta reserva? Nuestro equipo la revisará.')) return
    setCancelando(true)
    try {
      const res = await fetch('/api/reservas/cancelar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo, email }),
      })
      const data = await res.json()
      if (data.success) {
        setCancelOk(true)
        setReserva(r => r ? { ...r, cancelacion_solicitada: true } : r)
      } else {
        alert(data.error || 'No se pudo procesar la solicitud.')
      }
    } catch {
      alert('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setCancelando(false)
    }
  }

  return (
    <div className="min-h-screen bg-warm pt-28 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-secondary font-semibold text-sm tracking-widest uppercase mb-2">Consulta tu reserva</p>
          <h1 className="font-display text-primary text-3xl sm:text-4xl font-bold mb-2">Mi Reserva</h1>
          <p className="text-ink/50">Ingresa tu código de reserva y email para ver el estado o solicitar una cancelación.</p>
        </div>

        <form onSubmit={buscar} className="bg-white rounded-2xl shadow-card p-6 space-y-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-hotel">Código de reserva</label>
              <input value={codigo} onChange={e => setCodigo(e.target.value)} placeholder="HTK-2026-0000" className="input-hotel" required />
            </div>
            <div>
              <label className="label-hotel">Email usado al reservar</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" className="input-hotel" required />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full btn-secondary rounded-xl flex items-center justify-center gap-2 py-3.5">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Buscando...</> : <><Search size={18} /> Buscar reserva</>}
          </button>
        </form>

        {reserva && (
          <div className="bg-white rounded-2xl shadow-card p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-ink/40 text-xs uppercase tracking-wide">Código</p>
                <p className="font-display text-primary text-2xl font-bold">{reserva.codigo}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${etiquetaEstado(reserva.estado).color}`}>
                {etiquetaEstado(reserva.estado).label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-warm rounded-xl p-3.5">
                <p className="flex items-center gap-1.5 text-ink/40 text-xs mb-1"><MapPin size={12} /> Habitación</p>
                <p className="font-semibold text-sm text-ink">Hab. {reserva.habitacion_id}</p>
              </div>
              <div className="bg-warm rounded-xl p-3.5">
                <p className="flex items-center gap-1.5 text-ink/40 text-xs mb-1"><Users size={12} /> Huéspedes</p>
                <p className="font-semibold text-sm text-ink">{reserva.num_huespedes} persona(s)</p>
              </div>
              <div className="bg-warm rounded-xl p-3.5">
                <p className="flex items-center gap-1.5 text-ink/40 text-xs mb-1"><CalendarDays size={12} /> Check-in</p>
                <p className="font-semibold text-sm text-ink">{formatearFecha(reserva.fecha_checkin)}</p>
              </div>
              <div className="bg-warm rounded-xl p-3.5">
                <p className="flex items-center gap-1.5 text-ink/40 text-xs mb-1"><CalendarDays size={12} /> Check-out</p>
                <p className="font-semibold text-sm text-ink">{formatearFecha(reserva.fecha_checkout)}</p>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-warm-dark pt-4">
              <span className="font-semibold text-primary">Total</span>
              <span className="font-display text-xl font-bold text-primary">{formatearPrecio(reserva.precio_total)}</span>
            </div>

            {cancelOk || reserva.cancelacion_solicitada ? (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle size={18} className="text-orange-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-orange-700">Tu solicitud de cancelación fue recibida. Nuestro equipo se pondrá en contacto contigo pronto.</p>
              </div>
            ) : (reserva.estado !== 'cancelada' && reserva.estado !== 'completada') ? (
              <button
                onClick={solicitarCancelacion}
                disabled={cancelando}
                className="w-full flex items-center justify-center gap-2 border-2 border-red-200 hover:bg-red-50 text-red-600 font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 text-sm"
              >
                {cancelando ? <Loader2 size={16} className="animate-spin" /> : <AlertTriangle size={16} />}
                Solicitar cancelación
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
