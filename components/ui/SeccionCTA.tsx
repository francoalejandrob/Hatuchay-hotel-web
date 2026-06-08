import Link from 'next/link'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { HOTEL } from '@/lib/constants'

export default function SeccionCTA() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Fondo: verde puro con profundidad radial */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 55% 50%, #035a2c 0%, #034724 50%, #022a17 100%)',
      }} />

      {/* Patrón dorado sutil */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c9a84c' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C%2Fg%3E%3C%2Fsvg%3E")`,
        }}
      />

      {/* Halo dorado central */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(201,168,76,0.07) 0%, transparent 65%)' }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-secondary font-semibold text-sm tracking-widest uppercase mb-4">
          Reserva Directa
        </p>

        <h2 className="font-display text-white text-4xl lg:text-5xl font-bold mb-5 leading-tight">
          ¿Listo para vivir<br />la experiencia Hatuchay Inka?
        </h2>

        <p className="text-white/55 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          Reserva directamente con nosotros y obtén el mejor precio garantizado. Sin comisiones adicionales.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/reservas"
            className="flex items-center justify-center gap-2 bg-secondary hover:bg-secondary-dark text-white font-bold px-8 py-4 rounded-full text-base transition-all hover:shadow-gold active:scale-95"
          >
            Reservar ahora <ArrowRight size={19} />
          </Link>

          <a
            href={`https://wa.me/${HOTEL.whatsapp.replace(/\s/g, '').replace('+', '')}?text=Hola! Me interesa reservar en Hatuchay Inka Apart Hotel.`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-glass flex items-center justify-center gap-2 px-8 py-4 text-base font-bold rounded-full"
          >
            <MessageCircle size={19} /> Consultar por WhatsApp
          </a>
        </div>

        <p className="text-white/25 text-sm mt-8">
          También puedes llamarnos al {HOTEL.telefono} · Recepción 24/7
        </p>
      </div>
    </section>
  )
}
