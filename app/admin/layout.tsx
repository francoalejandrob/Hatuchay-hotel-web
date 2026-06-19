'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LayoutDashboard, CalendarCheck, CalendarOff, Settings2, LogOut, Menu, X, Globe, BarChart2, TrendingUp, BedDouble } from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/reservas', label: 'Reservas', icon: CalendarCheck, exact: false },
  { href: '/admin/disponibilidad', label: 'Disponibilidad', icon: CalendarOff, exact: false },
  { href: '/admin/habitaciones', label: 'Habitaciones', icon: BedDouble, exact: false },
  { href: '/admin/analiticas', label: 'Analíticas', icon: TrendingUp, exact: false },
  { href: '/admin/configuracion', label: 'Configuración', icon: Settings2, exact: false },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (pathname === '/admin/login') return
    supabase.auth.getSession().then((result) => {
      if (!result.data.session) router.push('/admin/login')
    })
  }, [pathname, router])

  if (pathname === '/admin/login') return <>{children}</>

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-[#f4f3f0] flex">

      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col w-56 bg-primary fixed left-0 top-0 bottom-0 z-40 min-h-screen">
        <div className="px-5 py-5 border-b border-white/10">
          <p className="font-display text-secondary text-lg font-bold leading-tight">Hatuchay Inka</p>
          <p className="text-white/35 text-xs mt-0.5">Panel de Administración</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-secondary text-primary font-semibold shadow-sm'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-0.5">
          <p className="px-3 pt-1 pb-0.5 text-[10px] font-semibold text-white/25 uppercase tracking-widest">Analytics</p>
          <a
            href="https://vercel.com/francobracamonte24-3930s-projects/hatuchay-inka/analytics"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:bg-white/10 hover:text-white transition-all"
          >
            <BarChart2 size={16} /> Vercel Analytics
          </a>
          <a
            href="https://analytics.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:bg-white/10 hover:text-white transition-all"
          >
            <BarChart2 size={16} /> Google Analytics
          </a>
          <div className="border-t border-white/10 pt-2 mt-2 space-y-0.5">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:bg-white/10 hover:text-white transition-all"
            >
              <Globe size={16} /> Ver sitio web
            </a>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:bg-white/10 hover:text-white transition-all"
            >
              <LogOut size={16} /> Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-primary px-4 py-3 flex items-center justify-between shadow-md">
        <p className="font-display text-secondary font-bold">Hatuchay Inka Admin</p>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white p-1">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile overlay menu */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-primary flex flex-col pt-14">
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all ${
                    active ? 'bg-secondary text-primary font-semibold' : 'text-white/65 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon size={18} /> {label}
                </Link>
              )
            })}
          </nav>
          <div className="p-4 border-t border-white/10 space-y-1">
            <a href="https://vercel.com/francobracamonte24-3930s-projects/hatuchay-inka/analytics" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-white/50">
              <BarChart2 size={18} /> Vercel Analytics
            </a>
            <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-white/50">
              <BarChart2 size={18} /> Google Analytics
            </a>
            <a href="/" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-white/50">
              <Globe size={18} /> Ver sitio
            </a>
            <button onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-white/50">
              <LogOut size={18} /> Cerrar sesión
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-56 min-h-screen">
        <div className="pt-14 lg:pt-0">
          {children}
        </div>
      </div>
    </div>
  )
}
