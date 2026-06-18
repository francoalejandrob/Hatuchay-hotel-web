'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { CalendarDays, Users, Search, ChevronRight } from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'

const heroImageSrcs = [
  '/images/hero/cajamarca1.jpeg',
  '/images/hero/cajamarca2.png',
  '/images/hero/cajamarca3.png',
  '/images/hero/cajamarca4.png',
]

const heroImagePositions = ['center', 'center', 'center', 'center']

export default function Hero() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [checkin, setCheckin] = useState('')
  const [checkout, setCheckout] = useState('')
  const [huespedes, setHuespedes] = useState(2)
  const router = useRouter()
  const intervalRef = useRef<NodeJS.Timeout>()
  const { t } = useLanguage()

  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

  const heroImages = heroImageSrcs.map((src, i) => ({
    src,
    title: t.hero.slides[i].title,
    subtitle: t.hero.slides[i].subtitle,
  }))

  useEffect(() => {
    const t = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    setCheckin(t)
    const d = new Date(Date.now() + 2 * 86400000)
    setCheckout(d.toISOString().split('T')[0])
  }, [])

  const goToSlide = (idx: number) => {
    if (idx === activeIndex || isTransitioning) return
    setIsTransitioning(true)
    setActiveIndex(idx)
    setTimeout(() => setIsTransitioning(false), 700)

    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => autoAdvance(), 10000)
  }

  const autoAdvance = () => {
    setActiveIndex((i) => {
      const next = (i + 1) % heroImages.length
      setIsTransitioning(true)
      setTimeout(() => setIsTransitioning(false), 700)
      return next
    })
  }

  useEffect(() => {
    intervalRef.current = setInterval(autoAdvance, 10000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleBuscar = () => {
    const params = new URLSearchParams({
      checkin: checkin || tomorrow,
      checkout: checkout || new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      huespedes: String(huespedes),
    })
    router.push(`/habitaciones?${params.toString()}`)
  }

  return (
    <section className="relative w-full min-h-screen overflow-hidden flex flex-col">
      {/* Background images */}
      {heroImages.map((img, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <Image
            src={img.src}
            alt={img.title}
            fill
            priority={i === 0}
            quality={92}
            className="object-cover"
            style={{ objectPosition: heroImagePositions[i] }}
            sizes="100vw"
          />
        </div>
      ))}

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-20 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />
      <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      {/* Content */}
      <div className="relative z-30 flex-1 flex flex-col justify-between min-h-screen">
        {/* Main text */}
        <div className="flex-1 flex items-start lg:items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20 sm:pt-24">
            <div className="max-w-[78%] sm:max-w-2xl">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="w-8 h-[2px] bg-secondary" />
                <span className="text-secondary text-xs font-semibold tracking-[0.2em] uppercase">
                  {t.hero.ubicacion}
                </span>
              </div>
              <h1
                key={`title-${activeIndex}`}
                className="font-display text-white text-3xl sm:text-5xl lg:text-7xl font-bold leading-tight text-hero animate-slide-up"
              >
                {heroImages[activeIndex].title}
              </h1>
              <p
                key={`sub-${activeIndex}`}
                className="text-white/85 text-base sm:text-lg lg:text-xl mt-3 mb-5 sm:mt-4 sm:mb-8 animate-fade-in"
              >
                {heroImages[activeIndex].subtitle}
              </p>
              <div className="flex flex-col items-start md:flex-row md:items-center gap-3 md:gap-4 mb-5 sm:mb-8">
                <a href="#buscar" className="hidden md:flex btn-secondary items-center justify-center gap-2 rounded-full px-5 sm:px-6">
                  {t.hero.verDisponibilidad} <ChevronRight size={18} />
                </a>
                <a href="/habitaciones" className="border-2 border-white/60 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold hover:border-secondary hover:text-secondary transition-all flex items-center justify-center">
                  {t.hero.nuestrasSuites}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right: simple vertical slide indicator — desktop only */}
        <div className="absolute right-6 lg:right-10 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-3">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              aria-label={`Ir al slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? 'h-7 w-2 bg-secondary'
                  : 'h-2 w-2 bg-white/35 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        {/* Mobile indicators */}
        <div className="lg:hidden absolute bottom-28 left-1/2 -translate-x-1/2 flex gap-2 z-40">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`rounded-full transition-all duration-300 ${
                i === activeIndex ? 'w-6 h-2 bg-secondary' : 'w-2 h-2 bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Search bar */}
        <div id="buscar" className="relative z-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-8 sm:pb-10 lg:pb-16">
          <div className="liquid-glass rounded-2xl p-3.5 sm:p-4 lg:p-5">
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:flex lg:flex-row lg:gap-4 lg:items-end">
              {/* Check-in */}
              <div className="min-w-0 lg:flex-1">
                <label className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-white/70 uppercase tracking-wide mb-1 sm:mb-1.5">
                  <CalendarDays size={13} /> {t.hero.checkin}
                </label>
                <input
                  type="date"
                  value={checkin}
                  min={today}
                  onChange={(e) => setCheckin(e.target.value)}
                  className="block w-full min-w-0 appearance-none px-3 sm:px-4 py-2.5 sm:py-3 border border-white/20 rounded-xl bg-white/15 text-white placeholder-white/50 font-medium focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-xs sm:text-sm backdrop-blur-sm"
                />
              </div>

              {/* Check-out */}
              <div className="min-w-0 lg:flex-1">
                <label className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-white/70 uppercase tracking-wide mb-1 sm:mb-1.5">
                  <CalendarDays size={13} /> {t.hero.checkout}
                </label>
                <input
                  type="date"
                  value={checkout}
                  min={checkin || today}
                  onChange={(e) => setCheckout(e.target.value)}
                  className="block w-full min-w-0 appearance-none px-3 sm:px-4 py-2.5 sm:py-3 border border-white/20 rounded-xl bg-white/15 text-white placeholder-white/50 font-medium focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-xs sm:text-sm backdrop-blur-sm"
                />
              </div>

              {/* Guests */}
              <div className="min-w-0 lg:flex-1">
                <label className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-white/70 uppercase tracking-wide mb-1 sm:mb-1.5">
                  <Users size={13} /> {t.hero.huespedes}
                </label>
                <select
                  value={huespedes}
                  onChange={(e) => setHuespedes(Number(e.target.value))}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-white/20 rounded-xl bg-white/15 text-white font-medium focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-xs sm:text-sm backdrop-blur-sm [&>option]:bg-primary [&>option]:text-white"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? t.hero.persona : t.hero.personas}
                    </option>
                  ))}
                </select>
              </div>

              {/* Button */}
              <button
                onClick={handleBuscar}
                className="self-end min-w-0 lg:w-auto bg-secondary hover:bg-secondary-dark text-white font-bold px-3 sm:px-8 py-2.5 sm:py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-gold active:scale-[0.98] text-xs sm:text-sm"
              >
                <Search size={16} />
                <span>{t.hero.buscar}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
