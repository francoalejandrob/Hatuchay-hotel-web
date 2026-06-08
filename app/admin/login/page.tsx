'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Lock } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Credenciales incorrectas. Intenta de nuevo.')
    } else {
      router.push('/admin')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-secondary text-3xl font-bold">Hatuchay Inka</h1>
          <p className="text-white/50 text-sm mt-1">Panel de Administración</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-2xl p-8 shadow-2xl space-y-4">
          <div className="flex items-center justify-center w-14 h-14 bg-primary/10 rounded-full mx-auto mb-4">
            <Lock size={24} className="text-primary" />
          </div>
          <h2 className="text-center font-semibold text-primary text-lg">Iniciar sesión</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="label-hotel">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-hotel"
              placeholder="admin@hatuchayinka.com"
              required
            />
          </div>

          <div>
            <label className="label-hotel">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-hotel"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="w-full btn-primary rounded-xl py-3 flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Ingresando...</> : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
