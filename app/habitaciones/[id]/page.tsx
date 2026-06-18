'use client'

import { useState, useEffect } from 'react'
import { notFound, useParams, useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { DayPicker, DateRange } from 'react-day-picker'
import { es } from 'date-fns/locale'
import { Users, Star, ChevronLeft, ChevronRight, ArrowRight, Check, CalendarDays, X } from 'lucide-react'
import { useHabitaciones } from '@/lib/useHabitaciones'
import { formatearPrecio, calcularNoches, formatearFecha } from '@/lib/utils'
import 'react-day-picker/dist/style.css'

export default function DetalleHabitacionPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { habitaciones, loading: loadingHabs } = useHabitaciones()
  const habitacion = habitaciones.find((h) => h.id === params.id)

  const [imageIdx, setImageIdx] = useState(0)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [huespedes, setHuespedes] = useState(2)

  useEffect(() => {
    const ci = searchParams.get('checkin')
    const co = searchParams.get('checkout')
    const h = searchParams.get('huespedes')
    if (ci && co) {
      setDateRange({ from: new Date(ci), to: new Date(co) })
    }
    if (h) setHuespedes(Number(h))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loadingHabs) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>
  if (!habitacion) return notFound()

  const noches = dateRange?.from && dateRange?.to
    ? calcularNoches(dateRange.from.toISOString(), dateRange.to.toISOString())
    : 0
  const total = noches * habitacion.precio_por_noche

  const handleReservar = () => {
    if (!dateRange?.from || !dateRange?.to) {
      alert('Por favor selecciona las fechas de check-in y check-out.')
      return
    }
    const params = new URLSearchParams({
      habitacion_id: habitacion.id,
      checkin: dateRange.from.toISOString().split('T')[0],
      checkout: dateRange.to.toISOString().split('T')[0],
      huespedes: String(huespedes),
    })
    router.push(`/reservas?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-warm">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-warm-dark pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-2 text-sm text-ink/50">
          <a href="/" className="hover:text-primary transition-colors">Inicio</a>
          <span>/</span>
          <a href="/habitaciones" className="hover:text-primary transition-colors">Habitaciones</a>
          <span>/</span>
          <span className="text-primary font-medium">{habitacion.nombre}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: images + info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <div className="space-y-3">
              {/* Main image */}
              <div
                className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer group"
                onClick={() => setLightbox(imageIdx)}
              >
                <Image
                  src={habitacion.imagenes[imageIdx]}
                  alt={habitacion.nombre}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1200px) 100vw, 70vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
                <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur">
                  {imageIdx + 1} / {habitacion.imagenes.length}
                </div>
                {/* Nav arrows */}
                {imageIdx > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setImageIdx(i => i - 1) }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow transition-all"
                  >
                    <ChevronLeft size={20} className="text-primary" />
                  </button>
                )}
                {imageIdx < habitacion.imagenes.length - 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setImageIdx(i => i + 1) }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow transition-all"
                  >
                    <ChevronRight size={20} className="text-primary" />
                  </button>
                )}
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {habitacion.imagenes.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImageIdx(i)}
                    className={`relative w-16 h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                      i === imageIdx ? 'border-secondary' : 'border-transparent hover:border-primary/30'
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="bg-secondary/10 text-secondary text-xs font-bold px-3 py-1 rounded-full capitalize mb-2 inline-block">
                    {habitacion.tipo}
                  </span>
                  <h1 className="font-display text-primary text-3xl lg:text-4xl font-bold">{habitacion.nombre}</h1>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-secondary fill-secondary" />)}
                  </div>
                  <p className="text-ink/40 text-xs mt-1">Calificación perfecta</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mb-5 text-sm text-ink/60">
                <span className="flex items-center gap-1.5">
                  <Users size={15} className="text-secondary" />
                  Hasta {habitacion.capacidad} {habitacion.capacidad === 1 ? 'huésped' : 'huéspedes'}
                </span>
              </div>

              <p className="text-ink/70 leading-relaxed">{habitacion.descripcion}</p>
            </div>

            {/* Amenidades */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <h2 className="font-display text-primary text-2xl font-bold mb-5">Lo que incluye</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {habitacion.amenidades.map((a) => (
                  <div key={a} className="flex items-center gap-2 text-sm text-ink/70">
                    <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                      <Check size={11} className="text-secondary" />
                    </div>
                    {a}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: booking widget */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-card-hover p-6 sticky top-24">
              <div className="flex items-baseline justify-between mb-5">
                <div>
                  <span className="font-display text-primary text-3xl font-bold">{formatearPrecio(habitacion.precio_por_noche)}</span>
                  <span className="text-ink/40 text-sm"> / noche</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={13} className="text-secondary fill-secondary" />
                  <span className="text-sm font-semibold">5.0</span>
                </div>
              </div>

              {/* Calendar */}
              <div className="mb-4">
                <label className="flex items-center gap-1.5 label-hotel">
                  <CalendarDays size={14} /> Selecciona las fechas
                </label>
                <div className="border border-warm-dark rounded-xl p-2 mt-1.5 overflow-hidden">
                  <DayPicker
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    locale={es}
                    disabled={{ before: new Date() }}
                    numberOfMonths={1}
                    className="!font-body text-sm"
                  />
                </div>
                {dateRange?.from && dateRange?.to && (
                  <div className="mt-2 p-3 bg-warm rounded-xl text-sm flex justify-between items-center">
                    <div>
                      <p className="text-ink/50 text-xs">Fechas seleccionadas</p>
                      <p className="font-medium text-primary">
                        {formatearFecha(dateRange.from)} → {formatearFecha(dateRange.to)}
                      </p>
                    </div>
                    <button onClick={() => setDateRange(undefined)} className="text-ink/30 hover:text-ink/60">
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Guests */}
              <div className="mb-5">
                <label className="label-hotel">Huéspedes</label>
                <select
                  value={huespedes}
                  onChange={(e) => setHuespedes(Number(e.target.value))}
                  className="input-hotel"
                >
                  {[...Array(habitacion.capacidad)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? 'persona' : 'personas'}</option>
                  ))}
                </select>
              </div>

              {/* Price summary */}
              {noches > 0 && (
                <div className="bg-warm rounded-xl p-4 mb-4 text-sm space-y-2">
                  <div className="flex justify-between text-ink/70">
                    <span>{formatearPrecio(habitacion.precio_por_noche)} × {noches} {noches === 1 ? 'noche' : 'noches'}</span>
                    <span>{formatearPrecio(habitacion.precio_por_noche * noches)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-primary border-t border-warm-dark pt-2">
                    <span>Total</span>
                    <span className="text-lg">{formatearPrecio(total)}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleReservar}
                className="w-full btn-secondary rounded-xl flex items-center justify-center gap-2 text-base py-4"
              >
                Reservar esta habitación <ArrowRight size={18} />
              </button>

              <p className="text-center text-ink/40 text-xs mt-3">
                Sin cobros adicionales · Mejor precio garantizado
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 rounded-full p-2" onClick={() => setLightbox(null)}>
            <X size={24} />
          </button>
          {lightbox > 0 && (
            <button className="absolute left-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-3" onClick={(e) => { e.stopPropagation(); setLightbox(l => Math.max(0, (l ?? 1) - 1)) }}>
              <ChevronLeft size={24} />
            </button>
          )}
          <div className="relative w-full max-w-5xl h-[85vh] mx-16" onClick={(e) => e.stopPropagation()}>
            <Image src={habitacion.imagenes[lightbox]} alt="" fill className="object-contain" sizes="95vw" />
          </div>
          {lightbox < habitacion.imagenes.length - 1 && (
            <button className="absolute right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-3" onClick={(e) => { e.stopPropagation(); setLightbox(l => Math.min(habitacion.imagenes.length - 1, (l ?? 0) + 1)) }}>
              <ChevronRight size={24} />
            </button>
          )}
          <p className="absolute bottom-4 text-white/50 text-sm">{lightbox + 1} / {habitacion.imagenes.length}</p>
        </div>
      )}
    </div>
  )
}
