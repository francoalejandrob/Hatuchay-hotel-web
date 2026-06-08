import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { pagina, referrer } = await req.json()
    if (!pagina) return NextResponse.json({ ok: false }, { status: 400 })

    const supabase = createServerClient()
    await supabase.from('visitas').insert({
      pagina,
      referrer: referrer || null,
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
