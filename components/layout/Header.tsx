'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isLightSection, setIsLightSection] = useState(false)
  const pathname = usePathname()
  const { lang, toggleLang, t } = useLanguage()

  const navLinks = [
    { href: '/',            label: t.nav.inicio },
    { href: '/habitaciones',label: t.nav.habitaciones },
    { href: '/nosotros',    label: t.nav.nosotros },
    { href: '/contacto',    label: t.nav.contacto },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const anyVisible = entries.some(e => e.isIntersecting)
        setIsLightSection(anyVisible)
      },
      { rootMargin: '-56px 0px -80% 0px' }
    )
    document.querySelectorAll('[data-navbar-theme="light"]').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [pathname])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  const navStyle: React.CSSProperties = !scrolled
    ? {
        background: 'rgba(255,255,255,0.10)',
        backdropFilter: 'blur(16px) saturate(150%)',
        WebkitBackdropFilter: 'blur(16px) saturate(150%)',
        borderRadius: '999px',
        border: '1px solid rgba(255,255,255,0.22)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.15)',
      }
    : isLightSection
    ? {
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderRadius: '999px',
        border: '1px solid rgba(0,0,0,0.07)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
      }
    : {
        background: 'rgba(0,0,0,0.30)',
        backdropFilter: 'blur(20px) saturate(140%)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%)',
        borderRadius: '999px',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.08)',
      }

  const isLight = scrolled && isLightSection

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-3 sm:pt-4 px-3 sm:px-6 lg:px-8 pointer-events-none">
      <div
        className="max-w-5xl mx-auto pointer-events-auto transition-all duration-500"
        style={navStyle}
      >
        <div className="relative flex items-center justify-between h-12 sm:h-14 px-4 sm:px-5 lg:px-7">

          {/* Logo */}
          <Link href="/" className="relative z-10 flex items-center group flex-shrink-0">
            <div className="bg-white/95 rounded-lg px-2 py-1 transition-all duration-300 group-hover:scale-105 group-hover:bg-white">
              <Image
                src="/logo.jpeg"
                alt="Hatuchay Inka Apart Hotel"
                width={120}
                height={44}
                className="object-contain"
                style={{ height: '32px', width: 'auto' }}
                priority
              />
            </div>
          </Link>

          {/* Nav centrada — solo desktop */}
          <nav className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-6 xl:gap-8 z-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium tracking-wide transition-colors hover:text-secondary whitespace-nowrap ${
                  pathname === link.href
                    ? 'text-secondary'
                    : isLight ? 'text-primary/80' : 'text-white/90'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA + language toggle — desktop */}
          <div className="relative z-10 hidden lg:flex items-center gap-3">
            {/* Language toggle */}
            <button
              onClick={toggleLang}
              aria-label="Switch language"
              className={`flex items-center text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                isLight
                  ? 'border-primary/25 hover:border-primary/50'
                  : 'border-white/20 hover:border-white/45'
              }`}
            >
              <span className={lang === 'es' ? 'text-secondary' : isLight ? 'text-primary/60' : 'text-white/55'}>
                ES
              </span>
              <span className={`mx-1 ${isLight ? 'text-primary/40' : 'text-white/40'}`}>|</span>
              <span className={lang === 'en' ? 'text-secondary' : isLight ? 'text-primary/60' : 'text-white/55'}>
                EN
              </span>
            </button>

            <Link
              href="/reservas"
              className={`text-sm font-semibold px-5 py-2 rounded-full transition-all duration-200 whitespace-nowrap ${
                isLight
                  ? 'text-primary border border-primary/40 hover:bg-primary/10'
                  : 'text-white border border-white/60 hover:border-white hover:bg-white/10'
              }`}
            >
              {t.nav.reservar}
            </Link>
          </div>

          {/* CTA + hamburger — mobile y tablet (< lg) */}
          <div className="relative z-10 flex lg:hidden items-center gap-2">
            {/* Language toggle mobile */}
            <button
              onClick={toggleLang}
              aria-label="Switch language"
              className={`flex items-center text-[10px] font-bold px-2.5 py-1.5 rounded-full border transition-all cursor-pointer ${
                isLight
                  ? 'border-primary/25 hover:border-primary/50'
                  : 'border-white/20 hover:border-white/45'
              }`}
            >
              <span className={lang === 'es' ? 'text-secondary' : isLight ? 'text-primary/60' : 'text-white/55'}>ES</span>
              <span className={`mx-0.5 ${isLight ? 'text-primary/40' : 'text-white/40'}`}>|</span>
              <span className={lang === 'en' ? 'text-secondary' : isLight ? 'text-primary/60' : 'text-white/55'}>EN</span>
            </button>

            <Link
              href="/reservas"
              className={`text-xs font-semibold px-4 py-2.5 rounded-full transition-all whitespace-nowrap min-h-[44px] flex items-center ${
                isLight
                  ? 'text-primary border border-primary/40 hover:bg-primary/10'
                  : 'text-white border border-white/60 hover:bg-white/10'
              }`}
            >
              {t.nav.reservarMobile}
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`p-1.5 rounded-lg transition-colors ${isLight ? 'text-primary hover:bg-primary/10' : 'text-white hover:bg-white/10'}`}
              aria-label="Menú"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / tablet menu desplegable */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 pointer-events-auto ${
          menuOpen ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'
        }`}
      >
        <div
          className="px-5 py-4 space-y-1"
          style={{
            background: 'rgba(3, 71, 36, 0.75)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.30)',
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block py-3 px-4 rounded-xl text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'bg-white/15 text-secondary'
                  : 'text-white/90 hover:bg-white/10'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-white/10">
            <Link
              href="/reservas"
              onClick={() => setMenuOpen(false)}
              className="block text-center text-sm font-semibold text-white bg-secondary hover:bg-secondary-dark px-5 py-3 rounded-full transition-all w-full"
            >
              {t.nav.reservar}
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
