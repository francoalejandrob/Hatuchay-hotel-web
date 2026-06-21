'use client'

import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export interface Resena {
  id?: string
  score: number
  text: string
  name: string
  origin: string
  date: string
  initials: string
  color: string
  orden?: number
}

export const RESENAS_FALLBACK: Resena[] = [
  { score: 10, text: 'El trato del personal, muy amable y servicial.', name: 'Keith', origin: 'Perú · Habitación Familiar', date: 'Abr 2026', initials: 'K', color: '#2d6a4f' },
  { score: 10, text: 'Agua caliente, ubicación cerca a la plaza, wifi, el desayuno a la habitación.', name: 'Nataly', origin: 'Perú · En pareja', date: 'Sep 2025', initials: 'N', color: '#1a5276' },
  { score: 10, text: 'La atención, amabilidad del Sr Eduardo y su preocupación porque sus huéspedes se sientan cómodos hace que uno se sienta como en casa. 100% recomiendo el alojamiento!', name: 'Eduardo', origin: 'Perú · En familia', date: 'Sep 2025', initials: 'E', color: '#784212' },
  { score: 10, text: 'El departamento muy lindo, el desayuno muy rico y puntual, la habitación muy limpia, muy agradable y la atención excelente.', name: 'Jimenez', origin: 'Perú · Apartamento', date: 'Oct 2024', initials: 'J', color: '#6c3483' },
  { score: 10, text: 'La ubicación súper céntrica cerca a la plaza de armas, la amabilidad de los host y la comodidad del hotel. El desayuno súper completo.', name: 'Nathalie', origin: 'Perú · En grupo', date: 'Mar 2024', initials: 'N', color: '#0e6655' },
  { score: 10, text: 'Lugar acogedor, atendido por sus dueños. Muy amables y siempre pendientes de que estés cómodo. Camas cómodas y desayuno increíble!', name: 'Matias', origin: 'Chile · Solo', date: 'Nov 2023', initials: 'M', color: '#b7950b' },
  { score: 10, text: 'The breakfast everyday is delicious. We really enjoyed our stay. The location is great and close to all the sights.', name: 'Renee', origin: 'EEUU · Suite Deluxe', date: 'Ene 2026', initials: 'R', color: '#117a65' },
  { score: 10, text: 'The huge, cute, funky apartment, full kitchen, comfortable beds, great water pressure and lots of hot water. The man who runs the hotel is a highlight.', name: 'Laurie', origin: 'EEUU · Suite Deluxe', date: 'Oct 2024', initials: 'L', color: '#922b21' },
  { score: 9, text: 'El hotel está ubicado en una calle peatonal muy bonita. Mi cuarto era confortable y bien equipado. El dueño es muy amable y de buen consejo.', name: 'Bernard', origin: 'Francia · En familia', date: 'Mar 2026', initials: 'B', color: '#1f618d' },
  { score: 9, text: 'Ubicación céntrica, muy confortable y tranquilo, hotel seguro y el señor caballero muy amable.', name: 'Bryan', origin: 'Perú · En pareja', date: 'Ago 2025', initials: 'B', color: '#117a65' },
  { score: 9, text: 'The breakfast was great, quiet location, only foot traffic outside, close to the Plaza de Armas.', name: 'Geoffrey', origin: 'Australia · En pareja', date: 'Dic 2023', initials: 'G', color: '#784212' },
  { score: 9, text: 'The apartment was clean, spacious, and very comfortable. The staff was exceptionally kind and helpful.', name: 'Riccardo', origin: 'EEUU · En pareja', date: 'Ago 2023', initials: 'R', color: '#6c3483' },
  { score: 8, text: 'Cerca al centro, personal muy amable, habitación amplia y limpia, desayuno delicioso, precio adecuado.', name: 'Silvana', origin: 'Perú · En familia', date: 'Jul 2023', initials: 'S', color: '#1a5276' },
  { score: 8, text: 'Eduardo was an excellent host. He allowed us to stay in the room before the check-in hour. Very kind and helpful.', name: 'Maria', origin: 'EEUU · En familia', date: 'Sep 2024', initials: 'M', color: '#b7950b' },
]

export function useResenas() {
  const [resenas, setResenas] = useState<Resena[]>(RESENAS_FALLBACK)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('resenas')
      .select('*')
      .order('orden', { ascending: true })
      .then((result) => {
        if (result.data && result.data.length > 0) {
          setResenas(result.data as Resena[])
        }
        setLoading(false)
      })
  }, [])

  return { resenas, loading }
}
