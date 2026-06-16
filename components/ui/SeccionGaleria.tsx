'use client'

import React from 'react'
import Image from 'next/image'

interface GaleriaItem {
  url: string
  alt: string
  categoria: string
}

// 8 por fila es suficiente — la duplicación crea el efecto infinito
const row1: GaleriaItem[] = [
  { url: '/images/habitaciones/102-1.jpg',  alt: 'Suite 102',          categoria: 'Suite 102' },
  { url: '/images/hotel/fachada-1.jpg',     alt: 'Fachada del hotel',  categoria: 'Fachada'   },
  { url: '/images/habitaciones/105-1.jpg',  alt: 'Suite 105',          categoria: 'Suite 105' },
  { url: '/images/hotel/terraza-1.jpg',     alt: 'Terraza',            categoria: 'Terraza'   },
  { url: '/images/habitaciones/106-2.jpg',  alt: 'Apartamento 106',    categoria: 'Apto. 106' },
  { url: '/images/hotel/terraza-2.jpg',     alt: 'Terraza patio',      categoria: 'Terraza'   },
  { url: '/images/habitaciones/107-3.jpg',  alt: 'Suite Presidencial', categoria: 'Suite 107' },
  { url: '/images/hotel/fachada-2.jpg',     alt: 'Hotel exterior',     categoria: 'Fachada'   },
]

const row2: GaleriaItem[] = [
  { url: '/images/hotel/entrada-2.jpg',     alt: 'Recepción',          categoria: 'Lobby'     },
  { url: '/images/habitaciones/107-2.jpg',  alt: 'Suite 107 sala',     categoria: 'Suite 107' },
  { url: '/images/hotel/balcon-1.jpg',      alt: 'Vista balcón',       categoria: 'Balcón'    },
  { url: '/images/habitaciones/105-3.jpg',  alt: 'Suite 105 detalle',  categoria: 'Suite 105' },
  { url: '/images/habitaciones/106-1.jpg',  alt: 'Apto. 106 sala',     categoria: 'Apto. 106' },
  { url: '/images/hotel/terraza-3.jpg',     alt: 'Terraza arte',       categoria: 'Terraza'   },
  { url: '/images/habitaciones/102-2.jpg',  alt: 'Suite 102 detalle',  categoria: 'Suite 102' },
  { url: '/images/hotel/fachada-3.jpg',     alt: 'Fachada colonial',   categoria: 'Fachada'   },
]

const colorMap: Record<string, string> = {
  'Suite 102': '#4a9aba',
  'Suite 105': '#7a9e6e',
  'Apto. 106': '#c9a84c',
  'Suite 107': '#c4753a',
  'Fachada':   '#034724',
  'Terraza':   '#7b5ea7',
  'Lobby':     '#a07850',
  'Balcón':    '#2e7dba',
}

function GaleriaStrip({ items, direction }: { items: GaleriaItem[], direction: 'left' | 'right' }) {
  const doubled = [...items, ...items]
  const cls = direction === 'left' ? 'galeria-ltr' : 'galeria-rtl'

  return (
    <div className="relative w-full overflow-hidden galeria-mask">
      <div className={`${cls} flex gap-3 w-max`} style={{ willChange: 'transform' }}>
        {doubled.map((img, i) => {
          const color = colorMap[img.categoria] ?? '#034724'
          return (
            <div
              key={i}
              className="group relative flex-shrink-0 rounded-2xl overflow-hidden shadow-xl cursor-pointer"
              style={{ width: 260, height: 260 }}
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                sizes="260px"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4"
                style={{ background: `linear-gradient(to top, ${color}e0 0%, ${color}40 60%, transparent 100%)` }}
              >
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.18em] px-2 py-0.5 rounded-full w-fit mb-1"
                  style={{ background: `${color}30`, color: '#fff', border: `1px solid ${color}70` }}
                >
                  {img.categoria}
                </span>
                <p className="text-white text-sm font-semibold leading-tight">{img.alt}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function SeccionGaleria() {
  return (
    <>
      <style>{`
        @keyframes ltr { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        @keyframes rtl { from { transform: translateX(-50%) } to { transform: translateX(0) } }
        .galeria-ltr { animation: ltr 38s linear infinite; }
        .galeria-rtl { animation: rtl 46s linear infinite; }
        .galeria-ltr:hover, .galeria-rtl:hover { animation-play-state: paused; }
        .galeria-mask {
          mask: linear-gradient(90deg, transparent 0%, black 7%, black 93%, transparent 100%);
          -webkit-mask: linear-gradient(90deg, transparent 0%, black 7%, black 93%, transparent 100%);
        }
      `}</style>

      <section
        className="w-full relative overflow-hidden py-16 md:py-24"
        style={{ background: 'linear-gradient(180deg,#0a0a0a 0%,#111 50%,#0a0a0a 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 50%,#c9a84c0c 0%,transparent 70%)' }} />

        {/* Header */}
        <div className="relative z-10 text-center mb-12 px-4">
          <p className="text-secondary font-semibold text-xs tracking-[0.25em] uppercase mb-3">Conoce el hotel</p>
          <h2
            className="font-display font-extrabold text-white"
            style={{ fontSize: 'clamp(2.4rem,7vw,5rem)', lineHeight: 1.05, letterSpacing: '-0.02em' }}
          >
            Galería
          </h2>
          <div className="w-12 h-[2px] bg-secondary mx-auto mt-4 mb-5" />
          <p className="text-white/40 max-w-md mx-auto text-sm md:text-base leading-relaxed">
            Habitaciones, terraza, áreas comunes y la fachada colonial del Hatuchay Inka.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {Object.entries(colorMap).map(([cat, color]) => (
              <span key={cat} className="text-[11px] font-semibold px-3 py-1 rounded-full border"
                style={{ color, borderColor: `${color}50`, background: `${color}10` }}>
                {cat}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <GaleriaStrip items={row1} direction="left" />
          <GaleriaStrip items={row2} direction="right" />
        </div>
      </section>
    </>
  )
}
