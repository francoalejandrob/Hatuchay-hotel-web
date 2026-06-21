import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase'
import { formatearFecha } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog — Guía de Cajamarca',
  description: 'Guías, recomendaciones y curiosidades sobre Cajamarca, su historia y sus atractivos turísticos, por Hatuchay Inka Apart Hotel.',
}

export const revalidate = 300

interface Post {
  id: string
  titulo: string
  slug: string
  resumen: string
  imagen_portada: string | null
  created_at: string
}

export default async function BlogPage() {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('id, titulo, slug, resumen, imagen_portada, created_at')
    .eq('publicado', true)
    .order('created_at', { ascending: false })

  const posts = (data as Post[]) ?? []

  return (
    <div className="min-h-screen bg-warm pt-24 pb-16">
      <div className="bg-primary text-white pt-8 pb-16 px-4 mb-[-3rem]">
        <div className="max-w-7xl mx-auto">
          <p className="text-secondary font-semibold text-sm tracking-widest uppercase mb-2">Blog</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-3">Guía de Cajamarca</h1>
          <p className="text-white/60 max-w-xl">Historia, cultura y recomendaciones para vivir Cajamarca al máximo.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card p-16 text-center text-ink/40">
            Aún no hay artículos publicados. ¡Vuelve pronto!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(p => (
              <Link
                key={p.id}
                href={`/blog/${p.slug}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative h-48 bg-warm-dark">
                  {p.imagen_portada && (
                    <Image src={p.imagen_portada} alt={p.titulo} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, 33vw" />
                  )}
                </div>
                <div className="p-5">
                  <p className="text-ink/40 text-xs mb-2">{formatearFecha(p.created_at)}</p>
                  <h2 className="font-display text-primary text-lg font-bold leading-snug mb-2 group-hover:text-secondary transition-colors line-clamp-2">
                    {p.titulo}
                  </h2>
                  <p className="text-ink/55 text-sm line-clamp-2 mb-3">{p.resumen}</p>
                  <span className="flex items-center gap-1.5 text-secondary text-sm font-semibold">
                    Leer más <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
