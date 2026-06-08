'use client'

import React from 'react'

const images = [
  { url: '/images/habitaciones/102.jpeg',    alt: 'Suite Deluxe 102' },
  { url: '/images/habitaciones/105.jpeg',    alt: 'Suite Superior 105' },
  { url: '/images/habitaciones/106.jpeg',    alt: 'Apartamento Familiar 106' },
  { url: '/images/habitaciones/107.jpeg',    alt: 'Suite Presidencial 107' },
  { url: '/images/habitaciones/102b.jpeg',   alt: 'Suite 102 sala' },
  { url: '/images/habitaciones/105c.jpeg',   alt: 'Suite 105 dormitorio' },
  { url: '/images/habitaciones/106c.jpeg',   alt: 'Apto. 106 dormitorio' },
  { url: '/images/habitaciones/107d.jpeg',   alt: 'Suite 107 cocina' },
  { url: '/images/habitaciones/102d.jpeg',   alt: 'Suite 102 baño' },
  { url: '/images/habitaciones/105f.jpeg',   alt: 'Suite 105 detalle' },
  { url: '/images/habitaciones/106f.jpeg',   alt: 'Apto. 106 cocina' },
  { url: '/images/habitaciones/107j.jpeg',   alt: 'Suite 107 terraza' },
  { url: '/images/hotel/exteriores.jpeg',    alt: 'Exterior del hotel' },
  { url: '/images/hotel/entrada.jpeg',       alt: 'Entrada Hatuchay Inka' },
  { url: '/images/habitaciones/107f.jpeg',   alt: 'Suite 107 sala' },
]

const duplicatedImages = [...images, ...images]

export default function SeccionGaleria() {
  return (
    <>
      <style>{`
        @keyframes scroll-right {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .galeria-scroll {
          animation: scroll-right 35s linear infinite;
        }
        .galeria-scroll:hover {
          animation-play-state: paused;
        }
        .galeria-mask {
          mask: linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%);
          -webkit-mask: linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%);
        }
        .galeria-item {
          transition: transform 0.35s ease, filter 0.35s ease, box-shadow 0.35s ease;
        }
        .galeria-item:hover {
          transform: scale(1.06);
          filter: brightness(1.12);
          box-shadow: 0 20px 50px rgba(0,0,0,0.6);
        }
      `}</style>

      <section className="w-full bg-[#111] relative overflow-hidden py-16 md:py-20">

        {/* Header */}
        <div className="relative z-10 text-center mb-10 px-4">
          <p className="text-secondary font-semibold text-sm tracking-widest uppercase mb-2">Fotos</p>
          <h2
            className="font-display font-extrabold text-white drop-shadow-lg"
            style={{ fontSize: 'clamp(2.2rem, 8vw, 5rem)', lineHeight: 1, letterSpacing: '-0.02em' }}
          >
            Galería
          </h2>
          <div className="w-12 h-[2px] bg-secondary mx-auto mt-4" />
          <p className="text-gray-400 mt-4 max-w-xl mx-auto text-base md:text-lg">
            Descubre cada rincón de Hatuchay Inka Apart Hotel.
          </p>
        </div>

        {/* Scrolling strip */}
        <div className="relative z-10 w-full overflow-hidden">
          <div className="galeria-mask">
            <div className="galeria-scroll flex gap-4 w-max py-2">
              {duplicatedImages.map((img, i) => (
                <div
                  key={i}
                  className="galeria-item flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl cursor-pointer"
                  style={{ width: 'clamp(180px, 22vw, 320px)', height: 'clamp(180px, 22vw, 320px)' }}
                >
                  <img
                    src={img.url}
                    alt={img.alt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

      </section>
    </>
  )
}
