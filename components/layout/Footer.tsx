import Link from 'next/link'
import { MapPin, Phone, Mail, ExternalLink } from 'lucide-react'
import { HOTEL } from '@/lib/constants'

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h3 className="font-display text-secondary text-2xl font-bold mb-2">Hatuchay Inka</h3>
            <p className="text-white/50 text-xs tracking-widest uppercase mb-4">Apart Hotel · Cajamarca, Perú</p>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              Hospédate en el corazón histórico de Cajamarca. A 2 cuadras de la Plaza de Armas con toda la comodidad de un apartamento.
            </p>
            <div className="flex gap-3">
              <a href={HOTEL.instagram} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-secondary flex items-center justify-center transition-colors text-xs font-bold">
                IG
              </a>
              <a href={HOTEL.facebook} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-secondary flex items-center justify-center transition-colors text-xs font-bold">
                FB
              </a>
              <a href={HOTEL.tripadvisor} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-secondary flex items-center justify-center transition-colors">
                <ExternalLink size={16} />
              </a>
            </div>
          </div>

          {/* Nav */}
          <div>
            <h4 className="text-secondary font-semibold text-sm tracking-widest uppercase mb-5">Navegación</h4>
            <ul className="space-y-3">
              {[
                { href: '/', label: 'Inicio' },
                { href: '/habitaciones', label: 'Habitaciones' },
                { href: '/reservas', label: 'Reservar' },
                { href: '/nosotros', label: 'Nosotros' },
                { href: '/contacto', label: 'Contacto' },
              ].map((link) => (
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
            <h4 className="text-secondary font-semibold text-sm tracking-widest uppercase mb-5">Servicios</h4>
            <ul className="space-y-3 text-white/70 text-sm">
              {[
                'Desayuno incluido',
                'WiFi de alta velocidad',
                'Cocina equipada',
                'Parking gratuito',
                'Transfer aeropuerto',
                'Recepción 24/7',
                'Aguas termales cercanas',
                'Tours a Cajamarca',
              ].map((s) => (
                <li key={s} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-secondary font-semibold text-sm tracking-widest uppercase mb-5">Contacto</h4>
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
                  <MapPin size={14} /> Ver en Google Maps
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} Hatuchay Inka Apart Hotel. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-white/40 text-sm">
            <Link href="/admin" className="hover:text-white/70 transition-colors">Panel Admin</Link>
            <span>RUC: {HOTEL.ruc}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
