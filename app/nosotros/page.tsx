import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Users, Award, Heart, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nosotros',
  description: 'Conoce la historia de Hatuchay Inka Apart Hotel en el corazón histórico de Cajamarca, Perú.',
}

const valores = [
  { icon: Heart, titulo: 'Hospitalidad', desc: 'Tratamos a cada huésped como familia, con calidez y atención personalizada.' },
  { icon: Award, titulo: 'Calidad', desc: 'Cada detalle está cuidado para garantizar una estadía de lujo en Cajamarca.' },
  { icon: MapPin, titulo: 'Autenticidad', desc: 'Conexión genuina con la cultura, historia e identidad cajamarquina.' },
  { icon: Users, titulo: 'Comunidad', desc: 'Promovemos el turismo local y apoyamos a los emprendedores de Cajamarca.' },
]

export default function NosotrosPage() {
  return (
    <div className="min-h-screen bg-warm">
      {/* Hero */}
      <div className="bg-primary text-white pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-secondary font-semibold text-sm tracking-widest uppercase mb-3">Nuestra Historia</p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">Hatuchay Inka</h1>
          <div className="w-16 h-0.5 bg-secondary mx-auto mb-4" />
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Nacimos del amor por Cajamarca y del deseo de compartir su extraordinaria riqueza histórica y cultural con viajeros del mundo entero.
          </p>
        </div>
      </div>

      {/* Story */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="img-zoom rounded-2xl overflow-hidden h-80 lg:h-96 shadow-card">
            <Image
              src="/images/hotel/exteriores.jpeg"
              alt="Hatuchay Inka Apart Hotel"
              width={600}
              height={400}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-secondary font-semibold text-sm tracking-widest uppercase mb-3">Quiénes Somos</p>
            <h2 className="font-display text-primary text-4xl font-bold mb-4">Un hotel con alma cajamarquina</h2>
            <div className="divider-gold" />
            <p className="text-ink/70 mt-4 mb-5 leading-relaxed">
              Hatuchay Inka Apart Hotel se encuentra ubicado en el corazón histórico de Cajamarca, a tan solo 2 cuadras de la Plaza de Armas. Nuestro nombre proviene del quechua: <em className="text-primary font-medium">Hatuchay</em> significa crecer o levantarse, e <em className="text-primary font-medium">Inka</em> es el homenaje a la grandeza del Imperio que floreció en estas tierras.
            </p>
            <p className="text-ink/70 leading-relaxed mb-6">
              Ofrecemos la comodidad de un apartamento con cocina propia, sala independiente y espacios amplios, combinada con el servicio personalizado de un hotel boutique. Cada habitación ha sido diseñada con cuidado para que nuestros huéspedes se sientan en casa mientras descubren la magia de Cajamarca.
            </p>
            <div className="flex flex-wrap gap-4">
              {[
                { num: '10+', label: 'Años de experiencia' },
                { num: '5.0', label: 'Calificación TripAdvisor' },
                { num: '1,000+', label: 'Huéspedes satisfechos' },
              ].map(({ num, label }) => (
                <div key={label} className="text-center">
                  <p className="font-display text-secondary text-3xl font-bold">{num}</p>
                  <p className="text-ink/50 text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Valores */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <p className="text-secondary font-semibold text-sm tracking-widest uppercase mb-2">Filosofía</p>
            <h2 className="font-display text-primary text-4xl font-bold">Nuestros valores</h2>
            <div className="divider-gold mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {valores.map(({ icon: Icon, titulo, desc }) => (
              <div key={titulo} className="text-center p-6 bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon size={24} className="text-secondary" />
                </div>
                <h3 className="font-display text-primary text-xl font-bold mb-2">{titulo}</h3>
                <p className="text-ink/60 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-primary text-white rounded-3xl p-10 text-center">
          <h2 className="font-display text-4xl font-bold mb-3">¿Listo para visitarnos?</h2>
          <p className="text-white/60 mb-6 max-w-lg mx-auto">
            Reserva ahora y vive la experiencia Hatuchay Inka. Te esperamos en Cajamarca.
          </p>
          <Link href="/reservas" className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary-dark text-white font-bold px-8 py-4 rounded-full transition-all">
            Reservar ahora <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  )
}
