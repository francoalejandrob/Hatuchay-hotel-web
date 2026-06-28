'use client'

import Link from 'next/link'
import { MapPin, Phone, Mail, ExternalLink } from 'lucide-react'
import { HOTEL } from '@/lib/constants'
import { useLanguage } from '@/lib/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()
  const f = t.footer

  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h3 className="font-display text-secondary text-2xl font-bold mb-2">Hatuchay Inka</h3>
            <p className="text-white/50 text-xs tracking-widest uppercase mb-4">{f.tagline}</p>
            <p className="text-white/70 text-sm leading-relaxed mb-6">{f.description}</p>
            <div className="flex gap-3">
              <a href={HOTEL.instagram} target="_blank" rel="noopener noreferrer"
                aria-label="Hatuchay Inka en Instagram"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-secondary flex items-center justify-center transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href={HOTEL.facebook} target="_blank" rel="noopener noreferrer"
                aria-label="Hatuchay Inka en Facebook"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-secondary flex items-center justify-center transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href={HOTEL.tripadvisor} target="_blank" rel="noopener noreferrer"
                aria-label="Hatuchay Inka en TripAdvisor"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-secondary flex items-center justify-center transition-colors">
                <ExternalLink size={16} aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Nav */}
          <div>
            <h4 className="text-secondary font-semibold text-sm tracking-widest uppercase mb-5">{f.navTitle}</h4>
            <ul className="space-y-3">
              {f.navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/70 hover:text-secondary text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-secondary font-semibold text-sm tracking-widest uppercase mb-5">{f.serviciosTitle}</h4>
            <ul className="space-y-3 text-white/70 text-sm">
              {f.servicios.map((s) => (
                <li key={s} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-secondary font-semibold text-sm tracking-widest uppercase mb-5">{f.contactoTitle}</h4>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <MapPin size={16} className="text-secondary flex-shrink-0 mt-0.5" />
                <span className="text-white/70 text-sm">{HOTEL.direccion}</span>
              </li>
              <li>
                <a href={`tel:${HOTEL.telefono}`} className="flex gap-3 text-white/70 hover:text-secondary text-sm transition-colors">
                  <Phone size={16} className="text-secondary flex-shrink-0" />
                  {HOTEL.telefono}
                </a>
              </li>
              <li>
                <a href={`mailto:${HOTEL.email}`} className="flex gap-3 text-white/70 hover:text-secondary text-sm transition-colors">
                  <Mail size={16} className="text-secondary flex-shrink-0" />
                  {HOTEL.email}
                </a>
              </li>
              <li>
                <a href={HOTEL.googleMaps} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 bg-secondary hover:bg-secondary-dark text-white text-sm font-semibold px-4 py-2.5 rounded-full transition-all">
                  <MapPin size={14} /> {f.verMapa}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} Hatuchay Inka Apart Hotel. {f.derechos}
          </p>
          <div className="flex gap-6 text-white/40 text-sm">
            <Link href="/admin" className="hover:text-white/70 transition-colors">{f.admin}</Link>
            <span>RUC: {HOTEL.ruc}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
