'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { TrendingUp, Users, Eye, MousePointer } from 'lucide-react'

interface Visita {
  pagina: string
  referrer: string | null
  created_at: string
}

interface DayData {
  fecha: string
  visitas: number
}

interface PageData {
  pagina: string
  count: number
  porcentaje: number
}

const NOMBRES_PAGINAS: Record<string, string> = {
  '/': 'Inicio',
  '/habitaciones': 'Habitaciones',
  '/reservas': 'Reservas',
  '/contacto': 'Contacto',
  '/nosotros': 'Nosotros',
  '/reservas/confirmacion': 'Confirmación',
}

function nombrePagina(path: string) {
  if (path.startsWith('/habitaciones/')) return `Hab. ${path.split('/')[2]}`
  return NOMBRES_PAGINAS[path] ?? path
}

export default function AnaliticasPage() {
  const [loading, setLoading] = useState(true)
  const [visitas, setVisitas] = useState<Visita[]>([])
  const [rango, setRango] = useState<7 | 30 | 90>(30)

  useEffect(() => {
    const fetchVisitas = async () => {
      setLoading(true)
      const desde = new Date()
      desde.setDate(desde.getDate() - rango)
      const { data } = await supabase
        .from('visitas')
        .select('pagina, referrer, created_at')
        .gte('created_at', desde.toISOString())
        .order('created_at', { ascending: true })
      setVisitas((data as Visita[]) ?? [])
      setLoading(false)
    }
    fetchVisitas()
  }, [rango])

  // Agrupar visitas por día
  const visitasPorDia: DayData[] = (() => {
    const map: Record<string, number> = {}
    const desde = new Date()
    desde.setDate(desde.getDate() - rango)
    for (let i = 0; i <= rango; i++) {
      const d = new Date(desde)
      d.setDate(d.getDate() + i)
      const key = d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
      map[key] = 0
    }
    visitas.forEach(v => {
      const key = new Date(v.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
      if (key in map) map[key]++
    })
    return Object.entries(map).map(([fecha, visitas]) => ({ fecha, visitas }))
  })()

  // Top páginas
  const topPaginas: PageData[] = (() => {
    const map: Record<string, number> = {}
    visitas.forEach(v => { map[v.pagina] = (map[v.pagina] ?? 0) + 1 })
    const total = visitas.length || 1
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([pagina, count]) => ({ pagina, count, porcentaje: Math.round((count / total) * 100) }))
  })()

  // Stats
  const hoy = new Date().toDateString()
  const ayer = new Date(Date.now() - 86400000).toDateString()
  const visitasHoy = visitas.filter(v => new Date(v.created_at).toDateString() === hoy).length
  const visitasAyer = visitas.filter(v => new Date(v.created_at).toDateString() === ayer).length
  const totalPeriodo = visitas.length
  const paginasUnicas = new Set(visitas.map(v => v.pagina)).size

  const stats = [
    { label: 'Visitas hoy', value: visitasHoy, sub: `${visitasAyer} ayer`, icon: Eye, color: 'text-primary', bg: 'bg-primary/10' },
    { label: `Visitas (${rango} días)`, value: totalPeriodo, sub: `~${Math.round(totalPeriodo / rango)}/día promedio`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Páginas distintas', value: paginasUnicas, sub: 'visitadas en el período', icon: MousePointer, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Pág. más visitada', value: topPaginas[0] ? nombrePagina(topPaginas[0].pagina) : '—', sub: topPaginas[0] ? `${topPaginas[0].count} visitas` : '', icon: Users, color: 'text-secondary', bg: 'bg-secondary/10' },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Analíticas</h1>
          <p className="text-ink/40 text-sm mt-0.5">Tráfico real del sitio web</p>
        </div>
        <div className="flex gap-2">
          {([7, 30, 90] as const).map(r => (
            <button
              key={r}
              onClick={() => setRango(r)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                rango === r ? 'bg-primary text-white border-primary' : 'bg-white text-ink/50 border-gray-200 hover:border-primary/40'
              }`}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map(({ label, value, sub, icon: Icon, color, bg }) => (
              <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon size={18} className={color} />
                </div>
                <p className="text-ink/40 text-xs mb-0.5">{label}</p>
                <p className="font-bold text-xl text-ink leading-tight">{value}</p>
                <p className="text-ink/30 text-xs mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          {/* Area chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
            <h2 className="font-semibold text-primary mb-5">Visitas por día</h2>
            {totalPeriodo === 0 ? (
              <div className="flex items-center justify-center h-48 text-ink/30 text-sm">
                Aún no hay datos. Las visitas aparecerán aquí en tiempo real.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={visitasPorDia} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVisitas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#034724" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#034724" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="fecha"
                    tick={{ fontSize: 11, fill: '#999' }}
                    tickLine={false}
                    axisLine={false}
                    interval={rango === 7 ? 0 : rango === 30 ? 4 : 9}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#999' }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #f0f0f0', fontSize: 13 }}
                    labelStyle={{ fontWeight: 600, color: '#034724' }}
                    formatter={(v) => [`${v} visitas`, '']}
                  />
                  <Area
                    type="monotone"
                    dataKey="visitas"
                    stroke="#034724"
                    strokeWidth={2}
                    fill="url(#colorVisitas)"
                    dot={false}
                    activeDot={{ r: 5, fill: '#034724' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top pages */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-primary mb-5">Páginas más visitadas</h2>
            {topPaginas.length === 0 ? (
              <p className="text-ink/30 text-sm text-center py-8">Sin datos aún</p>
            ) : (
              <div className="space-y-3.5">
                {topPaginas.map(({ pagina, count, porcentaje }) => (
                  <div key={pagina}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-ink">{nombrePagina(pagina)}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-ink/40">{porcentaje}%</span>
                        <span className="text-sm font-bold text-primary w-10 text-right">{count}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${porcentaje}%`, background: 'linear-gradient(to right, #034724, #c9a84c)' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
