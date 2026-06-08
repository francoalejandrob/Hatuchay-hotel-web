import twilio from 'twilio'

export function getTwilioClient() {
  return twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  )
}

export async function enviarWhatsApp(destinatario: string, mensaje: string) {
  const client = getTwilioClient()
  return client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM!,
    to: `whatsapp:${destinatario}`,
    body: mensaje,
  })
}

export function mensajeConfirmacion(data: {
  nombre: string
  codigo: string
  habitacion: string
  checkin: string
  checkout: string
  huespedes: number
  total: number
}) {
  return `🏨 *Reserva Confirmada — Hatuchay Inka Apart Hotel*

Hola ${data.nombre}! Tu reserva ha sido confirmada exitosamente. ✅

📋 *Código de reserva:* ${data.codigo}
🛏️ *Habitación:* ${data.habitacion}
📅 *Check-in:* ${data.checkin}
📅 *Check-out:* ${data.checkout}
👥 *Huéspedes:* ${data.huespedes}
💰 *Total pagado:* S/ ${data.total.toFixed(2)}

Para cualquier consulta responde este mensaje o llámanos al +51 076 363 058.

¡Te esperamos en Cajamarca! 🙌`
}

export function mensajePagoVerificacion(metodo: string) {
  return metodo === 'yape'
    ? `⏳ *Pago Yape Recibido — Hatuchay Inka*\n\nRecibimos tu solicitud de pago. Verificaremos tu Yape en los próximos 30 minutos y te confirmaremos por este medio. ¡Gracias por tu preferencia!`
    : `⏳ *Transferencia Recibida — Hatuchay Inka*\n\nRecibimos tu comprobante. Verificaremos tu transferencia en las próximas 2 horas hábiles y te confirmaremos por este medio. ¡Gracias!`
}

export function mensajeAdminPagoPendiente(data: {
  codigo: string
  cliente: string
  metodo: string
  monto: number
}) {
  return `⚠️ *Nuevo Pago Pendiente de Verificación*

Reserva: ${data.codigo}
Cliente: ${data.cliente}
Método: ${data.metodo === 'yape' ? 'Yape' : 'Transferencia Bancaria'}
Monto: S/ ${data.monto.toFixed(2)}

Ver en panel: ${process.env.NEXT_PUBLIC_SITE_URL}/admin/reservas`
}

export function mensajeLlegada(data: {
  nombre: string
  checkin: string
  codigo: string
}) {
  return `📍 *Indicaciones de Llegada — Hatuchay Inka Apart Hotel*

Hola ${data.nombre}! Tu check-in es mañana. Aquí están las indicaciones:

🗺️ *Dirección:* Jr. Dos de Mayo 221, Cajamarca
📌 *Google Maps:* https://maps.google.com/?q=Hatuchay+Inka+Apart+Hotel+Cajamarca

🚗 *Cómo llegar:*
- En taxi desde el aeropuerto: 15 minutos aprox.
- A 2 cuadras de la Plaza de Armas de Cajamarca

🕐 *Check-in:* Desde las 14:00
🕒 *Check-out:* Hasta las 12:00

🔑 *Al llegar:* Preséntate en recepción con tu documento de identidad y código: *${data.codigo}*

📞 *Recepción 24/7:* +51 076 363 058

¡Nos vemos mañana en Cajamarca! 🏨`
}

export function mensajeReseña(nombre: string) {
  return `⭐ *¡Gracias por hospedarte en Hatuchay Inka Apart Hotel!*

Hola ${nombre}, esperamos que tu estadía haya sido excepcional.

¿Nos dejarías una reseña? Solo toma 1 minuto:
👉 https://g.page/r/hatuchay-inka-cajamarca/review

Tu opinión nos ayuda a mejorar y a otros viajeros a elegir Cajamarca. ¡Muchas gracias! 🙏`
}
