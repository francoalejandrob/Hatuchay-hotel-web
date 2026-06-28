'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { HABITACIONES_DATA } from '@/lib/constants'
import { Save, Plus, X, Upload, CheckCircle, Edit2, Trash2 } from 'lucide-react'
import { formatearPrecio } from '@/lib/utils'

interface HabEdit {
  codigo: string
  nombre: string
  descripcion: string
  tipo: string
  capacidad: number
  precio_por_noche: number
  precios_por_huesped: Record<string, number> | null
  imagenes: string[]
  amenidades: string[]
  disponible: boolean
}

type Tab = 'info' | 'servicios' | 'fotos'

export default function HabitacionesAdminPage() {
  const [habitaciones, setHabitaciones] = useState<HabEdit[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<HabEdit | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newAmenidad, setNewAmenidad] = useState('')
  const [newImageUrl, setNewImageUrl] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('info')

  useEffect(() => { fetchHabitaciones() }, [])

  const fetchHabitaciones = async () => {
    const { data } = await supabase.from('habitaciones').select('*').order('codigo')
    if (data && data.length > 0) {
      setHabitaciones(data as HabEdit[])
    } else {
      setHabitaciones(HABITACIONES_DATA.map(h => ({
        codigo: h.id,
        nombre: h.nombre,
        descripcion: h.descripcion,
        tipo: h.tipo,
        capacidad: h.capacidad,
        precio_por_noche: h.precio_por_noche,
        precios_por_huesped: (h as { precios_por_huesped?: Record<string, number> }).precios_por_huesped ?? null,
        imagenes: h.imagenes,
        amenidades: h.amenidades,
        disponible: true,
      })))
    }
    setLoading(false)
  }

  const startEdit = (hab: HabEdit) => {
    setEditingId(hab.codigo)
    setForm({ ...hab, imagenes: [...hab.imagenes], amenidades: [...hab.amenidades], precios_por_huesped: hab.precios_por_huesped ? { ...hab.precios_por_huesped } : null })
    setActiveTab('info')
    setSaved(false)
  }

  const cancelEdit = () => { setEditingId(null); setForm(null) }

  const saveHabitacion = async () => {
    if (!form) return
    setSaving(true)
    await supabase.from('habitaciones').upsert(
      { ...form, updated_at: new Date().toISOString() },
      { onConflict: 'codigo' }
    )
    setSaving(false)
    setSaved(true)
    fetchHabitaciones()
    setTimeout(() => setSaved(false), 3000)
  }

  const setPrecioPorHuesped = (n: number, valor: string) => {
    if (!form) return
    const tabla = { ...(form.precios_por_huesped ?? {}) }
    if (valor === '') {
      delete tabla[n]
    } else {
      tabla[n] = Number(valor)
    }
    setForm({ ...form, precios_por_huesped: Object.keys(tabla).length > 0 ? tabla : null })
  }

  const addAmenidad = () => {
    if (!form || !newAmenidad.trim()) return
    setForm({ ...form, amenidades: [...form.amenidades, newAmenidad.trim()] })
    setNewAmenidad('')
  }

  const removeAmenidad = (i: number) => {
    if (!form) return
    setForm({ ...form, amenidades: form.amenidades.filter((_, idx) => idx !== i) })
  }

  const addImageUrl = () => {
    if (!form || !newImageUrl.trim()) return
    setForm({ ...form, imagenes: [...form.imagenes, newImageUrl.trim()] })
    setNewImageUrl('')
  }

  const removeImage = (i: number) => {
    if (!form) return
    setForm({ ...form, imagenes: form.imagenes.filter((_, idx) => idx !== i) })
  }

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!form || !e.target.files?.[0]) return
    const file = e.target.files[0]
    setUploadingPhoto(true)

    const path = `${form.codigo}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`
    const fd = new FormData()
    fd.append('file', file)
    fd.append('bucket', 'habitaciones')
    fd.append('path', path)

    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error desconocido')
      setForm(f => f ? { ...f, imagenes: [...f.imagenes, json.publicUrl] } : f)
    } catch (err) {
      alert(`Error al subir la foto: ${err instanceof Error ? err.message : err}`)
    }

    setUploadingPhoto(false)
    e.target.value = ''
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-7 h-7 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Habitaciones</h1>
        <p className="text-ink/40 text-sm mt-0.5">Edita información, servicios y fotos de cada habitación</p>
      </div>

      <div className="space-y-4">
        {habitaciones.map(hab => (
          <div key={hab.codigo} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

            {/* Room summary row */}
            <div className="flex items-center gap-4 p-4">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                {hab.imagenes[0] && (
                  <Image src={hab.imagenes[0]} alt={hab.nombre} fill className="object-cover" sizes="64px"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/hotel/entrada.jpeg' }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-primary text-sm truncate">{hab.nombre}</p>
                <p className="text-xs text-ink/40 mt-0.5">
                  Hab. {hab.codigo} · {hab.capacidad} huésp. · {formatearPrecio(hab.precio_por_noche)}/noche · {hab.imagenes.length} fotos
                </p>
                <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${hab.disponible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {hab.disponible ? 'Disponible' : 'No disponible'}
                </span>
              </div>
              <button
                onClick={() => editingId === hab.codigo ? cancelEdit() : startEdit(hab)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  editingId === hab.codigo
                    ? 'bg-gray-100 text-ink/50'
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}
              >
                <Edit2 size={13} />
                {editingId === hab.codigo ? 'Cerrar' : 'Editar'}
              </button>
            </div>

            {/* Edit panel */}
            {editingId === hab.codigo && form && (
              <div className="border-t border-gray-100">

                {/* Tab bar */}
                <div className="flex border-b border-gray-100 px-4">
                  {(['info', 'servicios', 'fotos'] as Tab[]).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`px-4 py-3 text-sm font-semibold capitalize border-b-2 -mb-px transition-colors ${
                        activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-ink/35 hover:text-ink/60'
                      }`}
                    >
                      {tab === 'info' ? 'Información' : tab === 'servicios' ? 'Servicios' : 'Fotos'}
                    </button>
                  ))}
                </div>

                <div className="p-5 max-w-2xl">

                  {/* ── Tab Información ── */}
                  {activeTab === 'info' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">Nombre de la habitación</label>
                        <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9]" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">Descripción</label>
                        <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })}
                          rows={4} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9] resize-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">Tipo</label>
                          <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}
                            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9]">
                            {['suite', 'familiar', 'doble', 'simple', 'matrimonial'].map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">Capacidad (personas)</label>
                          <input type="number" min={1} max={10} value={form.capacidad}
                            onChange={e => setForm({ ...form, capacidad: Number(e.target.value) })}
                            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9]" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">Precio base por noche (S/)</label>
                        <input type="number" min={0} step={10} value={form.precio_por_noche}
                          onChange={e => setForm({ ...form, precio_por_noche: Number(e.target.value) })}
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9]" />
                        <p className="text-[11px] text-ink/35 mt-1">Se usa si no defines un precio específico por cantidad de huéspedes abajo.</p>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">
                          Precio por cantidad de huéspedes (opcional)
                        </label>
                        <p className="text-[11px] text-ink/35 mb-2">Deja vacío un campo para que esa cantidad use el precio base.</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {Array.from({ length: form.capacidad }, (_, i) => i + 1).map(n => (
                            <div key={n}>
                              <label className="text-[11px] text-ink/45 mb-1 block">{n} {n === 1 ? 'persona' : 'personas'}</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35 text-sm">S/</span>
                                <input
                                  type="number" min={0} step={10}
                                  value={form.precios_por_huesped?.[n] ?? ''}
                                  placeholder={String(form.precio_por_noche)}
                                  onChange={e => setPrecioPorHuesped(n, e.target.value)}
                                  className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9]"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-1">
                        <span className="text-sm font-medium text-ink">Disponible para reservas</span>
                        <button onClick={() => setForm({ ...form, disponible: !form.disponible })}
                          className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${form.disponible ? 'bg-green-500' : 'bg-gray-300'}`}>
                          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.disponible ? 'left-5' : 'left-0.5'}`} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── Tab Servicios ── */}
                  {activeTab === 'servicios' && (
                    <div className="space-y-4">
                      <p className="text-xs text-ink/40">Estos son los servicios e incluidos que se muestran en la página de la habitación.</p>
                      <div className="flex flex-wrap gap-2">
                        {form.amenidades.map((a, i) => (
                          <span key={i} className="flex items-center gap-1.5 bg-[#f4f3f0] text-ink/65 text-sm px-3 py-1.5 rounded-full">
                            {a}
                            <button onClick={() => removeAmenidad(i)} className="text-ink/30 hover:text-red-500 transition-colors ml-0.5">
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                        {form.amenidades.length === 0 && (
                          <p className="text-ink/30 text-sm">Sin servicios aún. Añade uno abajo.</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input value={newAmenidad} onChange={e => setNewAmenidad(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && addAmenidad()}
                          placeholder="Ej: WiFi gratuito, Desayuno incluido..."
                          className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9]" />
                        <button onClick={addAmenidad} className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── Tab Fotos ── */}
                  {activeTab === 'fotos' && (
                    <div className="space-y-5">
                      {/* Photo grid */}
                      {form.imagenes.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-2">
                            Fotos actuales ({form.imagenes.length}) — La primera es la foto principal
                          </p>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {form.imagenes.map((img, i) => (
                              <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
                                <Image src={img} alt="" fill className="object-cover" sizes="120px"
                                  onError={(e) => { (e.target as HTMLImageElement).src = '/images/hotel/entrada.jpeg' }} />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <button onClick={() => removeImage(i)}
                                    className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors">
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                                {i === 0 && (
                                  <div className="absolute top-1 left-1 bg-secondary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                    Principal
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Upload from device */}
                      <div>
                        <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">
                          Subir desde tu dispositivo
                        </label>
                        <label className={`flex items-center gap-3 px-4 py-3.5 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                          uploadingPhoto ? 'border-gray-200 opacity-50' : 'border-gray-200 hover:border-secondary'
                        }`}>
                          <Upload size={16} className="text-ink/35 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-ink/55 font-medium">
                              {uploadingPhoto ? 'Subiendo foto...' : 'Seleccionar imagen'}
                            </p>
                            <p className="text-xs text-ink/30">JPG, PNG, WEBP hasta 10MB</p>
                          </div>
                          <input type="file" accept="image/*" onChange={uploadPhoto} disabled={uploadingPhoto} className="hidden" />
                        </label>
                      </div>

                      {/* Add by URL */}
                      <div>
                        <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">
                          O añadir por URL
                        </label>
                        <div className="flex gap-2">
                          <input value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addImageUrl()}
                            placeholder="https://... o /images/habitaciones/..."
                            className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9]" />
                          <button onClick={addImageUrl} className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Save button */}
                  <div className="flex justify-end pt-5 border-t border-gray-100 mt-5">
                    <button onClick={saveHabitacion} disabled={saving}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 ${
                        saved ? 'bg-green-500 text-white' : 'bg-primary hover:bg-primary/90 text-white'
                      }`}>
                      {saved ? <><CheckCircle size={15} /> Guardado</> : saving ? 'Guardando...' : <><Save size={15} /> Guardar cambios</>}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
