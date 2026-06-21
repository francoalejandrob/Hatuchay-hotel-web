'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, X, Mail, Phone, MapPin, Calendar } from 'lucide-react'
import { formatearPrecio, formatearFecha, etiquetaEstado } from '@/lib/utils'

interface ReservaMini {
  id: string
  codigo: string
  fecha_checkin: string
  fecha_checkout: string
  precio_total: number
  estado: string
  habitacion_id: string
}

interface Cliente {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono: string | null
  whatsapp: string | null
  pais: string | null
  created_at: string
  reservas: ReservaMini[]
}

export default function ClientesAdminPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Cliente | null>(null)

  const fetchClientes = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('clientes')
      .select('*, reservas(id, codigo, fecha_checkin, fecha_checkout, precio_total, estado, habitacion_id)')
      .order('created_at', { ascending: false })
    setClientes((data as Cliente[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchClientes() }, [fetchClientes])

  const totalGastado = (c: Cliente) =>
    c.reservas.filter(r => r.estado === 'confirmada' || r.estado === 'completada').reduce((s, r) => s + r.precio_total, 0)

  const filtrados = clientes.filter(c => {
    const q = search.toLowerCase()
    return !q || c.nombre.toLowerCase().includes(q) || c.apellido.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Clientes</h1>
        <p className="text-ink/40 text-sm mt-0.5">{clientes.length} cliente{clientes.length !== 1 ? 's' : ''} registrado{clientes.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-5">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/15 bg-[#fafaf9]"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin w-7 h-7 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-16 text-ink/40">
            <p className="text-base font-medium">No se encontraron clientes</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f4f3f0] border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-ink/40 font-medium text-xs uppercase tracking-wide">Cliente</th>
                  <th className="text-left px-4 py-3 text-ink/40 font-medium text-xs uppercase tracking-wide hidden sm:table-cell">País</th>
                  <th className="text-left px-4 py-3 text-ink/40 font-medium text-xs uppercase tracking-wide">Reservas</th>
                  <th className="text-left px-4 py-3 text-ink/40 font-medium text-xs uppercase tracking-wide">Total gastado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtrados.map(c => (
                  <tr key={c.id} onClick={() => setSelected(c)} className="hover:bg-[#f4f3f0]/60 transition-colors cursor-pointer">
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-ink text-sm">{c.nombre} {c.apellido}</p>
                      <p className="text-ink/35 text-xs mt-0.5">{c.email}</p>
                    </td>
                    <td className="px-4 py-3.5 text-ink/50 hidden sm:table-cell text-sm">{c.pais || '—'}</td>
                    <td className="px-4 py-3.5 text-ink/60 text-sm">{c.reservas.length}</td>
                    <td className="px-4 py-3.5 font-semibold text-primary text-sm">{formatearPrecio(totalGastado(c))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
              <div>
                <p className="font-bold text-primary text-base">{selected.nombre} {selected.apellido}</p>
                <p className="text-sm text-ink/50">Cliente desde {formatearFecha(selected.created_at)}</p>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-ink/40">
                <X size={17} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-sm text-ink/70"><Mail size={14} className="text-secondary" /> {selected.email}</p>
                {selected.whatsapp && <p className="flex items-center gap-2 text-sm text-ink/70"><Phone size={14} className="text-secondary" /> {selected.whatsapp}</p>}
                {selected.pais && <p className="flex items-center gap-2 text-sm text-ink/70"><MapPin size={14} className="text-secondary" /> {selected.pais}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#f4f3f0] rounded-xl p-3.5 text-center">
                  <p className="text-2xl font-bold text-primary">{selected.reservas.length}</p>
                  <p className="text-xs text-ink/40 mt-0.5">Reservas totales</p>
                </div>
                <div className="bg-[#f4f3f0] rounded-xl p-3.5 text-center">
                  <p className="text-2xl font-bold text-secondary">{formatearPrecio(totalGastado(selected))}</p>
                  <p className="text-xs text-ink/40 mt-0.5">Total gastado</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-ink/35 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar size={12} /> Historial de reservas
                </p>
                <div className="space-y-2">
                  {[...selected.reservas].sort((a, b) => b.fecha_checkin.localeCompare(a.fecha_checkin)).map(r => {
                    const { label, color } = etiquetaEstado(r.estado)
                    return (
                      <div key={r.id} className="flex items-center justify-between gap-2 bg-[#f4f3f0] rounded-xl p-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-primary">{r.codigo}</p>
                          <p className="text-xs text-ink/50 mt-0.5">Hab. {r.habitacion_id} · {formatearFecha(r.fecha_checkin)} → {formatearFecha(r.fecha_checkout)}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-semibold text-ink">{formatearPrecio(r.precio_total)}</p>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${color}`}>{label}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
