export function generarDeeplinkYape(monto: number, concepto: string): string {
  const numero = process.env.NEXT_PUBLIC_YAPE_NUMERO?.replace(/\s/g, '') || ''
  return `yape://pay?phone=${numero}&amount=${monto}&concept=${encodeURIComponent(concepto)}`
}

export function generarQRYapeUrl(monto: number, concepto: string): string {
  const deeplink = generarDeeplinkYape(monto, concepto)
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(deeplink)}`
}
