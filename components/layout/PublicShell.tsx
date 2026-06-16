'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import WhatsAppButton from '@/components/ui/WhatsAppButton'
import Tracker from '@/components/analytics/Tracker'
import { LanguageProvider } from '@/lib/LanguageContext'

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  return (
    <LanguageProvider>
      {!isAdmin && <Header />}
      {!isAdmin && <Tracker />}
      <main>{children}</main>
      {!isAdmin && <Footer />}
      {!isAdmin && <WhatsAppButton />}
    </LanguageProvider>
  )
}
