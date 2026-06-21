import { SupabaseClient } from '@supabase/supabase-js'

export interface ValidacionCupon {
  valido: boolean
  mensaje?: string
  descuento: number
  cupon?: { id: string; codigo: string; tipo: string; valor: number }
}

export async function validarCupon(supabase: SupabaseClient, codigo: string, total: number): Promise<ValidacionCupon> {
  if (!codigo?.trim()) return { valido: false, mensaje: 'Ingresa un código de cupón.', descuento: 0 }

  const { data: cupon } = await supabase
    .from('cupones')
    .select('*')
    .ilike('codigo', codigo.trim())
    .maybeSingle()

  if (!cupon) return { valido: false, mensaje: 'Cupón no válido.', descuento: 0 }
  if (!cupon.activo) return { valido: false, mensaje: 'Este cupón ya no está activo.', descuento: 0 }
  if (cupon.fecha_expiracion && new Date(cupon.fecha_expiracion) < new Date()) {
    return { valido: false, mensaje: 'Este cupón ha expirado.', descuento: 0 }
  }
  if (cupon.usos_maximos != null && cupon.usos_actuales >= cupon.usos_maximos) {
    return { valido: false, mensaje: 'Este cupón alcanzó su límite de usos.', descuento: 0 }
  }

  const descuento = cupon.tipo === 'porcentaje'
    ? Math.round((total * cupon.valor) / 100 * 100) / 100
    : Math.min(cupon.valor, total)

  return {
    valido: true,
    descuento,
    cupon: { id: cupon.id, codigo: cupon.codigo, tipo: cupon.tipo, valor: cupon.valor },
  }
}
