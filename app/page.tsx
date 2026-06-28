import Hero from '@/components/ui/Hero'
import SeccionHabitaciones from '@/components/ui/SeccionHabitaciones'
import SeccionAmenidades from '@/components/ui/SeccionAmenidades'
import SeccionExperiencias from '@/components/ui/SeccionExperiencias'
import SeccionGaleria from '@/components/ui/SeccionGaleria'
import SeccionReseñas from '@/components/ui/SeccionReseñas'
import FormularioResena from '@/components/ui/FormularioResena'
import SeccionNosotros from '@/components/ui/SeccionNosotros'
import SeccionUbicacion from '@/components/ui/SeccionUbicacion'
import SeccionCTA from '@/components/ui/SeccionCTA'

export default function HomePage() {
  return (
    <>
      <Hero />
      <SeccionHabitaciones />
      <SeccionAmenidades />
      <SeccionExperiencias />
      <SeccionGaleria />
      <SeccionReseñas />
      <FormularioResena />
      <SeccionNosotros />
      <SeccionUbicacion />
      <SeccionCTA />
    </>
  )
}
