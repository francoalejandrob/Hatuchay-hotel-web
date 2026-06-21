'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { RESENAS_FALLBACK, type Resena } from '@/lib/useResenas'
import { Plus, Trash2, Save, Star, X } from 'lucide-react'

interface ResenaRow extends Resena {
  id: string
  orden: number
}

const COLORES = ['#2d6a4f', '#1a5276', '#784212', '#6c3483', '#0e6655', '#b7950b', '#117a65', '#922b21', '#1f618d', '#7b5ea7', '#c4753a', '#034724']

function emptyForm(orden: number): Omit<ResenaRow, 'id'> {
  return { score: 10, text: '', name: '', origin: 'Perú', date: '', initials: '', color: COLORES[orden % COLORES.length], orden }
}

export default function ResenasAdminPage() {
  const [resenas, setResenas] = useState<ResenaRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm(0))
  const [saving, setSaving] = useState(false)
  const [seeding, setSeeding] = useState(false)

  const fetchResenas = async () => {
    setLoading(true)
    const { data } = await supabase.from('resenas').select('*').order('orden', { ascending: true })
    setResenas((data as ResenaRow[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchResenas() }, [])

  const seedFallback = async () => {
    setSeeding(true)
    const rows = RESENAS_FALLBACK.map((r, i) => ({ ...r, orden: i }))
    await supabase.from('resenas').insert(rows)
    setSeeding(false)
    fetchResenas()
  }

  const crear = async () => {
    if (!form.name.trim() || !form.text.trim()) return
    setSaving(true)
    const initials = form.initials || form.name.charAt(0).toUpperCase()
    await supabase.from('resenas').insert({ ...form, initials })
    setSaving(false)
    setShowForm(false)
    setForm(emptyForm(resenas.length))
    fetchResenas()
  }

  const eliminar = async (id: string) => {
    if (!confirm('¿Eliminar esta reseña?')) return
    await supabase.from('resenas').delete().eq('id', id)
    fetchResenas()
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary">Reseñas</h1>
          <p className="text-ink/40 text-sm mt-0.5">Testimonios mostrados en la sección de reseñas del home</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm(resenas.length)); setShowForm(true) }}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors self-start sm:self-auto"
        >
          <Plus size={14} /> Nueva reseña
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin w-7 h-7 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : resenas.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
          <Star size={28} className="mx-auto mb-3 text-ink/20" />
          <p className="text-ink/50 mb-4">Aún no hay reseñas en la base de datos — la página muestra las 14 de ejemplo por defecto.</p>
          <button
            onClick={seedFallback}
            disabled={seeding}
            className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            {seeding ? 'Cargando...' : 'Cargar las 14 reseñas de ejemplo para editarlas'}
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resenas.map(r => (
            <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: r.color }}>
                    {r.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{r.name}</p>
                    <p className="text-xs text-ink/40">{r.origin}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-secondary">{r.score}.0</span>
              </div>
              <p className="text-sm text-ink/60 line-clamp-3 mb-3">&ldquo;{r.text}&rdquo;</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink/35">{r.date}</span>
                <button onClick={() => eliminar(r.id)} className="text-ink/30 hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
              <p className="font-bold text-primary">Nueva reseña</p>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-ink/40">
                <X size={17} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">Nombre</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">Puntaje</label>
                  <select value={form.score} onChange={e => setForm({ ...form, score: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9]">
                    {[10, 9, 8, 7, 6].map(s => <option key={s} value={s}>{s}.0</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">Origen / tipo de habitación</label>
                <input value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })}
                  placeholder="Ej: Perú · En pareja"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">Fecha</label>
                <input value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                  placeholder="Ej: Jun 2026"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">Reseña</label>
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
