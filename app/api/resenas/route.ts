import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { checkRateLimit } from '@/lib/rateLimit'

const COLORES = ['#2d6a4f', '#1a5276', '#784212', '#6c3483', '#0e6655', '#b7950b', '#117a65', '#922b21', '#1f618d']
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export async function POST(req: NextRequest) {
  try {
    const permitido = await checkRateLimit(req, 'resenas', 3, 60)
    if (!permitido) {
      return NextResponse.json({ error: 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.' }, { status: 429 })
    }

    const { name, text, score, origin } = await req.json()

    if (!name?.trim() || !text?.trim() || !score) {
      return NextResponse.json({ error: 'Faltan campos obligatorios.' }, { status: 400 })
    }
    if (text.trim().length < 20) {
      return NextResponse.json({ error: 'La reseña debe tener al menos 20 caracteres.' }, { status: 400 })
    }
    if (typeof score !== 'number' || score < 6 || score > 10) {
      return NextResponse.json({ error: 'Puntuación inválida.' }, { status: 400 })
    }

    const now = new Date()
    const supabase = createServerClient()

    const { error } = await supabase.from('resenas').insert({
      name:     name.trim(),
      text:     text.trim(),
      score,
      origin:   origin?.trim() || 'Huésped verificado',
      date:     `${MESES[now.getMonth()]} ${now.getFullYear()}`,
      initials: name.trim().charAt(0).toUpperCase(),
      color:    COLORES[Math.floor(Math.random() * COLORES.length)],
      orden:    9999,
      aprobada: false,
    })

    if (error) {
      console.error('Error guardando reseña pública:', error)
      return NextResponse.json({ error: 'Error al guardar la reseña.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('POST /api/resenas error:', err)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
