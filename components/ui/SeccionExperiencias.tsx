'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'

interface SlideData {
  title: string
  subtitle: string
  description: string
  accent: string
  imageUrl: string
  fallback: string
}

const slides: SlideData[] = [
  {
    title: 'Plaza de Armas',
    subtitle: 'Centro Histórico · 2 min del hotel',
    description:
      'Corazón de Cajamarca y Patrimonio Cultural de la Nación. Rodeada de la majestuosa Catedral y la Iglesia San Francisco del siglo XVII, fue el escenario del histórico encuentro entre el Inca Atahualpa y Francisco Pizarro en 1532.',
    accent: '#c9a84c',
    imageUrl: '/images/cajamarca/plaza-de-armas.jpg',
    fallback: '/images/hotel/exteriores.jpeg',
  },
  {
    title: 'Baños del Inca',
    subtitle: 'Termalismo · 10 min en auto',
    description:
      'Aguas termales que brotan a 70 °C con propiedades terapéuticas únicas. Usados por el Inca Atahualpa antes de su captura, hoy ofrecen tinas privadas y piscinas en un entorno andino incomparable.',
    accent: '#4a9aba',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Aguas_sulforicas_termales_-_Ba%C3%B1os_del_Inca.jpg/1280px-Aguas_sulforicas_termales_-_Ba%C3%B1os_del_Inca.jpg',
    fallback: '/images/hotel/entrada.jpeg',
  },
  {
    title: 'Ventanillas de Otuzco',
    subtitle: 'Arqueología · 20 min en auto',
    description:
      'Cementerio preinca con 338 nichos funerarios tallados en roca volcánica hace más de 2,000 años. Una de las necrópolis rupestres más antiguas del Perú, testimonio vivo de la cultura Cajamarca prehispánica.',
    accent: '#a07850',
    imageUrl: '/images/cajamarca/ventanillas-otuzco.jpg',
    fallback: '/images/hotel/exteriores.jpeg',
  },
  {
    title: 'Cumbemayo',
    subtitle: 'Ingeniería Andina · 30 min en auto',
    description:
      'El acueducto preincaico más antiguo de América del Sur, tallado en roca viva hace 3,500 años. A 3,500 msnm y rodeado de "frailes petrificados", es considerado maravilla de la ingeniería hidráulica andina.',
    accent: '#6a8a5a',
    imageUrl: '/images/cajamarca/cumbemayo.jpeg',
    fallback: '/images/hotel/entrada1.jpeg',
  },
  {
    title: 'Cuarto del Rescate',
    subtitle: 'Historia Inca · 5 min caminando',
    description:
      'Único vestigio inca en Cajamarca: el cuarto donde Atahualpa prometió llenarlo de oro y plata a cambio de su libertad en 1532. Un testimonio único del último capítulo del Imperio del Tawantinsuyu.',
    accent: '#c4753a',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/d/d6/Cuarto_del_Rescate_del_Inca_Atahualpa-_Ciudad_de_Cajamarca.jpg',
    fallback: '/images/hotel/exteriores.jpeg',
  },
  {
    title: 'Granja Porcón',
    subtitle: 'Naturaleza · 25 min en auto',
    description:
      'Comunidad campesina rodeada de 9,000 hectáreas de bosque de pinos. Hogar de llamas, alpacas y vicuñas, ofrece quesos artesanales, truchas y una experiencia auténtica de vida andina en el norte peruano.',
    accent: '#7a9e6e',
    imageUrl: '/images/cajamarca/granja-porcon.webp',
    fallback: '/images/hotel/entrada.jpeg',
  },
  {
    title: 'Complejo Belén',
    subtitle: 'Arte Colonial · 5 min caminando',
    description:
      'Joya del barroco americano ubicada en el corazón de Cajamarca. El complejo reúne la Iglesia de Belén, el antiguo Hospital de Mujeres y el Hospital de Hombres del siglo XVII. Su fachada tallada en piedra volcánica es una de las más elaboradas del virreinato peruano.',
    accent: '#c9a84c',
    imageUrl: '/images/cajamarca/complejo-belen.jpg',
    fallback: '/images/hotel/exteriores.jpeg',
  },
  {
    title: 'Colina Santa Apolonia',
    subtitle: 'Mirador · 10 min caminando',
    description:
      'Desde su cima a 2,920 msnm se contempla toda la ciudad en un panorama de 360°. Alberga la "Silla del Inca", tallada en roca viva, y jardines coloniales. El atardecer desde Santa Apolonia es uno de los más memorables del norte peruano.',
    accent: '#4e8c5a',
    imageUrl: '/images/cajamarca/santa-apolonia.jpeg',
    fallback: '/images/hotel/entrada1.jpeg',
  },
  {
    title: 'Santuario Virgen del Rosario',
    subtitle: 'Fe y Cultura · 20 min en auto',
    description:
      'Uno de los santuarios religiosos más venerados del norte peruano, ubicado en las afueras de Cajamarca. Cada año convoca a miles de peregrinos en una de las festividades más coloridas y emotivas de la región, combinando fe, música y tradición andina.',
    accent: '#7b5ea7',
    imageUrl: '/images/cajamarca/virgen-del-rosario.jpeg',
    fallback: '/images/hotel/exteriores.jpeg',
  },
  {
    title: 'Laguna Río Rejo',
    subtitle: 'Naturaleza · 1h en auto',
    description:
      'Laguna andina de altura rodeada de bofedales, pajonales y una biodiversidad única de los Andes del norte. Sus aguas cristalinas reflejan las cumbres cajamarquinas en un entorno prístino ideal para trekking y avistamiento de aves andinas.',
    accent: '#2e7dba',
    imageUrl: '/images/cajamarca/rio-rejo.jpeg',
    fallback: '/images/hotel/exteriores.jpeg',
  },
]

