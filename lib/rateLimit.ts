import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}

/**
 * Returns true if the request is allowed, false if it should be blocked.
 * Window/limit are tuned per-route by the caller.
 */
export async function checkRateLimit(req: NextRequest, ruta: string, maxIntentos: number, ventanaMinutos: number): Promise<boolean> {
  const ip = getClientIp(req)
  const supabase = createServerClient()
  const desde = new Date(Date.now() - ventanaMinutos * 60 * 1000).toISOString()

  const { count } = await supabase
    .from('rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('ip', ip)
    .eq('ruta', ruta)
    .gte('created_at', desde)

  if ((count ?? 0) >= maxIntentos) return false

  await supabase.from('rate_limits').insert({ ip, ruta })
  return true
}
