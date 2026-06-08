export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ')
}

export function formatearPrecio(monto: number): string {
  return `S/ ${monto.toFixed(2)}`
}

export function formatearFecha(fecha: string | Date): string {
  const d = new Date(fecha)
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })
}

export function calcularNoches(checkin: string, checkout: string): number {
  const inicio = new Date(checkin)
  const fin = new Date(checkout)
  const diff = fin.getTime() - inicio.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function generarCodigoReserva(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 9000) + 1000
  return `HTK-${year}-${random}`
}

export function etiquetaEstado(estado: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
    pago_pendiente_verificacion: { label: 'Verificando Pago', color: 'bg-orange-100 text-orange-800' },
    confirmada: { label: 'Confirmada', color: 'bg-green-100 text-green-800' },
    cancelada: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
    completada: { label: 'Completada', color: 'bg-blue-100 text-blue-800' },
    pago_rechazado: { label: 'Pago Rechazado', color: 'bg-red-200 text-red-900' },
  }
  return map[estado] || { label: estado, color: 'bg-gray-100 text-gray-800' }
}
