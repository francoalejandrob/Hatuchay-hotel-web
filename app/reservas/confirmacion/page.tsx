'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, MessageCircle, Home } from 'lucide-react'
import { HOTEL } from '@/lib/constants'

function ConfirmacionContent() {
  const searchParams = useSearchParams()
  const codigo = searchParams.get('codigo') || 'HTK-2024-XXXX'
  const estado = searchParams.get('estado') || 'confirmada'

  const esPendiente = estado === 'pago_pendiente_verificacion'

  return (
    <div className="min-h-screen bg-warm flex items-center justify-center px-4 pt-20 pb-10">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-3xl shadow-card-hover p-8 text-center">
          {/* Icon */}
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            esPendiente ? 'bg-orange-100' : 'bg-green-100'
          }`}>
            <CheckCircle size={40} className={esPendiente ? 'text-orange-500' : 'text-green-500'} />
          </div>

          {/* Title */}
          <h1 className="font-display text-primary text-3xl font-bold mb-2">
            {esPendiente ? '¡Solicitud Recibida!' : '¡Reserva Confirmada!'}
          </h1>
          <p className="text-ink/60 mb-6">
            {esPendiente
              ? 'Verificaremos tu pago en breve y recibirás una confirmación por WhatsApp y email.'
              : 'Tu reserva ha sido confirmada exitosamente. ¡Te esperamos en Cajamarca!'}
          </p>

          {/* Code */}
          <div className="bg-warm rounded-2xl p-5 mb-6">
            <p className="text-ink/50 text-xs mb-1">CÓDIGO DE RESERVA</p>
            <p className="font-display text-primary text-3xl font-bold tracking-widest">{codigo}</p>
            <p className="text-ink/40 text-xs mt-1">Guarda este código para tu llegada</p>
          </div>

          {/* Info */}
          <div className={`rounded-xl p-4 mb-6 text-sm text-left ${
            esPendiente ? 'bg-orange-50 border border-orange-100' : 'bg-green-50 border border-green-100'
          }`}>
            <p className={`font-semibold mb-1 ${esPendiente ? 'text-orange-700' : 'text-green-700'}`}>
              {esPendiente ? '⏳ Verificando tu pago' : '✅ Confirmación enviada'}
            </p>
            <p className={`text-xs ${esPendiente ? 'text-orange-600' : 'text-green-600'}`}>
              {esPendiente
                ? 'Nuestro equipo verificará tu comprobante. Recibirás una notificación en los próximos 30 minutos por WhatsApp y email.'
                : `Recibirás un WhatsApp al número registrado con todas las indicaciones de llegada 24 horas antes del check-in.`}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <a
              href={`https://wa.me/${HOTEL.whatsapp.replace(/\s/g, '').replace('+', '')}?text=Hola! Tengo una reserva con código ${codigo}. ¿Pueden confirmarme los detalles?`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3.5 rounded-xl transition-all"
            >
              <MessageCircle size={18} /> Contactar por WhatsApp
            </a>
            <Link href="/" className="w-full flex items-center justify-center gap-2 btn-outline rounded-xl py-3.5">
              <Home size={18} /> Volver al inicio
            </Link>
          </div>

          <p className="text-ink/30 text-xs mt-6">
            {HOTEL.telefono} · {HOTEL.email}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
      <ConfirmacionContent />
    </Suspense>
  )
}
