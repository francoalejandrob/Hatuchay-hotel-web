export type TipoHabitacion = 'simple' | 'doble' | 'suite' | 'familiar' | 'matrimonial'

export type EstadoReserva =
  | 'pendiente'
  | 'pago_pendiente_verificacion'
  | 'confirmada'
  | 'cancelada'
  | 'completada'
  | 'pago_rechazado'

export type MetodoPago = 'yape' | 'transferencia_bancaria'

export type EstadoPago = 'pendiente' | 'aprobado' | 'rechazado' | 'reembolsado'

export interface Habitacion {
  id: string
  nombre: string
  descripcion: string
  tipo: TipoHabitacion
  capacidad: number
  precio_por_noche: number
  imagenes: string[]
  amenidades: string[]
  disponible: boolean
  created_at: string
}

export interface Cliente {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono?: string
  whatsapp?: string
  pais?: string
  created_at: string
}

export interface Reserva {
  id: string
  codigo: string
  cliente_id: string
  habitacion_id: string
  fecha_checkin: string
  fecha_checkout: string
  num_huespedes: number
  noches: number
  precio_total: number
  estado: EstadoReserva
  whatsapp_enviado: boolean
  email_enviado: boolean
  notas?: string
  created_at: string
  cliente?: Cliente
  habitacion?: Habitacion
  cupon_codigo?: string
  descuento_aplicado?: number
  cancelacion_solicitada?: boolean
}

export interface Pago {
  id: string
  reserva_id: string
  monto: number
  moneda: string
  metodo: MetodoPago
  estado: EstadoPago
  referencia_externa?: string
  comprobante_url?: string
  fecha_pago?: string
  created_at: string
}

export interface Bloqueo {
  id: string
  habitacion_id: string
  fecha_inicio: string
  fecha_fin: string
  motivo?: string
}

export interface FormReservaStep1 {
  habitacion_id: string
  fecha_checkin: string
  fecha_checkout: string
  num_huespedes: number
}

export interface FormReservaStep2 {
  nombre: string
  apellido: string
  email: string
  whatsapp: string
  pais: string
  notas?: string
  terminos: boolean
}

export interface FormReservaStep3 {
  metodo_pago: MetodoPago
  yape_numero?: string
  yape_operacion?: string
  yape_comprobante?: File
  transferencia_banco?: string
  transferencia_operacion?: string
  transferencia_comprobante?: File
}

export interface DashboardStats {
  reservas_mes: number
  ingresos_mes: number
  ocupacion_actual: number
  proximos_checkins: Reserva[]
  pagos_pendientes: Reserva[]
}
