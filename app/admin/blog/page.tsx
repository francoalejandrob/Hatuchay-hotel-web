'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2, X, Save, Newspaper, Upload } from 'lucide-react'

interface Post {
  id: string
  titulo: string
  slug: string
  resumen: string
  contenido: string
  imagen_portada: string | null
  publicado: boolean
  created_at: string
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function emptyForm() {
  return { titulo: '', slug: '', resumen: '', contenido: '', imagen_portada: '', publicado: true }
}

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)

  const fetchPosts = async () => {
    setLoading(true)
    const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
    setPosts((data as Post[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchPosts() }, [])

  const abrirNuevo = () => {
    setForm(emptyForm())
    setEditingId(null)
    setSlugTouched(false)
    setError('')
    setShowForm(true)
  }

  const abrirEditar = (p: Post) => {
    setForm({ titulo: p.titulo, slug: p.slug, resumen: p.resumen, contenido: p.contenido, imagen_portada: p.imagen_portada || '', publicado: p.publicado })
    setEditingId(p.id)
    setSlugTouched(true)
    setError('')
    setShowForm(true)
  }

  const uploadPortada = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    const file = e.target.files[0]
    setUploading(true)
    const path = `blog/${Date.now()}-${file.name.replace(/\s+/g, '-')}`
    const { data, error: uploadError } = await supabase.storage.from('habitaciones').upload(path, file)
    if (!uploadError && data) {
      const { data: { publicUrl } } = supabase.storage.from('habitaciones').getPublicUrl(path)
      setForm(f => ({ ...f, imagen_portada: publicUrl }))
    }
    setUploading(false)
    e.target.value = ''
  }

  const guardar = async () => {
    setError('')
    if (!form.titulo.trim() || !form.contenido.trim()) { setError('Título y contenido son obligatorios.'); return }
    const slug = form.slug.trim() || slugify(form.titulo)
    setSaving(true)
    const payload = { ...form, slug, updated_at: new Date().toISOString() }
    const { error: saveError } = editingId
      ? await supabase.from('blog_posts').update(payload).eq('id', editingId)
      : await supabase.from('blog_posts').insert(payload)
    setSaving(false)
    if (saveError) {
      setError(saveError.message.includes('duplicate') ? 'Ya existe un artículo con ese slug.' : 'Error al guardar el artículo.')
      return
    }
    setShowForm(false)
    fetchPosts()
  }

  const eliminar = async (id: string) => {
    if (!confirm('¿Eliminar este artículo?')) return
    await supabase.from('blog_posts').delete().eq('id', id)
    fetchPosts()
  }

  const togglePublicado = async (p: Post) => {
    await supabase.from('blog_posts').update({ publicado: !p.publicado }).eq('id', p.id)
    fetchPosts()
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary">Blog</h1>
          <p className="text-ink/40 text-sm mt-0.5">Artículos y guía local de Cajamarca</p>
        </div>
        <button onClick={abrirNuevo} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors self-start sm:self-auto">
          <Plus size={14} /> Nuevo artículo
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin w-7 h-7 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center text-ink/40">
          <Newspaper size={28} className="mx-auto mb-3 text-ink/20" />
          <p className="text-base font-medium">No hay artículos todavía</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(p => (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                {p.imagen_portada && <Image src={p.imagen_portada} alt="" fill className="object-cover" sizes="64px" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-primary text-sm truncate">{p.titulo}</p>
                <p className="text-xs text-ink/40 mt-0.5 truncate">/blog/{p.slug}</p>
              </div>
              <button
                onClick={() => togglePublicado(p)}
                className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${p.publicado ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
              >
                {p.publicado ? 'Publicado' : 'Borrador'}
              </button>
              <button onClick={() => abrirEditar(p)} className="flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-ink/60 transition-colors">
                Editar
              </button>
              <button onClick={() => eliminar(p.id)} className="flex-shrink-0 text-ink/30 hover:text-red-500 transition-colors">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
              <p className="font-bold text-primary">{editingId ? 'Editar artículo' : 'Nuevo artículo'}</p>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-ink/40">
                <X size={17} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-3.5 py-2.5">{error}</div>}

              <div>
                <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">Título</label>
                <input
                  value={form.titulo}
                  onChange={e => {
                    const titulo = e.target.value
                    setForm(f => ({ ...f, titulo, slug: slugTouched ? f.slug : slugify(titulo) }))
                  }}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9]" />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">Slug (URL)</label>
                <input
                  value={form.slug}
                  onChange={e => { setSlugTouched(true); setForm({ ...form, slug: slugify(e.target.value) }) }}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-secondary bg-[#fafaf9]" />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">Resumen (se muestra en la lista)</label>
                <textarea value={form.resumen} onChange={e => setForm({ ...form, resumen: e.target.value })}
                  rows={2}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9] resize-none" />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">Imagen de portada</label>
                {form.imagen_portada && (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden mb-2">
                    <Image src={form.imagen_portada} alt="" fill className="object-cover" sizes="500px" />
                  </div>
                )}
                <label className={`flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${uploading ? 'opacity-50' : 'hover:border-secondary'} border-gray-200`}>
                  <Upload size={15} className="text-ink/35" />
                  <span className="text-sm text-ink/55">{uploading ? 'Subiendo...' : 'Subir imagen'}</span>
                  <input type="file" accept="image/*" onChange={uploadPortada} disabled={uploading} className="hidden" />
                </label>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">Contenido</label>
                <textarea value={form.contenido} onChange={e => setForm({ ...form, contenido: e.target.value })}
                  rows={10}
                  placeholder="Escribe el artículo. Separa los párrafos con una línea en blanco."
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9] resize-none" />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-ink">Publicado</span>
                <button onClick={() => setForm({ ...form, publicado: !form.publicado })}
                  className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${form.publicado ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.publicado ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>

              <button onClick={guardar} disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-50">
                {saving ? 'Guardando...' : <><Save size={15} /> Guardar artículo</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
