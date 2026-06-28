import type { Metadata } from 'next'
import { Playfair_Display_SC, Karla } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import PublicShell from '@/components/layout/PublicShell'
import { Analytics } from '@vercel/analytics/next'
import { HOTEL } from '@/lib/constants'

function resolveSiteUrl(): string {
  const candidate = process.env.NEXT_PUBLIC_SITE_URL
  if (candidate) {
    try {
      return new URL(candidate).toString().replace(/\/$/, '')
    } catch {
      // falls through to default below
    }
  }
  return 'https://hatuchay-inka.vercel.app'
}

const SITE_URL = resolveSiteUrl()

const hotelJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Hotel',
  name: HOTEL.nombre,
  description:
    'Apart hotel en el corazón histórico de Cajamarca, Perú. Habitaciones y apartamentos equipados a 2 cuadras de la Plaza de Armas.',
  url: SITE_URL,
  telephone: HOTEL.telefono,
  email: HOTEL.email,
  priceRange: 'S/ 220 - S/ 580',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Jr. Dos de Mayo 221',
    addressLocality: 'Cajamarca',
    addressRegion: 'Cajamarca',
    addressCountry: 'PE',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: -7.1638,
    longitude: -78.5021,
  },
  image: `${SITE_URL}/logo.jpeg`,
  sameAs: [HOTEL.instagram, HOTEL.facebook, HOTEL.tripadvisor].filter(Boolean),
}

const playfair = Playfair_Display_SC({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-playfair',
  display: 'swap',
})

const karla = Karla({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
    <html lang="es" className={`${playfair.variable} ${karla.variable}`}>
      <body className="font-body bg-warm text-ink antialiased">

        {/* Structured data — Hotel schema.org */}
        <Script
          id="hotel-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(hotelJsonLd) }}
        />

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