const SLIDE_DURATION = 6000
const TRANSITION_MS = 550

export default function SeccionExperiencias() {
  const [idx, setIdx] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const progRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const goTo = useCallback(
    (next: number) => {
      if (transitioning || next === idx) return
      setTransitioning(true)
      setProgress(0)
      setTimeout(() => {
        setIdx(next)
        setTimeout(() => setTransitioning(false), 50)
      }, TRANSITION_MS / 2)
    },
    [transitioning, idx]
  )

  const goNext = useCallback(() => goTo((idx + 1) % slides.length), [idx, goTo])
  const goPrev = useCallback(() => goTo((idx - 1 + slides.length) % slides.length), [idx, goTo])

  useEffect(() => {
    if (paused) return
    progRef.current = setInterval(
      () => setProgress(p => (p >= 100 ? 100 : p + 100 / (SLIDE_DURATION / 50))),
      50
    )
    timerRef.current = setInterval(goNext, SLIDE_DURATION)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (progRef.current) clearInterval(progRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, paused])

  const slide = slides[idx]
  const animCls = transitioning ? 'exp-out' : 'exp-in'

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: '#0e0e0e' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Ambient accent glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 70% 50%, ${slide.accent}1a 0%, transparent 68%)`,
          transition: 'background 0.8s ease',
        }}
      />

      {/* Main layout */}
      <div className="relative flex flex-col lg:flex-row" style={{ minHeight: 'clamp(480px, 60vw, 640px)' }}>

        {/* ── Left: text panel ── */}
        <div className="flex-[0_0_44%] flex items-center px-8 sm:px-12 lg:px-20 py-14 lg:py-0">
          <div className="max-w-sm lg:max-w-md">

            {/* Slide counter */}
            <div className={`exp-anim exp-delay-1 ${animCls} flex items-center gap-4 mb-7`}>
              <span className="block w-10 h-px" style={{ background: `${slide.accent}70` }} />
              <span className="text-white/70 text-[11px] tracking-[0.18em] font-medium">
                {String(idx + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
              </span>
            </div>

            {/* Title */}
            <h2
              className={`exp-anim exp-delay-2 ${animCls} font-display font-bold text-white leading-[1.08] mb-3`}
              style={{ fontSize: 'clamp(2rem, 3.8vw, 3.2rem)' }}
            >
              {slide.title}
            </h2>

            {/* Subtitle */}
            <p
              className={`exp-anim exp-delay-3 ${animCls} text-[11px] font-bold uppercase tracking-[0.18em] mb-6`}
              style={{ color: slide.accent }}
            >
              {slide.subtitle}
            </p>

            {/* Description */}
            <p className={`exp-anim exp-delay-4 ${animCls} text-white/90 text-sm leading-[1.75] mb-10`}>
              {slide.description}
            </p>

            {/* Nav arrows */}
            <div className="flex gap-3">
              {[
                { label: 'Anterior', onClick: goPrev, path: 'M19 12H5M12 19l-7-7 7-7' },
                { label: 'Siguiente', onClick: goNext, path: 'M5 12h14M12 5l7 7-7 7' },
              ].map(({ label, onClick, path }) => (
                <button
                  key={label}
                  onClick={onClick}
                  aria-label={label}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white transition-all duration-200"
                  style={{ border: '1px solid rgba(255,255,255,0.2)' }}
                  onMouseEnter={e => {
                    const el = e.currentTarget
                    el.style.borderColor = `${slide.accent}99`
                    el.style.background = `${slide.accent}18`
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget
                    el.style.borderColor = 'rgba(255,255,255,0.2)'
                    el.style.background = 'transparent'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d={path} />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: image panel ── */}
        <div className="flex-1 relative p-5 lg:p-8 min-h-[280px]">
          {/* Image frame */}
          <div className={`exp-img-frame ${animCls} relative w-full h-full rounded-2xl overflow-hidden`}
            style={{ minHeight: 280 }}>
            <Image
              key={slide.imageUrl}
              src={slide.imageUrl}
              alt={slide.title}
              fill
              quality={82}
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 56vw"
              onError={(e) => {
                const t = e.target as HTMLImageElement
                t.src = slide.fallback
              }}
            />
            {/* Colour overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: `linear-gradient(135deg, ${slide.accent}22 0%, transparent 55%)` }}
            />
          </div>

          {/* Decorative corners */}
          {[
            { style: { top: 12, left: 12, borderTop: `1.5px solid ${slide.accent}`, borderLeft: `1.5px solid ${slide.accent}` } },
            { style: { bottom: 12, right: 12, borderBottom: `1.5px solid ${slide.accent}`, borderRight: `1.5px solid ${slide.accent}` } },
          ].map((c, i) => (
            <div key={i} className="absolute w-7 h-7 pointer-events-none transition-colors duration-700" style={c.style} />
          ))}
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div
        className="flex border-t px-8 sm:px-12 lg:px-20"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}
      >
        {slides.map((s, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="flex-1 py-5 pr-4 text-left group"
          >
            <div className="h-[2px] rounded overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div
                className="h-full rounded"
                style={{
                  width: i === idx ? `${progress}%` : i < idx ? '100%' : '0%',
                  background: i <= idx ? (i === idx ? slide.accent : 'rgba(255,255,255,0.35)') : 'transparent',
                  transition: 'width 0.1s linear',
                }}
              />
            </div>
            <span
              className="hidden sm:block text-[11px] uppercase tracking-wider truncate transition-colors duration-300"
              style={{ color: i === idx ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.55)' }}
            >
              {s.title}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
