import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase'
import { formatearFecha } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'

export const revalidate = 300

interface Post {
  id: string
  titulo: string
  slug: string
  resumen: string
  contenido: string
  imagen_portada: string | null
  created_at: string
}

async function getPost(slug: string): Promise<Post | null> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('publicado', true)
    .maybeSingle()
  return data as Post | null
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug)
  if (!post) return {}
  return {
    title: post.titulo,
    description: post.resumen,
    openGraph: { title: post.titulo, description: post.resumen, images: post.imagen_portada ? [post.imagen_portada] : undefined },
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)
  if (!post) return notFound()

  return (
    <article className="min-h-screen bg-warm pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/blog" className="inline-flex items-center gap-2 text-secondary text-sm font-semibold mb-6 hover:underline">
          <ArrowLeft size={15} /> Volver al blog
        </Link>

        <p className="text-ink/40 text-sm mb-2">{formatearFecha(post.created_at)}</p>
        <h1 className="font-display text-primary text-3xl sm:text-4xl font-bold leading-tight mb-6">{post.titulo}</h1>

        {post.imagen_portada && (
          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-8 shadow-card">
            <Image src={post.imagen_portada} alt={post.titulo} fill className="object-cover" sizes="(max-width: 768px) 100vw, 768px" priority />
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8 space-y-4">
          {post.contenido.split('\n\n').map((parrafo, i) => (
            <p key={i} className="text-ink/75 leading-relaxed whitespace-pre-line">{parrafo}</p>
          ))}
        </div>
      </div>
    </article>
  )
}
