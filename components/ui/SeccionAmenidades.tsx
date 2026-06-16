'use client'

import { Wifi, Coffee, Car, UtensilsCrossed, Phone, MapPin, Thermometer, Clock, Shield, Shirt, Dices, Flame } from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'

const amenidadIcons = [
  Wifi, Coffee, UtensilsCrossed, Flame,
  Phone, MapPin, Thermometer, Clock,
  Car, Shield, Shirt, Dices,
]

export default function SeccionAmenidades() {
  const { t } = useLanguage()
  const amenidades = amenidadIcons.map((Icon, i) => ({ Icon, ...t.amenidades.items[i] }))

  return (
    <section className="section-padding bg-warm" data-navbar-theme="light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-secondary font-semibold text-sm tracking-widest uppercase mb-2">{t.amenidades.eyebrow}</p>
          <h2 className="font-display text-primary text-4xl lg:text-5xl font-bold">
            {t.amenidades.title}
          </h2>
          <div className="divider-gold mx-auto" />
          <p className="text-ink/60 mt-3 max-w-xl mx-auto">
            {t.amenidades.description}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-5">
          {amenidades.map(({ Icon, label, desc }) => (
            <div
              key={label}
              className="group text-center p-5 rounded-2xl bg-white hover:bg-primary transition-all duration-300 shadow-card hover:shadow-card-hover hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-secondary/20 flex items-center justify-center mx-auto mb-3 transition-colors">
                <Icon size={22} className="text-primary group-hover:text-secondary transition-colors" />
              </div>
              <p className="font-semibold text-primary group-hover:text-white text-sm mb-1 transition-colors">{label}</p>
              <p className="text-ink/50 group-hover:text-white/60 text-xs transition-colors">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
