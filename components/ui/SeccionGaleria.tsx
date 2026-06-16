'use client'

import React from 'react'

interface GaleriaItem {
  url: string
  alt: string
  categoria: string
}

const row1: GaleriaItem[] = [
  { url: '/images/habitaciones/102-1.jpg',   alt: 'Suite 102 dormitorio',        categoria: 'Suite 102' },
  { url: '/images/habitaciones/105-1.jpg',   alt: 'Suite 105 dormitorio',        categoria: 'Suite 105' },
  { url: '/images/hotel/fachada-1.jpg',      alt: 'Fachada Hatuchay Inka',       categoria: 'Fachada' },
  { url: '/images/habitaciones/106-2.jpg',   alt: 'Apartamento 106',             categoria: 'Apto. 106' },
  { url: '/images/habitaciones/107-3.jpg',   alt: 'Suite Presidencial 107',      categoria: 'Suite 107' },
  { url: '/images/hotel/terraza-1.jpg',      alt: 'Terraza y arte',              categoria: 'Terraza' },
  { url: '/images/habitaciones/102-2.jpg',   alt: 'Suite 102 detalle',           categoria: 'Suite 102' },
  { url: '/images/habitaciones/105-2.jpg',   alt: 'Suite 105 sala',              categoria: 'Suite 105' },
  { url: '/images/hotel/terraza-2.jpg',      alt: 'Terraza patio interior',      categoria: 'Terraza' },
  { url: '/images/habitaciones/106-3.jpg',   alt: 'Apartamento 106 detalle',     categoria: 'Apto. 106' },
  { url: '/images/habitaciones/107-5.jpg',   alt: 'Suite 107 detalle',           categoria: 'Suite 107' },
  { url: '/images/hotel/fachada-2.jpg',      alt: 'Hotel exterior',              categoria: 'Fachada' },
]

const row2: GaleriaItem[] = [
  { url: '/images/hotel/entrada-2.jpg',      alt: 'Área de recepción',           categoria: 'Recepción' },
  { url: '/images/habitaciones/107-2.jpg',   alt: 'Suite 107 sala',              categoria: 'Suite 107' },
  { url: '/images/habitaciones/106-1.jpg',   alt: 'Apartamento 106 sala',        categoria: 'Apto. 106' },
  { url: '/images/hotel/terraza-3.jpg',      alt: 'Terraza galería de arte',     categoria: 'Terraza' },
  { url: '/images/habitaciones/105-3.jpg',   alt: 'Suite 105 baño',              categoria: 'Suite 105' },
  { url: '/images/hotel/balcon-1.jpg',       alt: 'Vista desde el balcón',       categoria: 'Balcón' },
  { url: '/images/habitaciones/102-3.jpg',   alt: 'Suite 102 baño',              categoria: 'Suite 102' },
  { url: '/images/habitaciones/107-7.jpg',   alt: 'Suite 107 cocina',            categoria: 'Suite 107' },
  { url: '/images/hotel/entrada-3.jpg',      alt: 'Lobby del hotel',             categoria: 'Lobby' },
  { url: '/images/habitaciones/106-5.jpg',   alt: 'Apartamento 106 cocina',      categoria: 'Apto. 106' },
  { url: '/images/hotel/fachada-3.jpg',      alt: 'Fachada colonial',            categoria: 'Fachada' },
  { url: '/images/habitaciones/107-9.jpg',   alt: 'Suite 107 dormitorio',        categoria: 'Suite 107' },
]

const colorMap: Record<string, string> = {
  'Suite 102':  '#4a9aba',
  'Suite 105':  '#7a9e6e',
  'Apto. 106':  '#c9a84c',
  'Suite 107':  '#c4753a',
  'Fachada':    '#034724',
  'Terraza':    '#7b5ea7',
  'Recepción':  '#a07850',
  'Lobby':      '#a07850',
  'Balcón':     '#2e7dba',
}

function GaleriaStrip({ items, direction }: { items: GaleriaItem[], direction: 'left' | 'right' }) {
  const doubled = [...items, ...items]
  const animClass = direction === 'left' ? 'galeria-left' : 'galeria-right'

  return (
    <div className="relative w-full overflow-hidden">
      <div className="galeria-mask-h">
        <div className={`${animClass} flex gap-3 w-max`}>
          {doubled.map((img, i) => {
            const color = colorMap[img.categoria] ?? '#034724'
            return (
              <div
                key={i}
                className="galeria-card group relative flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl cursor-pointer"
                style={{ width: 'clamp(200px, 20vw, 300px)', height: 'clamp(200px, 20vw, 300px)' }}
              >
                <img
                  src={img.url}
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                {/* Overlay on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4"
                  style={{ background: `linear-gradient(to top, ${color}e6 0%, ${color}44 60%, transparent 100%)` }}
                >
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded-full w-fit mb-1"
                    style={{ background: `${color}33`, color: '#fff', border: `1px solid ${color}88` }}
                  >
                    {img.categoria}
                  </span>
                  <p className="text-white text-sm font-semibold leading-tight drop-shadow">{img.alt}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function SeccionGaleria() {
  return (
    <>
      <style>{`
        @keyframes scroll-left {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scroll-right {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .galeria-left {
          animation: scroll-left 40s linear infinite;
        }
        .galeria-right {
          animation: scroll-right 48s linear infinite;
        }
        .galeria-left:hover,
        .galeria-right:hover {
          animation-play-state: paused;
        }
        .galeria-mask-h {
          mask: linear-gradient(90deg, transparent 0%, black 6%, black 94%, transparent 100%);
          -webkit-mask: linear-gradient(90deg, transparent 0%, black 6%, black 94%, transparent 100%);
        }
        .galeria-card {
          transition: box-shadow 0.35s ease;
        }
        .galeria-card:hover {
          box-shadow: 0 24px 60px rgba(0,0,0,0.7);
        }
      `}</style>

      <section className="w-full relative overflow-hidden py-16 md:py-24" style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #111 50%, #0a0a0a 100%)' }}>

        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 50%, #c9a84c0d 0%, transparent 70%)' }} />

        {/* Header */}
        <div className="relative z-10 text-center mb-12 px-4">
          <p className="text-secondary font-semibold text-xs tracking-[0.25em] uppercase mb-3">Conoce el hotel</p>
          <h2
            className="font-display font-extrabold text-white"
            style={{ fontSize: 'clamp(2.4rem, 7vw, 5rem)', lineHeight: 1.05, letterSpacing: '-0.02em' }}
          >
            Galería
          </h2>
          <div className="w-12 h-[2px] bg-secondary mx-auto mt-4 mb-5" />
          <p className="text-white/40 max-w-md mx-auto text-sm md:text-base leading-relaxed">
            Habitaciones, terraza, áreas comunes y la fachada colonial del Hatuchay Inka.
          </p>

          {/* Category chips */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {Object.entries(colorMap).filter(([k]) => !['Recepción', 'Lobby'].includes(k)).map(([cat, color]) => (
              <span
                key={cat}
                className="text-[11px] font-semibold px-3 py-1 rounded-full border"
                style={{ color, borderColor: `${color}55`, background: `${color}12` }}
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Strip 1 — left */}
        <div className="mb-3">
          <GaleriaStrip items={row1} direction="left" />
        </div>

        {/* Strip 2 — right */}
        <GaleriaStrip items={row2} direction="right" />

      </section>
    </>
  )
}
