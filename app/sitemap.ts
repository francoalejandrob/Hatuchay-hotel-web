import { MetadataRoute } from 'next'
import { HABITACIONES_DATA } from '@/lib/constants'
import { createServerClient } from '@/lib/supabase'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hatuchay-inka.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const estaticas: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/habitaciones`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/reservas`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/nosotros`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contacto`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/blog`, changeFrequency: 'weekly', priority: 0.7 },
  ]

  const habitaciones: MetadataRoute.Sitemap = HABITACIONES_DATA.map((h) => ({
    url: `${SITE_URL}/habitaciones/${h.id}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  let blogPosts: MetadataRoute.Sitemap = []
  try {
    const supabase = createServerClient()
    const { data } = await supabase.from('blog_posts').select('slug').eq('publicado', true)
    blogPosts = (data ?? []).map((p: { slug: string }) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  } catch {
    // blog_posts table may not exist yet — skip silently
  }

  return [...estaticas, ...habitaciones, ...blogPosts]
}
