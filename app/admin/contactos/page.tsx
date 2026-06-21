'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Mail, MailOpen, Trash2, X } from 'lucide-react'

interface Contacto {
  id: string
  nombre: string
  email: string
  asunto: string | null
  mensaje: string
  leido: boolean
  created_at: string
}

export default function ContactosAdminPage() {
  const [contactos, setContactos] = useState<Contacto[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Contacto | null>(null)

  const fetchContactos = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('contactos')
      .select('*')
      .order('created_at', { ascending: false })
    setContactos((data as Contacto[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchContactos() }, [fetchContactos])

  const abrir = async (c: Contacto) => {
    setSelected(c)
    if (!c.leido) {
      await supabase.from('contactos').update({ leido: true }).eq('id', c.id)
      setContactos(prev => prev.map(x => x.id === c.id ? { ...x, leido: true } : x))
    }
  }

  const eliminar = async (id: string) => {
    if (!confirm('¿Eliminar este mensaje?')) return
    await supabase.from('contactos').delete().eq('id', id)
    setSelected(null)
    fetchContactos()
  }

  const noLeidos = contactos.filter(c => !c.leido).length

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Mensajes de contacto</h1>
        <p className="text-ink/40 text-sm mt-0.5">
          {contactos.length} mensaje{contactos.length !== 1 ? 's' : ''}
          {noLeidos > 0 && <span className="text-orange-600 font-semibold"> · {noLeidos} sin leer</span>}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin w-7 h-7 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : contactos.length === 0 ? (
          <div className="text-center py-16 text-ink/40">
            <Mail size={32} className="mx-auto mb-3 text-ink/20" />
            <p className="text-base font-medium">No hay mensajes todavía</p>
            <p className="text-sm mt-1">Los mensajes del formulario de contacto aparecerán aquí</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {contactos.map(c => (
              <button
                key={c.id}
                onClick={() => abrir(c)}
                className={`w-full text-left flex items-start gap-3 p-4 hover:bg-[#f4f3f0]/60 transition-colors ${!c.leido ? 'bg-orange-50/40' : ''}`}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {c.leido ? <MailOpen size={16} className="text-ink/30" /> : <Mail size={16} className="text-orange-500" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm truncate ${!c.leido ? 'font-bold text-primary' : 'font-medium text-ink'}`}>{c.nombre}</p>
                    <span className="text-xs text-ink/35 flex-shrink-0">{new Date(c.created_at).toLocaleDateString('es-PE')}</span>
                  </div>
                  <p className="text-xs text-ink/45 truncate">{c.email} {c.asunto && `· ${c.asunto}`}</p>
                  <p className="text-sm text-ink/55 truncate mt-0.5">{c.mensaje}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
              <div>
                <p className="font-bold text-primary">{selected.nombre}</p>
                <p className="text-sm text-ink/50">{selected.email}</p>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-ink/40">
                <X size={17} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {selected.asunto && (
                <div>
                  <p className="text-xs font-semibold text-ink/35 uppercase tracking-wider mb-1">Asunto</p>
                  <p className="text-sm text-ink">{selected.asunto}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-ink/35 uppercase tracking-wider mb-1">Mensaje</p>
                <p className="text-sm text-ink/70 bg-[#f4f3f0] rounded-xl p-4 whitespace-pre-wrap">{selected.mensaje}</p>
              </div>
              <p className="text-xs text-ink/35">{new Date(selected.created_at).toLocaleString('es-PE')}</p>
              <div className="flex gap-2 pt-2">
                <a
                  href={`mailto:${selected.email}`}
                  className="flex-1 text-center bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
                >
                  Responder por email
                </a>
                <button
                  onClick={() => eliminar(selected.id)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors text-ink/50"
                >
                  <Trash2 size={14} /> Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
