import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || 're_placeholder')
}

export const resend = getResend()

export async function enviarEmailConfirmacion(data: {
  email: string
  nombre: string
  codigo: string
  habitacion: string
  checkin: string
  checkout: string
  noches: number
  huespedes: number
  total: number
}) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM || 'reservas@hatuchayinka.com',
    to: data.email,
    subject: `✅ Reserva Confirmada ${data.codigo} — Hatuchay Inka Apart Hotel`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f8f5f0; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: #1a3a5c; padding: 30px; text-align: center; }
    .header h1 { color: #c9a84c; font-size: 24px; margin: 0; }
    .header p { color: white; margin: 8px 0 0; }
    .body { padding: 40px 30px; }
    .code-box { background: #f0f7ff; border: 2px solid #1a3a5c; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
    .code { font-size: 28px; font-weight: bold; color: #1a3a5c; letter-spacing: 3px; }
    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #ece7de; }
    .label { color: #888; font-size: 14px; }
    .value { font-weight: bold; color: #2d2d2d; }
    .total-row { background: #1a3a5c; color: white; padding: 15px; border-radius: 8px; margin-top: 20px; display: flex; justify-content: space-between; }
    .footer { background: #1a3a5c; padding: 20px; text-align: center; color: #c9a84c; font-size: 12px; }
    .btn { display: inline-block; background: #c9a84c; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Hatuchay Inka Apart Hotel</h1>
      <p>Cajamarca, Perú — Jr. Dos de Mayo 221</p>
    </div>
    <div class="body">
      <h2 style="color:#1a3a5c">¡Reserva Confirmada, ${data.nombre}!</h2>
      <p style="color:#666">Nos complace confirmar tu reserva en Hatuchay Inka Apart Hotel. A continuación encontrarás todos los detalles de tu estancia.</p>

      <div class="code-box">
        <p style="margin:0;color:#666;font-size:12px">CÓDIGO DE RESERVA</p>
        <div class="code">${data.codigo}</div>
        <p style="margin:4px 0 0;color:#888;font-size:12px">Guarda este código para tu llegada</p>
      </div>

      <h3 style="color:#1a3a5c;border-bottom:2px solid #c9a84c;padding-bottom:8px">Detalles de tu Reserva</h3>
      <div class="detail-row">
        <span class="label">🛏️ Habitación</span>
        <span class="value">${data.habitacion}</span>
      </div>
      <div class="detail-row">
        <span class="label">📅 Check-in</span>
        <span class="value">${data.checkin} desde las 14:00</span>
      </div>
      <div class="detail-row">
        <span class="label">📅 Check-out</span>
        <span class="value">${data.checkout} hasta las 12:00</span>
      </div>
      <div class="detail-row">
        <span class="label">🌙 Noches</span>
        <span class="value">${data.noches} noches</span>
      </div>
      <div class="detail-row">
        <span class="label">👥 Huéspedes</span>
        <span class="value">${data.huespedes} persona(s)</span>
      </div>
      <div class="total-row">
        <span>💰 Total Pagado</span>
        <span style="font-size:20px;font-weight:bold">S/ ${data.total.toFixed(2)}</span>
      </div>

      <h3 style="color:#1a3a5c;margin-top:30px">📍 Cómo Llegar</h3>
      <p style="color:#666">Jr. Dos de Mayo 221, Cajamarca 06000, Perú<br>A 2 cuadras de la Plaza de Armas</p>
      <a href="https://maps.google.com/?q=Hatuchay+Inka+Apart+Hotel+Cajamarca" class="btn">Ver en Google Maps</a>

      <p style="background:#fff8e6;padding:15px;border-radius:8px;border-left:4px solid #c9a84c">
        ⚡ Recibirás un WhatsApp con las indicaciones detalladas de llegada 24 horas antes de tu check-in.
      </p>

      <h3 style="color:#1a3a5c">📞 Contacto</h3>
      <p style="color:#666">
        📱 WhatsApp: +51 976 123 456<br>
        📞 Teléfono: +51 076 363 058<br>
        ✉️ Email: reservas@hatuchayinka.com
      </p>
    </div>
    <div class="footer">
      <p>© 2024 Hatuchay Inka Apart Hotel — Cajamarca, Perú</p>
      <p style="color:rgba(255,255,255,0.5);margin:4px 0 0">Este email fue enviado a ${data.email}</p>
    </div>
  </div>
</body>
</html>`,
  })
}

export async function enviarEmailRecordatorio(data: {
  email: string
  nombre: string
  codigo: string
  checkin: string
  checkout: string
}) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM || 'reservas@hatuchayinka.com',
    to: data.email,
    subject: `⏰ Recordatorio: Tu check-in es mañana — ${data.codigo}`,
    html: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
  <div style="background:#1a3a5c;padding:25px;text-align:center">
    <h1 style="color:#c9a84c;margin:0">Hatuchay Inka Apart Hotel</h1>
  </div>
  <div style="padding:30px">
    <h2 style="color:#1a3a5c">¡Hola ${data.nombre}, tu check-in es mañana!</h2>
    <p>Código de reserva: <strong>${data.codigo}</strong></p>
    <p>📅 Check-in: <strong>${data.checkin} desde las 14:00</strong></p>
    <p>📅 Check-out: <strong>${data.checkout} hasta las 12:00</strong></p>
    <p>📍 Jr. Dos de Mayo 221, Cajamarca (2 cuadras de la Plaza de Armas)</p>
    <p>📞 Recepción 24/7: +51 076 363 058</p>
    <p style="background:#f0f7ff;padding:12px;border-radius:6px">
      Recuerda traer tu documento de identidad al hacer el check-in.
    </p>
  </div>
</div>`,
  })
}

export async function enviarEmailCancelacion(data: {
  email: string
  nombre: string
  codigo: string
  motivo?: string
}) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM || 'reservas@hatuchayinka.com',
    to: data.email,
    subject: `❌ Reserva Cancelada ${data.codigo} — Hatuchay Inka Apart Hotel`,
    html: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
  <div style="background:#1a3a5c;padding:25px;text-align:center">
    <h1 style="color:#c9a84c;margin:0">Hatuchay Inka Apart Hotel</h1>
  </div>
  <div style="padding:30px">
    <h2 style="color:#c0392b">Reserva Cancelada</h2>
    <p>Hola ${data.nombre}, tu reserva <strong>${data.codigo}</strong> ha sido cancelada.</p>
    ${data.motivo ? `<p><strong>Motivo:</strong> ${data.motivo}</p>` : ''}
    <p>Si tienes alguna consulta, contáctanos:</p>
    <p>📞 +51 076 363 058 | ✉️ reservas@hatuchayinka.com</p>
  </div>
</div>`,
  })
}
