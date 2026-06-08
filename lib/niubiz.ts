const NIUBIZ_API_URL = process.env.NIUBIZ_API_URL || 'https://apitestenv.vnforapps.com'

export async function obtenerTokenNiubiz(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.NIUBIZ_USERNAME}:${process.env.NIUBIZ_PASSWORD}`
  ).toString('base64')

  const res = await fetch(`${NIUBIZ_API_URL}/api.security/v1/security`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  })

  if (!res.ok) throw new Error('Error obteniendo token Niubiz')
  return res.text()
}

export async function crearSesionNiubiz(monto: number, codigoReserva: string, token: string) {
  const merchantId = process.env.NIUBIZ_MERCHANT_ID!

  const res = await fetch(`${NIUBIZ_API_URL}/api.ecommerce/v2/ecommerce/token/session/${merchantId}`, {
    method: 'POST',
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: monto,
      antifraud: {
        clientIp: '127.0.0.1',
        merchantDefineData: {
          MDD4: codigoReserva,
          MDD21: '2',
          MDD32: codigoReserva,
          MDD75: 'Venta_Simple',
          MDD77: '1',
        },
      },
      recurrenceMaxAmount: monto,
    }),
  })

  if (!res.ok) throw new Error('Error creando sesión Niubiz')
  return res.json()
}
