'use client'

import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { HABITACIONES_DATA } from './constants'

export interface HabitacionData {
  id: string
  nombre: string
  descripcion: string
  tipo: string
  capacidad: number
  precio_por_noche: number
  imagenes: string[]
  amenidades: string[]
  disponible: boolean
}

function fromRow(row: Record<string, unknown>): HabitacionData {
  return {
    id: (row.codigo ?? row.id) as string,
    nombre: row.nombre as string,
    descripcion: (row.descripcion as string) ?? '',
    tipo: (row.tipo as string) ?? 'suite',
    capacidad: (row.capacidad as number) ?? 2,
    precio_por_noche: Number(row.precio_por_noche ?? 0),
    imagenes: (row.imagenes as string[]) ?? [],
    amenidades: (row.amenidades as string[]) ?? [],
    disponible: (row.disponible as boolean) ?? true,
  }
}

const fallback: HabitacionData[] = HABITACIONES_DATA.map(h => ({ ...h, disponible: true }))

export function useHabitaciones() {
  const [habitaciones, setHabitaciones] = useState<HabitacionData[]>(fallback)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('habitaciones')
      .select('*')
      .order('codigo')
      .then((result) => {
        if (result.data && result.data.length > 0) {
          setHabitaciones(result.data.map(fromRow))
        }
        setLoading(false)
      })
  }, [])

  return { habitaciones, loading }
}
