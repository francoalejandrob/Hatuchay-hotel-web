'use client'

import { MessageCircle } from 'lucide-react'
import { HOTEL } from '@/lib/constants'
import { useLanguage } from '@/lib/LanguageContext'

export default function WhatsAppButton() {
  const { t } = useLanguage()
  const numero = HOTEL.whatsapp.replace(/\s/g, '').replace('+', '')
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(t.cta.waMessage)}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 animate-pulse-gold"
      aria-label="WhatsApp"
      title="WhatsApp"
    >
      <MessageCircle size={28} fill="white" />
    </a>
  )
}
