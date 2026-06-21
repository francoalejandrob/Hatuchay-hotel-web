'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Star, Users, Heart, ArrowRight } from 'lucide-react'
import { useHabitaciones } from '@/lib/useHabitaciones'
import { formatearPrecio, precioDesde } from '@/lib/utils'
import { useLanguage } from '@/lib/LanguageContext'

export default function SeccionHabitaciones() {
  const { habitaciones } = useHabitaciones()
  const { t } = useLanguage()
  const h = t.habitaciones

  return (
    <section className="section-padding bg-white" data-navbar-theme="light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-4">
          <div>
            <p className="text-secondary font-semibold text-sm tracking-widest uppercase mb-2">{h.eyebrow}</p>
            <h2 className="font-display text-primary text-4xl lg:text-5xl font-bold">
              {h.title}
            </h2>
            <div className="divider-gold" />
            <p className="text-ink/60 mt-3 max-w-lg">
              {h.description}
            </p>
          </div>
          <Link
            href="/habitaciones"
            className="flex items-center gap-2 text-secondary font-semibold hover:text-primary transition-colors text-sm group whitespace-nowrap"
          >
            {h.verTodas}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Cards grid — 4 habitaciones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {habitaciones.map((hab) => (
            <Link
              key={hab.id}
              href={`/habitaciones/${hab.id}`}
              className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-card-hover bg-white border border-gray-100 shadow-card"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden flex-shrink-0">
                <Image
                  src={hab.imagenes[0]}
                  alt={hab.nombre}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                />

                {/* Rating badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1 bg-secondary text-white text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-md">
                  <Star size={11} className="fill-white" />
                  5.0
                </div>

                {/* Favorite button */}
                <button
                  onClick={e => e.preventDefault()}
                  className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 transition-all"
                >
                  <Heart size={14} className="text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col flex-1">
                {/* Location */}
                <div className="flex items-center gap-1 text-ink/40 text-xs mb-2">
                  <MapPin size={11} />
                  Cajamarca, Perú
                </div>

                {/* Title */}
                <h3 className="font-display text-primary text-base font-bold leading-snug mb-1.5 group-hover:text-secondary transition-colors line-clamp-2">
                  {hab.nombre}
                </h3>

                {/* Description */}
                <p className="text-ink/55 text-xs leading-relaxed mb-3 line-clamp-2 flex-1">
                  {hab.descripcion}
                </p>

                {/* Capacity */}
                <div className="flex items-center gap-1.5 text-ink/40 text-xs mb-4">
                  <Users size={11} />
                  {hab.capacidad === 1
                    ? `1 ${h.huesped}`
                    : `${h.hasta} ${hab.capacidad} ${h.huespedes}`}
                  <span className="mx-1">·</span>
                  <span className="capitalize">{hab.tipo}</span>
                </div>

                {/* Price + CTA */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    {hab.precios_por_huesped && Object.keys(hab.precios_por_huesped).length > 1 && (
                      <span className="text-ink/35 text-[10px] block leading-none mb-0.5">{h.desde}</span>
                    )}
                    <span className="text-secondary font-bold text-base">{formatearPrecio(precioDesde(hab))}</span>
                    <span className="text-ink/40 text-xs">{h.noche}</span>
                  </div>
                  <span className="bg-secondary hover:bg-secondary-dark text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors">
                    {h.reservar}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
