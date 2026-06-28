'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { RESENAS_FALLBACK, type Resena } from '@/lib/useResenas'
import { Plus, Trash2, Save, Star, X, Check, Clock } from 'lucide-react'

interface ResenaRow extends Resena {
  id: string
  orden: number
  aprobada?: boolean
  submitted_at?: string
}

type Tab = 'publicadas' | 'pendientes'

const COLORES = ['#2d6a4f', '#1a5276', '#784212', '#6c3483', '#0e6655', '#b7950b', '#117a65', '#922b21', '#1f618d', '#7b5ea7', '#c4753a', '#034724']

function emptyForm(orden: number): Omit<ResenaRow, 'id'> {
  return { score: 10, text: '', name: '', origin: 'Perú', date: '', initials: '', color: COLORES[orden % COLORES.length], orden, aprobada: true }
}

export default function ResenasAdminPage() {
  const [tab, setTab]           = useState<Tab>('publicadas')
  const [publicadas, setPublicadas]   = useState<ResenaRow[]>([])
  const [pendientes, setPendientes]   = useState<ResenaRow[]>([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(emptyForm(0))
  const [saving, setSaving]     = useState(false)
  const [seeding, setSeeding]   = useState(false)
  const [approvingId, setApprovingId] = useState<string | null>(null)

  const fetchAll = async () => {
    setLoading(true)
    const [pubRes, penRes] = await Promise.all([
      supabase.from('resenas').select('*').eq('aprobada', true).order('orden', { ascending: true }),
      supabase.from('resenas').select('*').eq('aprobada', false).order('submitted_at', { ascending: false }),
    ])
    setPublicadas((pubRes.data as ResenaRow[]) ?? [])
    setPendientes((penRes.data as ResenaRow[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  const seedFallback = async () => {
    setSeeding(true)
    const rows = RESENAS_FALLBACK.map((r, i) => ({ ...r, orden: i, aprobada: true }))
    await supabase.from('resenas').insert(rows)
    setSeeding(false)
    fetchAll()
  }

  const crear = async () => {
    if (!form.name.trim() || !form.text.trim()) return
    setSaving(true)
    const initials = form.initials || form.name.charAt(0).toUpperCase()
    await supabase.from('resenas').insert({ ...form, initials, aprobada: true })
    setSaving(false)
    setShowForm(false)
    setForm(emptyForm(publicadas.length))
    fetchAll()
  }

  const eliminar = async (id: string) => {
    if (!confirm('¿Eliminar esta reseña?')) return
    await supabase.from('resenas').delete().eq('id', id)
    fetchAll()
  }

  const aprobar = async (r: ResenaRow) => {
    setApprovingId(r.id)
    await supabase.from('resenas').update({ aprobada: true, orden: publicadas.length }).eq('id', r.id)
    setApprovingId(null)
    fetchAll()
  }

  const rechazar = async (id: string) => {
    if (!confirm('¿Rechazar y eliminar esta reseña?')) return
    await supabase.from('resenas').delete().eq('id', id)
    fetchAll()
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary">Reseñas</h1>
          <p className="text-gray-500 text-sm mt-0.5">Testimonios del hotel</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm(publicadas.length)); setShowForm(true) }}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors self-start sm:self-auto"
        >
          <Plus size={14} /> Nueva reseña
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setTab('publicadas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === 'publicadas' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-ink'
          }`}
        >
          <Star size={14} />
          Publicadas
          {publicadas.length > 0 && (
            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">{publicadas.length}</span>
          )}
        </button>
        <button
          onClick={() => setTab('pendientes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === 'pendientes' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-ink'
          }`}
        >
          <Clock size={14} />
          Pendientes
          {pendientes.length > 0 && (
            <span className="bg-secondary/15 text-secondary text-xs font-bold px-2 py-0.5 rounded-full">{pendientes.length}</span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin w-7 h-7 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : tab === 'publicadas' ? (

        /* ── PUBLICADAS ── */
        publicadas.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
            <Star size={28} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 mb-4">Aún no hay reseñas publicadas. La página muestra 14 de ejemplo por defecto.</p>
            <button
              onClick={seedFallback}
              disabled={seeding}
              className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              {seeding ? 'Cargando...' : 'Cargar las 14 reseñas de ejemplo'}
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicadas.map(r => (
              <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: r.color }}>
                      {r.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">{r.name}</p>
                      <p className="text-xs text-gray-400">{r.origin}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-secondary">{r.score}.0</span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-3 mb-3">&ldquo;{r.text}&rdquo;</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{r.date}</span>
                  <button onClick={() => eliminar(r.id)} className="text-gray-300 hover:text-red-500 transition-colors cursor-pointer">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )

      ) : (

        /* ── PENDIENTES ── */
        pendientes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
            <Check size={28} className="mx-auto mb-3 text-green-400" />
            <p className="text-gray-500">No hay reseñas pendientes de aprobación.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendientes.map(r => (
              <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-amber-100 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: r.color }}>
                      {r.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-ink">{r.name}</p>
                        <span className="text-xs font-bold text-secondary">{r.score}.0 / 10</span>
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                          <Clock size={9} /> Pendiente
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 truncate">{r.origin} · {r.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => aprobar(r)}
                      disabled={approvingId === r.id}
                      className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Check size={13} /> {approvingId === r.id ? '...' : 'Aprobar'}
                    </button>
                    <button
                      onClick={() => rechazar(r.id)}
                      className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      <X size={13} /> Rechazar
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-3 leading-relaxed border-t border-gray-100 pt-3">
                  &ldquo;{r.text}&rdquo;
                </p>
              </div>
            ))}
          </div>
        )
      )}

      {/* Modal nueva reseña */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
              <p className="font-bold text-primary">Nueva reseña</p>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer">
                <X size={17} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">Nombre</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">Puntaje</label>
                  <select value={form.score} onChange={e => setForm({ ...form, score: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9]">
                    {[10, 9, 8, 7, 6].map(s => <option key={s} value={s}>{s}.0</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">Origen / tipo de habitación</label>
                <input value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })}
                  placeholder="Ej: Perú · En pareja"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">Fecha</label>
                <input value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                  placeholder="Ej: Jun 2026"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">Reseña</label>
                <textarea value={form.text} onChange={e => setForm({ ...form, text: e.target.value })}
                  rows={4}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9] resize-none" />
              </div>
              <button onClick={crear} disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-50">
                {saving ? 'Guardando...' : <><Save size={15} /> Guardar reseña</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
