'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const testimonials = [
  // Score 10 ──────────────────────────────
  {
    score: 10,
    text: 'El trato del personal, muy amable y servicial.',
    name: 'Keith',
    origin: 'Perú · Habitación Familiar',
    date: 'Abr 2026',
    initials: 'K',
    color: '#2d6a4f',
  },
  {
    score: 10,
    text: 'Agua caliente, ubicación cerca a la plaza, wifi, el desayuno a la habitación.',
    name: 'Nataly',
    origin: 'Perú · En pareja',
    date: 'Sep 2025',
    initials: 'N',
    color: '#1a5276',
  },
  {
    score: 10,
    text: 'La atención, amabilidad del Sr Eduardo y su preocupación porque sus huéspedes se sientan cómodos hace que uno se sienta como en casa. 100% recomiendo el alojamiento!',
    name: 'Eduardo',
    origin: 'Perú · En familia',
    date: 'Sep 2025',
    initials: 'E',
    color: '#784212',
  },
  {
    score: 10,
    text: 'El departamento muy lindo, el desayuno muy rico y puntual, la habitación muy limpia, muy agradable y la atención excelente.',
    name: 'Jimenez',
    origin: 'Perú · Apartamento',
    date: 'Oct 2024',
    initials: 'J',
    color: '#6c3483',
  },
  {
    score: 10,
    text: 'La ubicación súper céntrica cerca a la plaza de armas, la amabilidad de los host y la comodidad del hotel. El desayuno súper completo.',
    name: 'Nathalie',
    origin: 'Perú · En grupo',
    date: 'Mar 2024',
    initials: 'N',
    color: '#0e6655',
  },
  {
    score: 10,
    text: 'Lugar acogedor, atendido por sus dueños. Muy amables y siempre pendientes de que estés cómodo. Camas cómodas y desayuno increíble!',
    name: 'Matias',
    origin: 'Chile · Solo',
    date: 'Nov 2023',
    initials: 'M',
    color: '#b7950b',
  },
  {
    score: 10,
    text: 'The breakfast everyday is delicious. We really enjoyed our stay. The location is great and close to all the sights.',
    name: 'Renee',
    origin: 'EEUU · Suite Deluxe',
    date: 'Ene 2026',
    initials: 'R',
    color: '#117a65',
  },
  {
    score: 10,
    text: 'The huge, cute, funky apartment, full kitchen, comfortable beds, great water pressure and lots of hot water. The man who runs the hotel is a highlight.',
    name: 'Laurie',
    origin: 'EEUU · Suite Deluxe',
    date: 'Oct 2024',
    initials: 'L',
    color: '#922b21',
  },
  // Score 9.0 ─────────────────────────────
  {
    score: 9,
    text: 'El hotel está ubicado en una calle peatonal muy bonita. Mi cuarto era confortable y bien equipado. El dueño es muy amable y de buen consejo.',
    name: 'Bernard',
    origin: 'Francia · En familia',
    date: 'Mar 2026',
    initials: 'B',
    color: '#1f618d',
  },
  {
    score: 9,
    text: 'Ubicación céntrica, muy confortable y tranquilo, hotel seguro y el señor caballero muy amable.',
    name: 'Bryan',
    origin: 'Perú · En pareja',
    date: 'Ago 2025',
    initials: 'B',
    color: '#117a65',
  },
  {
    score: 9,
    text: 'The breakfast was great, quiet location, only foot traffic outside, close to the Plaza de Armas.',
    name: 'Geoffrey',
    origin: 'Australia · En pareja',
    date: 'Dic 2023',
    initials: 'G',
    color: '#784212',
  },
  {
    score: 9,
    text: 'The apartment was clean, spacious, and very comfortable. The staff was exceptionally kind and helpful.',
    name: 'Riccardo',
    origin: 'EEUU · En pareja',
    date: 'Ago 2023',
    initials: 'R',
    color: '#6c3483',
  },
  // Score 8.0 ─────────────────────────────
  {
    score: 8,
    text: 'Cerca al centro, personal muy amable, habitación amplia y limpia, desayuno delicioso, precio adecuado.',
    name: 'Silvana',
    origin: 'Perú · En familia',
    date: 'Jul 2023',
    initials: 'S',
    color: '#1a5276',
  },
  {
    score: 8,
    text: 'Eduardo was an excellent host. He allowed us to stay in the room before the check-in hour. Very kind and helpful.',
    name: 'Maria',
    origin: 'EEUU · En familia',
    date: 'Sep 2024',
    initials: 'M',
    color: '#b7950b',
  },
]

