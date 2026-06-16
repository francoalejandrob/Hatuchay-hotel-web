'use client'

import Image from 'next/image'
import { MapPin, Palette } from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'

const artists = ['Joan Alfaro', 'Urteaga', 'Padilla', 'Kadu', 'Fernández']

export default function SeccionNosotros() {
  const { t } = useLanguage()
  const n = t.nosotros

  return (
    <section className="relative overflow-hidden bg-white py-20 md:py-28" data-navbar-theme="light">

      {/* Fondo: suave acento verde en esquina superior derecha */}
      <div
        className="absolute -top-40 -right-40 w-[560px] h-[560px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(3,71,36,0.04) 0%, transparent 70%)' }}
      />
      {/* Acento dorado sutil esquina inferior izquierda */}
      <div
        className="absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">

          {/* ── Columna izquierda: foto con marco decorativo ── */}
          <div className="relative order-2 lg:order-1">

            {/* Marco dorado offset — decorativo */}
            <div
              className="absolute -bottom-4 -right-4 w-full h-full rounded-2xl pointer-events-none"
              style={{ border: '2px solid rgba(201,168,76,0.22)', borderRadius: '16px' }}
            />
            {/* Segundo marco — más sutil */}
            <div
              className="absolute -top-3 -left-3 w-20 h-20 pointer-events-none"
              style={{
                borderTop: '2px solid rgba(201,168,76,0.35)',
                borderLeft: '2px solid rgba(201,168,76,0.35)',
                borderRadius: '8px 0 0 0',
              }}
            />
            <div
              className="absolute -bottom-3 -right-3 w-20 h-20 pointer-events-none"
              style={{
                borderBottom: '2px solid rgba(201,168,76,0.35)',
                borderRight: '2px solid rgba(201,168,76,0.35)',
                borderRadius: '0 0 8px 0',
              }}
            />

            {/* Imagen principal */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: '4/5' }}>
              <Image
                src="/images/hotel/nosotros.jpg"
                alt={n.imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                quality={85}
              />

              {/* Overlay gradiente inferior — etiqueta ubicación */}
              <div
                className="absolute bottom-0 left-0 right-0 flex items-end p-5 pt-16"
                style={{ background: 'linear-gradient(to top, rgba(3,71,36,0.85) 0%, transparent 100%)' }}
              >
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-secondary flex-shrink-0" />
                  <span className="text-white/90 text-sm font-medium">{n.location}</span>
                </div>
              </div>
            </div>

            {/* Badge flotante — score */}
            <div
              className="absolute -top-4 -right-4 lg:-right-6 w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #034724 0%, #0a5c32 100%)', border: '3px solid rgba(201,168,76,0.6)' }}
            >
              <span className="text-secondary font-bold text-xl leading-none">9.2</span>
              <span className="text-white/60 text-[9px] uppercase tracking-wider mt-0.5">Booking</span>
            </div>
          </div>

          {/* ── Columna derecha: texto ── */}
          <div className="order-1 lg:order-2">

            {/* Eyebrow */}
            <p className="text-secondary font-semibold text-xs tracking-[0.25em] uppercase mb-3">
              {n.eyebrow}
            </p>

            {/* Título */}
            <h2 className="font-display font-bold text-primary leading-[1.1] mb-4"
              style={{ fontSize: 'clamp(2.1rem, 4.5vw, 3.4rem)' }}>
              {n.title.split('\n').map((line, i) => (
                <span key={i}>{line}{i === 0 && <br />}</span>
              ))}
            </h2>

            {/* Divider dorado */}
            <div className="divider-gold" />

            {/* Párrafo 1 */}
            <p className="text-ink/65 text-[15px] leading-[1.8] mt-4 mb-6">
              {n.p1}
            </p>

            {/* Separador fino */}
            <div className="border-t border-primary/8 mb-6" />

            {/* Párrafo 2 — arte, con icono */}
            <div className="flex items-start gap-4 mb-6">
              <div
                className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center mt-0.5"
                style={{ background: 'rgba(201,168,76,0.10)', border: '1px solid rgba(201,168,76,0.20)' }}
              >
                <Palette size={19} className="text-secondary" />
              </div>
              <div>
                <p className="text-primary font-semibold text-sm mb-1">{n.artLabel}</p>
                <p className="text-ink/65 text-[15px] leading-[1.8]">{n.p2}</p>
              </div>
            </div>

            {/* Artistas — pill tags doradas */}
            <div className="flex flex-wrap gap-2">
              {artists.map((artist) => (
                <span
                  key={artist}
                  className="text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-default"
                  style={{
                    color: '#c9a84c',
                    background: 'rgba(201,168,76,0.08)',
                    border: '1px solid rgba(201,168,76,0.28)',
                  }}
                >
                  {artist}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
