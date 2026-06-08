import { Wifi, Coffee, Car, UtensilsCrossed, Phone, MapPin, Thermometer, Clock, Shield, Shirt, Dices, Flame } from 'lucide-react'

const amenidades = [
  { icon: Wifi,            label: 'WiFi Gratuito',       desc: 'Alta velocidad en toda la propiedad' },
  { icon: Coffee,          label: 'Desayuno Incluido',   desc: 'Especialidad de la casa, variado cada día' },
  { icon: UtensilsCrossed, label: 'Cocina Equipada',     desc: 'En cada apartamento' },
  { icon: Flame,           label: 'Hervidor e Infusiones', desc: 'En todas las habitaciones' },
  { icon: Phone,           label: 'Recepción 24/7',      desc: 'Atención personalizada' },
  { icon: MapPin,          label: 'Ubicación Central',   desc: '2 cuadras de la Plaza de Armas' },
  { icon: Thermometer,     label: 'Agua Caliente 24h',   desc: 'Ducha permanente' },
  { icon: Clock,           label: 'Check-in Flexible',   desc: 'Coordinamos tu llegada' },
  { icon: Car,             label: 'Parqueo',             desc: 'Estacionamiento con costo adicional' },
  { icon: Shield,          label: 'Seguridad',           desc: 'Cámaras y acceso controlado' },
  { icon: Shirt,           label: 'Lavandería',          desc: 'Servicio disponible bajo solicitud' },
  { icon: Dices,           label: 'Juegos de Mesa',      desc: 'Para disfrutar en familia' },
]

export default function SeccionAmenidades() {
  return (
    <section className="section-padding bg-warm" data-navbar-theme="light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-secondary font-semibold text-sm tracking-widest uppercase mb-2">Comodidades</p>
          <h2 className="font-display text-primary text-4xl lg:text-5xl font-bold">
            Todo lo que necesitas
          </h2>
          <div className="divider-gold mx-auto" />
          <p className="text-ink/60 mt-3 max-w-xl mx-auto">
            Cada detalle pensado para que tu estadía en Cajamarca sea perfecta desde el primer momento.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-5">
          {amenidades.map(({ icon: Icon, label, desc }) => (
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