const firstColumn  = testimonials.slice(0, 5)
const secondColumn = testimonials.slice(5, 10)
const thirdColumn  = testimonials.slice(10)

function ScoreBadge({ score }: { score: number }) {
  const gold = score === 10
  return (
    <span
      className="text-xs font-bold px-2 py-0.5 rounded-md"
      style={{
        background: gold ? 'rgba(201,168,76,0.18)' : 'rgba(255,255,255,0.07)',
        color: gold ? '#c9a84c' : 'rgba(255,255,255,0.55)',
        border: gold ? '1px solid rgba(201,168,76,0.28)' : '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {score}.0
    </span>
  )
}

function TestimonialsColumn({
  testimonials: items,
  duration = 15,
  className,
}: {
  testimonials: typeof testimonials
  duration?: number
  className?: string
}) {
  return (
    <div className={`overflow-hidden ${className ?? ''}`}>
      <motion.div
        animate={{ translateY: '-50%' }}
        transition={{ duration, repeat: Infinity, ease: 'linear', repeatType: 'loop' }}
        className="flex flex-col gap-4"
      >
        {[...Array(2)].fill(null).map((_, pass) => (
          <React.Fragment key={pass}>
            {items.map(({ score, text, name, origin, date, initials, color }, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl max-w-[300px] w-full"
                style={{
                  background: '#161616',
                  border: '1px solid rgba(255,255,255,0.07)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                }}
              >
                {/* Score + stars */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={11} className="text-[#c9a84c] fill-[#c9a84c]" />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/25 leading-none">Booking.com</span>
                    <ScoreBadge score={score} />
                  </div>
                </div>

                {/* Quote */}
                <p className="text-white/65 text-sm leading-relaxed mb-4">
                  &ldquo;{text}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-3.5" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                    style={{ background: color }}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm leading-5 truncate">{name}</p>
                    <p className="text-white/35 text-xs leading-5 truncate">{origin} · {date}</p>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  )
}

export default function SeccionReseñas() {
  return (
    <section className="relative overflow-hidden py-20" style={{ background: '#0e0e0e' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-16">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-12">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="font-display font-bold text-white leading-[1.1] max-w-2xl"
              style={{ fontSize: 'clamp(1.9rem, 4.5vw, 3.5rem)' }}
            >
              Palabras de los huéspedes que lo han vivido.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="text-white/40 text-sm mt-4 max-w-lg leading-relaxed"
            >
              Reseñas reales de huéspedes verificados en Booking.com. Sus palabras reflejan la calidez, la ubicación y los momentos que hacen especial cada estadía en Hatuchay Inka.
            </motion.p>
          </div>

          <motion.a
            href="https://www.booking.com/hotel/pe/hatuchay-inka-apart.es.html"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex-shrink-0 self-start flex items-center gap-2 text-sm font-semibold transition-colors"
            style={{ color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.12)', padding: '10px 20px', borderRadius: 9999 }}
            onMouseEnter={e => {
              const el = e.currentTarget
              el.style.color = '#c9a84c'
              el.style.borderColor = 'rgba(201,168,76,0.4)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.color = 'rgba(255,255,255,0.6)'
              el.style.borderColor = 'rgba(255,255,255,0.12)'
            }}
          >
            Ver en Booking.com →
          </motion.a>
        </div>

        {/* Decorative divider */}
        <div className="flex items-center gap-3 mb-12">
          <div className="w-3 h-3 rotate-45 flex-shrink-0" style={{ background: 'rgba(201,168,76,0.35)' }} />
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(201,168,76,0.3), rgba(201,168,76,0.08), transparent)' }} />
          <div className="w-3 h-3 rotate-45 flex-shrink-0" style={{ background: 'rgba(201,168,76,0.35)' }} />
        </div>
      </div>

      {/* Infinite scroll columns */}
      <div
        className="flex justify-center gap-5 px-6 lg:px-16"
        style={{
          maxHeight: 680,
          overflow: 'hidden',
          maskImage: 'linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)',
        }}
      >
        <TestimonialsColumn testimonials={firstColumn}  duration={20} />
        <TestimonialsColumn testimonials={secondColumn} duration={26} className="hidden md:block" />
        <TestimonialsColumn testimonials={thirdColumn}  duration={22} className="hidden lg:block" />
      </div>
    </section>
  )
}
