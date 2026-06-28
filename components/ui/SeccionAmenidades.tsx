'use client'

import { useRef } from 'react'
import { Wifi, Coffee, Car, UtensilsCrossed, Phone, MapPin, Thermometer, Clock, Shield, Shirt, Dices, Flame, ChevronRight } from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'

const amenidadIcons = [
  Wifi, Coffee, UtensilsCrossed, Flame,
  Phone, MapPin, Thermometer, Clock,
  Car, Shield, Shirt, Dices,
]

export default function SeccionAmenidades() {
  const { t } = useLanguage()
  const amenidades = amenidadIcons.map((Icon, i) => ({ Icon, ...t.amenidades.items[i] }))
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollNext = () => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = (el.firstElementChild as HTMLElement)?.offsetWidth ?? 100
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10
    el.scrollTo({
      left: atEnd ? 0 : el.scrollLeft + cardWidth * 2 + 24,
      behavior: 'smooth',
    })
  }

  return (
    <section className="section-padding bg-warm" data-navbar-theme="light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <p className="text-secondary font-semibold text-sm tracking-widest uppercase mb-2">{t.amenidades.eyebrow}</p>
          <h2 className="font-display text-primary text-3xl sm:text-4xl lg:text-5xl font-bold">
            {t.amenidades.title}
          </h2>
          <div className="divider-gold mx-auto" />
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            {t.amenidades.description}
          </p>
        </div>

        {/* Mobile: horizontal scroll, 4 cards visible + arrow */}
        <div className="relative sm:hidden">
          <div
            ref={scrollRef}
            className="flex gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory hide-scrollbar"
          >
            {amenidades.map(({ Icon, label }) => (
              <div
                key={label}
                className="flex-shrink-0 snap-start text-center p-2.5 rounded-xl bg-white shadow-card"
                style={{ width: 'calc(25% - 6px)' }}
              >
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <Icon size={22} className="text-primary" />
                </div>
                <p className="font-semibold text-primary text-[10.5px] leading-tight line-clamp-2">{label}</p>
              </div>
            ))}
          </div>
          <button
            onClick={scrollNext}
            aria-label="Ver más servicios"
            className="absolute -right-1 top-1/2 -translate-y-1/2 translate-x-1/2 w-9 h-9 rounded-full bg-secondary text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Tablet / desktop: full grid */}
        <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-5">
          {amenidades.map(({ Icon, label, desc }) => (
            <div
              key={label}
              className="group text-center p-5 rounded-2xl bg-white hover:bg-primary transition-all duration-300 shadow-card hover:shadow-card-hover hover:-translate-y-1"
            >
              <div className="w-16 h-16 rounded-xl bg-primary/10 group-hover:bg-secondary/20 flex items-center justify-center mx-auto mb-3 transition-colors">
                <Icon size={30} className="text-primary group-hover:text-secondary transition-colors" />
              </div>
              <p className="font-semibold text-primary group-hover:text-white text-sm mb-1 transition-colors">{label}</p>
              <p className="text-gray-500 group-hover:text-white/70 text-xs transition-colors">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
