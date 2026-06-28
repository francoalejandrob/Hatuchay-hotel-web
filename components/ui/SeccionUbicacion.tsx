import { MapPin, Clock, Phone, Navigation } from 'lucide-react'
import { HOTEL } from '@/lib/constants'

export default function SeccionUbicacion() {
  return (
    <section className="section-padding bg-white overflow-hidden" data-navbar-theme="light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Info */}
          <div>
            <p className="text-secondary font-semibold text-sm tracking-widest uppercase mb-2">Ubicación</p>
            <h2 className="font-display text-primary text-4xl lg:text-5xl font-bold mb-3">
              En el corazón de Cajamarca
            </h2>
            <div className="divider-gold" />
            <p className="text-gray-500 mt-4 mb-8 leading-relaxed">
              Estratégicamente ubicados en el centro histórico de Cajamarca, a solo 2 cuadras de la Plaza de Armas. Todos los atractivos turísticos principales están a pocos minutos a pie o en auto.
            </p>

            <div className="space-y-5">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} className="text-secondary" />
                </div>
                <div>
                  <p className="font-semibold text-primary text-sm">Dirección</p>
                  <p className="text-gray-500 text-sm">{HOTEL.direccion}</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Clock size={18} className="text-secondary" />
                </div>
                <div>
                  <p className="font-semibold text-primary text-sm">Horarios</p>
                  <p className="text-gray-500 text-sm">Check-in desde las {HOTEL.checkIn} · Check-out hasta las {HOTEL.checkOut}</p>
                  <p className="text-gray-500 text-sm">Recepción abierta 24 horas</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Phone size={18} className="text-secondary" />
                </div>
                <div>
                  <p className="font-semibold text-primary text-sm">Contacto</p>
                  <a href={`tel:${HOTEL.telefono}`} className="text-gray-500 text-sm hover:text-secondary transition-colors block">
                    {HOTEL.telefono}
                  </a>
                  <a href={`mailto:${HOTEL.email}`} className="text-gray-500 text-sm hover:text-secondary transition-colors block">
                    {HOTEL.email}
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={HOTEL.googleMaps}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex items-center gap-2 rounded-full"
              >
                <Navigation size={16} /> Cómo llegar
              </a>
              <a href="/reservas" className="btn-outline rounded-full">
                Reservar ahora
              </a>
            </div>
          </div>

          {/* Right: Google Maps */}
          <div className="rounded-2xl overflow-hidden shadow-card-hover h-96 lg:h-[500px]">
            <iframe
              src="https://maps.google.com/maps?q=Hatuchay+Inka+Apart+Hotel,+Jr.+Dos+de+Mayo+221,+Cajamarca,+Per%C3%BA&output=embed&z=17&hl=es"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación Hatuchay Inka Apart Hotel Cajamarca"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
