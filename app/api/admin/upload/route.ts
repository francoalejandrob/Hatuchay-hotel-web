import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file     = formData.get('file') as File | null
    const bucket   = formData.get('bucket') as string | null
    const path     = formData.get('path') as string | null

    if (!file || !bucket || !path) {
      return NextResponse.json({ error: 'Faltan parámetros.' }, { status: 400 })
    }

    const supabase = createServerClient() // usa service role key → bypasses RLS
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, { contentType: file.type, upsert: false })

    if (error) {
      console.error('Storage upload error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path)
    return NextResponse.json({ publicUrl })
  } catch (err) {
    console.error('Upload route error:', err)
    return NextResponse.json({ error: 'Error interno al subir el archivo.' }, { status: 500 })
  }
}
