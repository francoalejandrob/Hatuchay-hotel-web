'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2, X, Save, Ticket } from 'lucide-react'

interface Cupon {
  id: string
  codigo: string
  tipo: 'porcentaje' | 'monto_fijo'
  valor: number
  fecha_expiracion: string | null
  usos_maximos: number | null
  usos_actuales: number
  activo: boolean
  created_at: string
}

function emptyForm() {
  return { codigo: '', tipo: 'porcentaje' as 'porcentaje' | 'monto_fijo', valor: 10, fecha_expiracion: '', usos_maximos: '' }
}

export default function CuponesAdminPage() {
  const [cupones, setCupones] = useState<Cupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchCupones = async () => {
    setLoading(true)
    const { data } = await supabase.from('cupones').select('*').order('created_at', { ascending: false })
    setCupones((data as Cupon[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchCupones() }, [])

  const crear = async () => {
    setError('')
    if (!form.codigo.trim()) { setError('El código es obligatorio.'); return }
    if (form.valor <= 0) { setError('El valor debe ser mayor a 0.'); return }
    setSaving(true)
    const { error: insertError } = await supabase.from('cupones').insert({
      codigo: form.codigo.trim().toUpperCase(),
      tipo: form.tipo,
      valor: form.valor,
      fecha_expiracion: form.fecha_expiracion || null,
      usos_maximos: form.usos_maximos ? Number(form.usos_maximos) : null,
      activo: true,
    })
    setSaving(false)
    if (insertError) {
      setError(insertError.message.includes('duplicate') ? 'Ya existe un cupón con ese código.' : 'Error al crear el cupón.')
      return
    }
    setShowForm(false)
    setForm(emptyForm())
    fetchCupones()
  }

  const toggleActivo = async (c: Cupon) => {
    await supabase.from('cupones').update({ activo: !c.activo }).eq('id', c.id)
    fetchCupones()
  }

  const eliminar = async (id: string) => {
    if (!confirm('¿Eliminar este cupón?')) return
    await supabase.from('cupones').delete().eq('id', id)
    fetchCupones()
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary">Cupones de descuento</h1>
          <p className="text-ink/40 text-sm mt-0.5">Códigos promocionales aplicables en el checkout</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm()); setError(''); setShowForm(true) }}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors self-start sm:self-auto"
        >
          <Plus size={14} /> Nuevo cupón
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin w-7 h-7 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : cupones.length === 0 ? (
          <div className="text-center py-16 text-ink/40">
            <Ticket size={28} className="mx-auto mb-3 text-ink/20" />
            <p className="text-base font-medium">No hay cupones todavía</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f4f3f0] border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-ink/40 font-medium text-xs uppercase tracking-wide">Código</th>
                  <th className="text-left px-4 py-3 text-ink/40 font-medium text-xs uppercase tracking-wide">Descuento</th>
                  <th className="text-left px-4 py-3 text-ink/40 font-medium text-xs uppercase tracking-wide hidden sm:table-cell">Expira</th>
                  <th className="text-left px-4 py-3 text-ink/40 font-medium text-xs uppercase tracking-wide hidden sm:table-cell">Usos</th>
                  <th className="text-left px-4 py-3 text-ink/40 font-medium text-xs uppercase tracking-wide">Estado</th>
                  <th className="px-4 py-3 w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {cupones.map(c => (
                  <tr key={c.id} className="hover:bg-[#f4f3f0]/40 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-primary text-sm font-mono">{c.codigo}</td>
                    <td className="px-4 py-3.5 text-ink text-sm">
                      {c.tipo === 'porcentaje' ? `${c.valor}%` : `S/ ${c.valor.toFixed(2)}`}
                    </td>
                    <td className="px-4 py-3.5 text-ink/50 hidden sm:table-cell text-sm">
                      {c.fecha_expiracion ? new Date(c.fecha_expiracion).toLocaleDateString('es-PE') : 'Sin expiración'}
                    </td>
                    <td className="px-4 py-3.5 text-ink/50 hidden sm:table-cell text-sm">
                      {c.usos_actuales}{c.usos_maximos ? ` / ${c.usos_maximos}` : ''}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => toggleActivo(c)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                          c.activo ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {c.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button onClick={() => eliminar(c.id)} className="text-ink/30 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <p className="font-bold text-primary">Nuevo cupón</p>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-ink/40">
                <X size={17} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-3.5 py-2.5">{error}</div>}

              <div>
                <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">Código</label>
                <input value={form.codigo} onChange={e => setForm({ ...form, codigo: e.target.value.toUpperCase() })}
                  placeholder="Ej: VERANO2026"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-secondary bg-[#fafaf9]" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">Tipo</label>
                  <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value as 'porcentaje' | 'monto_fijo' })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9]">
                    <option value="porcentaje">Porcentaje (%)</option>
                    <option value="monto_fijo">Monto fijo (S/)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">Valor</label>
                  <input type="number" min={1} value={form.valor} onChange={e => setForm({ ...form, valor: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">Expira (opcional)</label>
                  <input type="date" value={form.fecha_expiracion} onChange={e => setForm({ ...form, fecha_expiracion: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">Usos máximos</label>
                  <input type="number" min={1} value={form.usos_maximos} onChange={e => setForm({ ...form, usos_maximos: e.target.value })}
                    placeholder="Ilimitado"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9]" />
                </div>
              </div>

              <button onClick={crear} disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-50">
                {saving ? 'Creando...' : <><Save size={15} /> Crear cupón</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
