'use client'

import { useState } from 'react'
import { Star, Send, CheckCircle } from 'lucide-react'

const STAR_LABELS = ['', 'Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente']

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  const display = hovered || value

  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
          className="cursor-pointer transition-transform duration-100 hover:scale-110 active:scale-95"
        >
          <Star
            size={32}
            className={`transition-colors duration-150 ${
              star <= display ? 'text-secondary fill-secondary' : 'text-gray-300 fill-gray-100'
            }`}
          />
        </button>
      ))}
      {display > 0 && (
        <span className="ml-2 text-sm font-semibold text-secondary">{STAR_LABELS[display]}</span>
      )}
    </div>
  )
}

// maps 1-5 stars to the 6-10 scale used in the system
function starToScore(stars: number): number {
  return stars + 5
}

export default function FormularioResena() {
  const [stars, setStars]   = useState(0)
  const [name, setName]     = useState('')
  const [origin, setOrigin] = useState('')
  const [text, setText]     = useState('')
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (stars === 0) { setError('Por favor selecciona una puntuación.'); return }
    if (!name.trim()) { setError('Por favor ingresa tu nombre.'); return }
    if (text.trim().length < 20) { setError('La reseña debe tener al menos 20 caracteres.'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/resenas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, text, score: starToScore(stars), origin }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al enviar.')
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar la reseña.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <section className="section-padding bg-warm" data-navbar-theme="light">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-3xl shadow-card p-10 sm:p-14">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-primary" />
            </div>
            <h3 className="font-display text-primary text-2xl font-bold mb-3">
              ¡Gracias por tu reseña!
            </h3>
            <p className="text-gray-500 leading-relaxed">
              Tu opinión ha sido recibida y será publicada tras una breve revisión por nuestro equipo. Te lo agradecemos mucho.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="section-padding bg-warm" data-navbar-theme="light">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-secondary font-semibold text-sm tracking-widest uppercase mb-2">Tu opinión importa</p>
          <h2 className="font-display text-primary text-3xl sm:text-4xl font-bold">
            Déjanos tu reseña
          </h2>
          <div className="divider-gold mx-auto" />
          <p className="text-gray-500 mt-3 max-w-md mx-auto">
            ¿Ya te hospedaste con nosotros? Comparte tu experiencia — tu reseña se publicará tras una breve revisión.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="bg-white rounded-3xl shadow-card p-6 sm:p-8 space-y-6">

            {/* Stars */}
            <div>
              <label className="block text-sm font-semibold text-ink mb-3">
                Puntuación <span className="text-red-500">*</span>
              </label>
              <StarRating value={stars} onChange={setStars} />
            </div>

            {/* Name */}
            <div>
              <label htmlFor="resena-name" className="block text-sm font-semibold text-ink mb-1.5">
                Tu nombre <span className="text-red-500">*</span>
              </label>
              <input
                id="resena-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej: María García"
                maxLength={60}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-[#fafaf9] focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/15 transition-all"
              />
            </div>

            {/* Origin */}
            <div>
              <label htmlFor="resena-origin" className="block text-sm font-semibold text-ink mb-1.5">
                País · Tipo de viaje <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                id="resena-origin"
                type="text"
                value={origin}
                onChange={e => setOrigin(e.target.value)}
                placeholder="Ej: Perú · En pareja"
                maxLength={80}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-[#fafaf9] focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/15 transition-all"
              />
            </div>

            {/* Text */}
            <div>
              <label htmlFor="resena-text" className="block text-sm font-semibold text-ink mb-1.5">
                Tu reseña <span className="text-red-500">*</span>
              </label>
              <textarea
                id="resena-text"
                value={text}
                onChange={e => setText(e.target.value)}
                rows={4}
                placeholder="Cuéntanos cómo fue tu estadía, qué te gustó más, si recomendarías el hotel..."
                maxLength={600}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-[#fafaf9] focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/15 transition-all resize-none"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{text.length}/600</p>
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={16} />
              )}
              {loading ? 'Enviando...' : 'Enviar reseña'}
            </button>

            <p className="text-xs text-gray-400 text-center">
              Tu reseña será revisada por nuestro equipo antes de publicarse.
            </p>
          </div>
        </form>
      </div>
    </section>
  )
}
