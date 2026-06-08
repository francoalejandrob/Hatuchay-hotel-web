import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import PublicShell from '@/components/layout/PublicShell'
import { Analytics } from '@vercel/analytics/next'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Hatuchay Inka Apart Hotel — Cajamarca, Perú',
    template: '%s | Hatuchay Inka Apart Hotel',
  },
  description:
    'Hospédate en el corazón histórico de Cajamarca. Apartamentos de lujo a 2 cuadras de la Plaza de Armas, con cocina equipada, WiFi y desayuno incluido. Reserva directo y obtén el mejor precio.',
  keywords: ['hotel cajamarca', 'apart hotel cajamarca', 'hatuchay inka', 'alojamiento cajamarca', 'suite cajamarca', 'hotel peru cajamarca'],
  openGraph: {
    title: 'Hatuchay Inka Apart Hotel — Cajamarca, Perú',
    description: 'Apartamentos de lujo en el centro histórico de Cajamarca',
    locale: 'es_PE',
    type: 'website',
  },
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-body bg-warm text-ink antialiased">

        {/* Google Analytics 4 */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { page_path: window.location.pathname });
              `}
            </Script>
          </>
        )}

        <PublicShell>{children}</PublicShell>

        {/* Vercel Analytics */}
        <Analytics />
      </body>
    </html>
  )
}
