import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('configuracion')
    .select('valor')
    .eq('clave', 'yape_qr_url')
    .maybeSingle()

  return NextResponse.json({ url: data?.valor || null })
}
