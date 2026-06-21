import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { validarCupon } from '@/lib/cupones'

export async function POST(req: NextRequest) {
  try {
    const { codigo, total } = await req.json()
    const supabase = createServerClient()
    const resultado = await validarCupon(supabase, codigo, Number(total) || 0)
    return NextResponse.json(resultado)
  } catch (error) {
    console.error('Error validando cupón:', error)
    return NextResponse.json({ valido: false, mensaje: 'Error al validar el cupón.', descuento: 0 }, { status: 500 })
  }
}
