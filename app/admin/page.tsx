'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Calendar, DollarSign, AlertCircle, Users, CheckCircle } from 'lucide-react'
import { formatearPrecio, formatearFecha, etiquetaEstado } from '@/lib/utils'
import type { Reserva } from '@/types'

export default function AdminPage() {
  const router = useRouter()
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalMes: 0,
    ingresosMes: 0,
    pendientes: 0,
    checkinsSemana: 0,
  })

  useEffect(() => {
    checkAuth()
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) router.push('/admin/login')
  }

  const fetchData = async () => {
    const inicioMes = new Date()
    inicioMes.setDate(1)
    inicioMes.setHours(0, 0, 0, 0)

    const { data } = await supabase
      .from('reservas')
      .select('*, cliente:clientes(*)')
      .order('created_at', { ascending: false })
      .limit(50)

    if (data) {
      const reservasTyped = data as Reserva[]
      setReservas(reservasTyped)
      const mesReservas = reservasTyped.filter((r) => new Date(r.created_at) >= inicioMes)
      const pendientes = reservasTyped.filter((r) => r.estado === 'pago_pendiente_verificacion')
      const hoy = new Date()
      const semana = new Date(hoy.getTime() + 7 * 86400000)
      const checkinsSemana = reservasTyped.filter((r) => {
        const ci = new Date(r.fecha_checkin)
        return ci >= hoy && ci <= semana
      })

      setStats({
        totalMes: mesReservas.length,
        ingresosMes: mesReservas.filter((r) => r.estado === 'confirmada' || r.estado === 'completada')
          .reduce((sum, r) => sum + r.precio_total, 0),
        pendientes: pendientes.length,
        checkinsSemana: checkinsSemana.length,
      })
    }
    setLoading(false)
  }

  const aprobarPago = async (reservaId: string) => {
    await supabase.from('reservas').update({ estado: 'confirmada' }).eq('id', reservaId)
    await supabase.from('pagos').update({ estado: 'aprobado' }).eq('reserva_id', reservaId)
    fetchData()
  }

  const rechazarPago = async (reservaId: string) => {
    const motivo = prompt('Motivo del rechazo:')
    if (!motivo) return
    await supabase.from('reservas').update({ estado: 'pago_rechazado', notas: motivo }).eq('id', reservaId)
    await supabase.from('pagos').update({ estado: 'rechazado' }).eq('reserva_id', reservaId)
    fetchData()
  }

  const pendientesVerificacion = reservas.filter((r) => r.estado === 'pago_pendiente_verificacion')

  if (loading) {
    return <div className="min-h-screen bg-[#f4f3f0] flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
        <p className="text-ink/40 text-sm mt-0.5">Resumen de actividad del hotel</p>
      </div>
      <div className="max-w-7xl">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Reservas este mes', value: stats.totalMes, icon: Calendar, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Ingresos del mes', value: formatearPrecio(stats.ingresosMes), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
            { label: 'Check-ins esta semana', value: stats.checkinsSemana, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
            { label: 'Pagos pendientes', value: stats.pendientes, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-100', alert: stats.pendientes > 0 },
          ].map(({ label, value, icon: Icon, color, bg, alert }) => (
            <div key={label} className={`bg-white rounded-2xl p-5 shadow-card ${alert ? 'ring-2 ring-orange-400' : ''}`}>
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={20} className={color} />
              </div>
              <p className="text-ink/50 text-xs mb-0.5">{label}</p>
              <p className={`font-bold text-xl ${alert ? 'text-orange-600' : 'text-ink'}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Pagos pendientes - alert section */}
        {pendientesVerificacion.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-8">
            <h2 className="font-semibold text-orange-800 flex items-center gap-2 mb-4">
              <AlertCircle size={18} />
              {pendientesVerificacion.length} pago(s) pendiente(s) de verificación
            </h2>
            <div className="space-y-3">
              {pendientesVerificacion.map((r) => (
                <div key={r.id} className="bg-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-primary">{r.codigo}</p>
                    <p className="text-sm text-ink/60">
                      {r.cliente?.nombre} {r.cliente?.apellido} · {formatearPrecio(r.precio_total)}
                    </p>
                    <p className="text-xs text-ink/40">
                      Check-in: {formatearFecha(r.fecha_checkin)} · {r.noches} noches
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => aprobarPago(r.id)}
                      className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                    >
                      <CheckCircle size={15} /> Aprobar
                    </button>
                    <button
                      onClick={() => rechazarPago(r.id)}
                      className="flex items-center gap-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent reservations */}
        <div className="bg-white rounded-2xl shadow-card">
          <div className="p-5 border-b border-warm-dark flex items-center justify-between">
            <h2 className="font-semibold text-primary">Últimas reservas</h2>
            <Link href="/admin/reservas" className="text-secondary text-sm font-medium hover:underline">
              Ver todas →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-warm">
                  <th className="text-left px-4 py-3 text-ink/50 font-medium">Código</th>
                  <th className="text-left px-4 py-3 text-ink/50 font-medium">Cliente</th>
                  <th className="text-left px-4 py-3 text-ink/50 font-medium">Check-in</th>
                  <th className="text-left px-4 py-3 text-ink/50 font-medium">Noches</th>
                  <th className="text-left px-4 py-3 text-ink/50 font-medium">Total</th>
                  <th className="text-left px-4 py-3 text-ink/50 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-dark">
                {reservas.slice(0, 10).map((r) => {
                  const { label, color } = etiquetaEstado(r.estado)
                  return (
                    <tr key={r.id} className="hover:bg-warm/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-primary">{r.codigo}</td>
                      <td className="px-4 py-3">{r.cliente?.nombre} {r.cliente?.apellido}</td>
                      <td className="px-4 py-3 text-ink/60">{formatearFecha(r.fecha_checkin)}</td>
                      <td className="px-4 py-3 text-ink/60">{r.noches}</td>
                      <td className="px-4 py-3 font-semibold">{formatearPrecio(r.precio_total)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}>{label}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

