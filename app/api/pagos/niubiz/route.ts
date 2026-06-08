import { NextRequest, NextResponse } from 'next/server'
import { obtenerTokenNiubiz, crearSesionNiubiz } from '@/lib/niubiz'

export async function POST(req: NextRequest) {
  try {
    const { monto, codigoReserva } = await req.json()
    const token = await obtenerTokenNiubiz()
    const sesion = await crearSesionNiubiz(monto, codigoReserva, token)
    return NextResponse.json({ success: true, sesion })
  } catch (error) {
    console.error('Niubiz error:', error)
    return NextResponse.json({ success: false, error: 'Error al crear sesión de pago.' }, { status: 500 })
  }
}
