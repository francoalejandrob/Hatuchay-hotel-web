'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Users, Star, Filter, ArrowRight, Bed, Search, ChevronDown } from 'lucide-react'
import { useHabitaciones } from '@/lib/useHabitaciones'
import { formatearPrecio, precioDesde } from '@/lib/utils'

function HabitacionesContent() {
  const { habitaciones } = useHabitaciones()
  const searchParams = useSearchParams()
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [filtroCapacidad, setFiltroCapacidad] = useState<number>(1)
  const [filtroPrecioMax, setFiltroPrecioMax] = useState<number>(600)

  const checkin = searchParams.get('checkin') || ''
  const checkout = searchParams.get('checkout') || ''
  const huespedes = Number(searchParams.get('huespedes') || 1)

  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)

  const habitacionesFiltradas = useMemo(() => {
    return habitaciones.filter((h) => {
      if (filtroTipo !== 'todos' && h.tipo !== filtroTipo) return false
      if (h.capacidad < filtroCapacidad) return false
      if (precioDesde(h) > filtroPrecioMax) return false
      return true
    })
  }, [habitaciones, filtroTipo, filtroCapacidad, filtroPrecioMax])

  return (
    <div className="min-h-screen bg-warm">
      {/* Hero banner */}
      <div className="bg-primary text-white pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-secondary font-semibold text-sm tracking-widest uppercase mb-2">Alojamiento</p>
          <h1 className="font-display text-4xl lg:text-6xl font-bold mb-3">Habitaciones & Suites</h1>
          <p className="text-white/60 max-w-xl">
            Cada apartamento diseñado para ofrecerte la comodidad de tu hogar con los servicios de un hotel de lujo en Cajamarca.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-card p-6 lg:sticky lg:top-24">
              <button
                className="lg:hidden w-full flex items-center justify-between font-semibold text-primary text-sm tracking-widest uppercase mb-0"
                onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
              >
                <span className="flex items-center gap-2"><Filter size={15} /> Filtros</span>
                <ChevronDown size={16} className={`transition-transform duration-300 ${filtrosAbiertos ? 'rotate-180' : ''}`} />
              </button>
              <h3 className="hidden lg:flex font-semibold text-primary text-sm tracking-widest uppercase items-center gap-2 mb-5">
                <Filter size={15} /> Filtros
              </h3>
              <div className={`lg:block overflow-hidden transition-all duration-300 ${filtrosAbiertos ? 'mt-5 max-h-[600px]' : 'max-h-0 lg:max-h-none'}`}>

              {/* Tipo */}
              <div className="mb-5">
                <label className="label-hotel">Tipo de habitación</label>
                <div className="space-y-2 mt-2">
                  {['todos', 'suite', 'familiar', 'doble', 'simple'].map((tipo) => (
                    <button
                      key={tipo}
                      onClick={() => setFiltroTipo(tipo)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all capitalize ${
                        filtroTipo === tipo
                          ? 'bg-primary text-white font-semibold'
                          : 'hover:bg-warm text-ink/70'
                      }`}
                    >
                      {tipo === 'todos' ? 'Todos los tipos' : tipo}
                    </button>
                  ))}
                </div>
              </div>

              {/* Capacidad */}
              <div className="mb-5">
                <label className="label-hotel">Huéspedes mínimo</label>
                <select
                  value={filtroCapacidad}
                  onChange={(e) => setFiltroCapacidad(Number(e.target.value))}
                  className="input-hotel mt-1"
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>
                  ))}
                </select>
              </div>

              {/* Precio */}
              <div className="mb-5">
                <label className="label-hotel">Precio máximo por noche</label>
                <div className="flex items-center justify-between mb-1 mt-1">
                  <span className="text-ink/50 text-xs">S/ 100</span>
                  <span className="text-primary font-semibold text-sm">S/ {filtroPrecioMax}</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={600}
                  step={50}
                  value={filtroPrecioMax}
                  onChange={(e) => setFiltroPrecioMax(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Search bar */}
              {(checkin || checkout) && (
                <div className="mt-4 p-3 bg-warm rounded-xl text-sm">
                  <p className="text-ink/50 text-xs mb-1">Búsqueda actual</p>
                  {checkin && <p className="text-primary font-medium">Check-in: {checkin}</p>}
                  {checkout && <p className="text-primary font-medium">Check-out: {checkout}</p>}
                  {huespedes > 1 && <p className="text-primary font-medium">{huespedes} huéspedes</p>}
                </div>
              )}
              </div>{/* end collapsible */}
            </div>{/* end bg-white card */}
          </aside>

          {/* Results */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-ink/60 text-sm">
                <span className="font-semibold text-primary">{habitacionesFiltradas.length}</span> habitaciones disponibles
              </p>
            </div>

            <div className="space-y-6">
              {habitacionesFiltradas.map((hab) => (
                <Link
                  key={hab.id}
                  href={`/habitaciones/${hab.id}${checkin ? `?checkin=${checkin}&checkout=${checkout}&huespedes=${huespedes}` : ''}`}
                  className="group flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5"
                >
                  {/* Image */}
                  <div className="img-zoom relative w-full md:w-72 h-56 md:h-auto flex-shrink-0">
                    <Image
                      src={hab.imagenes[0]}
                      alt={hab.nombre}
                      fill
                      className="object-cover"
                      sizes="300px"
                    />
                    <div className="absolute top-3 left-3 bg-secondary text-white text-xs font-bold px-3 py-1 rounded-full capitalize">
                      {hab.tipo}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h2 className="font-display text-primary text-2xl font-bold group-hover:text-secondary transition-colors">
                          {hab.nombre}
                        </h2>
                        <div className="flex items-center gap-1 ml-4 flex-shrink-0">
                          <Star size={14} className="text-secondary fill-secondary" />
                          <span className="text-sm font-semibold">5.0</span>
                        </div>
                      </div>

                      <p className="text-ink/60 text-sm leading-relaxed mb-4 line-clamp-2">{hab.descripcion}</p>

                      <div className="flex items-center gap-4 text-sm text-ink/50 mb-4">
                        <span className="flex items-center gap-1.5">
                          <Users size={14} className="text-secondary" />
                          {hab.capacidad} {hab.capacidad === 1 ? 'huésped' : 'huéspedes'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Bed size={14} className="text-secondary" />
                          {hab.tipo === 'familiar' ? '2 camas' : '1 cama'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Search size={14} className="text-secondary" />
                          {hab.imagenes.length} fotos
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {hab.amenidades.slice(0, 5).map((a) => (
                          <span key={a} className="bg-warm text-ink/60 text-xs px-2.5 py-1 rounded-full">
                            {a}
                          </span>
                        ))}
                        {hab.amenidades.length > 5 && (
                          <span className="bg-warm text-primary text-xs px-2.5 py-1 rounded-full font-medium">
                            +{hab.amenidades.length - 5}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-warm-dark">
                      <div>
                        {hab.precios_por_huesped && Object.keys(hab.precios_por_huesped).length > 1 && (
                          <span className="text-ink/35 text-[10px] block leading-none mb-0.5">Desde</span>
                        )}
                        <span className="text-2xl font-bold text-primary">{formatearPrecio(precioDesde(hab))}</span>
                        <span className="text-ink/40 text-sm"> / noche</span>
                      </div>
                      <span className="flex items-center gap-2 bg-primary group-hover:bg-secondary text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all">
                        Ver habitación <ArrowRight size={15} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}

              {habitacionesFiltradas.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-ink/40 text-lg">No se encontraron habitaciones con estos filtros.</p>
                  <button
                    onClick={() => { setFiltroTipo('todos'); setFiltroPrecioMax(600); setFiltroCapacidad(1) }}
                    className="mt-4 btn-primary rounded-full"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default function HabitacionesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
      <HabitacionesContent />
    </Suspense>
  )
}
