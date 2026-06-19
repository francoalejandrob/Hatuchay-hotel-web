'use client'

import { useState } from 'react'
import { MapPin, Phone, Mail, MessageCircle, Clock, Send, Loader2 } from 'lucide-react'
import { HOTEL } from '@/lib/constants'

export default function ContactoPage() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [asunto, setAsunto] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, asunto, mensaje }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No se pudo enviar el mensaje.')
      }
      setEnviado(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el mensaje. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-warm">
      {/* Hero */}
      <div className="bg-primary text-white pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-secondary font-semibold text-sm tracking-widest uppercase mb-2">Contáctanos</p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-3">Estamos aquí para ti</h1>
          <p className="text-white/60 max-w-xl">Escríbenos, llámanos o visítanos. Nuestro equipo responde en menos de 2 horas.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact info */}
          <div className="space-y-5">
            {[
              { icon: MapPin, titulo: 'Dirección', valor: HOTEL.direccion, href: HOTEL.googleMaps, label: 'Ver en Maps' },
              { icon: Phone, titulo: 'Teléfono', valor: HOTEL.telefono, href: `tel:${HOTEL.telefono}`, label: 'Llamar ahora' },
              { icon: MessageCircle, titulo: 'WhatsApp', valor: HOTEL.whatsapp, href: `https://wa.me/${HOTEL.whatsapp.replace(/\s/g, '').replace('+', '')}`, label: 'Abrir WhatsApp' },
              { icon: Mail, titulo: 'Email', valor: HOTEL.email, href: `mailto:${HOTEL.email}`, label: 'Enviar email' },
              { icon: Clock, titulo: 'Horario', valor: `Check-in: ${HOTEL.checkIn} | Check-out: ${HOTEL.checkOut}\nRecepción: 24 horas`, href: null, label: null },
            ].map(({ icon: Icon, titulo, valor, href, label }) => (
              <div key={titulo} className="bg-white rounded-2xl p-5 shadow-card flex gap-4">
                <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-secondary" />
                </div>
                <div>
                  <p className="font-semibold text-primary text-sm mb-0.5">{titulo}</p>
                  <p className="text-ink/60 text-sm whitespace-pre-line">{valor}</p>
                  {href && label && (
                    <a href={href} target={href.startsWith('http') ? '_blank' : '_self'} rel="noopener noreferrer"
                      className="text-secondary text-xs font-semibold hover:underline mt-1 inline-block">
                      {label} →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            {enviado ? (
              <div className="bg-white rounded-2xl shadow-card p-10 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send size={28} className="text-green-500" />
                </div>
                <h2 className="font-display text-primary text-2xl font-bold mb-2">¡Mensaje enviado!</h2>
                <p className="text-ink/60">Nos pondremos en contacto contigo en menos de 2 horas hábiles. ¡Gracias por escribirnos!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-8 space-y-5">
                <h2 className="font-display text-primary text-2xl font-bold">Envíanos un mensaje</h2>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label-hotel">Nombre *</label>
                    <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="input-hotel" required />
                  </div>
                  <div>
                    <label className="label-hotel">Email *</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-hotel" required />
                  </div>
                </div>

                <div>
                  <label className="label-hotel">Asunto</label>
                  <select value={asunto} onChange={(e) => setAsunto(e.target.value)} className="input-hotel">
                    <option value="">Selecciona un asunto</option>
                    <option value="reserva">Consulta de reserva</option>
                    <option value="disponibilidad">Disponibilidad</option>
                    <option value="precios">Precios y tarifas</option>
                    <option value="cancelacion">Cancelación</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="label-hotel">Mensaje *</label>
                  <textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)} className="input-hotel" rows={5} placeholder="¿En qué podemos ayudarte?" required />
                </div>

                <button type="submit" disabled={loading} className="btn-secondary rounded-xl w-full flex items-center justify-center gap-2 py-4 text-base">
                  {loading ? <><Loader2 size={18} className="animate-spin" /> Enviando...</> : <><Send size={18} /> Enviar mensaje</>}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="mt-10 rounded-2xl overflow-hidden shadow-card h-72">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3834.5!2d-78.5021!3d-7.1638!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91b03a6c1e7a58df%3A0x3ab02f7c5e2a8fb2!2sHatuchay%20Inka%20Apart%20Hotel!5e0!3m2!1ses!2spe!4v1709000000000!5m2!1ses!2spe"
            width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Mapa Hatuchay Inka"
          />
        </div>
      </div>
    </div>
  )
}
