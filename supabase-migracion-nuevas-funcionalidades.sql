-- ════════════════════════════════════════════════════════════════
-- Migración: 10 nuevas funcionalidades — Hatuchay Inka
-- Ejecutar una sola vez en Supabase SQL Editor
-- ════════════════════════════════════════════════════════════════

-- 1) Rate limiting (seguridad anti-spam en /api/reservas y /api/contacto)
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip TEXT NOT NULL,
  ruta TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_ruta ON rate_limits (ip, ruta, created_at);
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
-- Sin políticas públicas: solo la service role (usada en el servidor) puede leer/escribir.

-- 2) Reseñas (reemplaza el array hardcodeado en SeccionReseñas)
CREATE TABLE IF NOT EXISTS resenas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  score INTEGER NOT NULL DEFAULT 10,
  text TEXT NOT NULL,
  name TEXT NOT NULL,
  origin TEXT,
  date TEXT,
  initials TEXT,
  color TEXT DEFAULT '#034724',
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE resenas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "resenas_read_public" ON resenas;
CREATE POLICY "resenas_read_public" ON resenas FOR SELECT USING (true);
DROP POLICY IF EXISTS "resenas_write_auth" ON resenas;
CREATE POLICY "resenas_write_auth" ON resenas FOR ALL USING (auth.role() = 'authenticated');

-- 3) Cupones de descuento
CREATE TABLE IF NOT EXISTS cupones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT UNIQUE NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'porcentaje', -- 'porcentaje' | 'monto_fijo'
  valor NUMERIC(10,2) NOT NULL,
  fecha_expiracion DATE,
  usos_maximos INTEGER,
  usos_actuales INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE cupones ENABLE ROW LEVEL SECURITY;
-- Sin política pública: validación y aplicación ocurren siempre vía el servidor (service role).
DROP POLICY IF EXISTS "cupones_write_auth" ON cupones;
CREATE POLICY "cupones_write_auth" ON cupones FOR ALL USING (auth.role() = 'authenticated');

-- 4) Blog / guía local
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  resumen TEXT,
  contenido TEXT NOT NULL,
  imagen_portada TEXT,
  publicado BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "blog_write_auth" ON blog_posts;
CREATE POLICY "blog_write_auth" ON blog_posts FOR ALL USING (auth.role() = 'authenticated');
-- (Las páginas públicas /blog usan la service role en el servidor, no necesitan política pública.)

-- 5) Nuevas columnas en reservas: cupones aplicados + solicitud de cancelación del huésped
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS cupon_codigo TEXT;
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS descuento_aplicado NUMERIC(10,2);
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS cancelacion_solicitada BOOLEAN DEFAULT false;

-- 6) Completar políticas de "contactos" (la migración anterior solo tenía INSERT y SELECT;
--    el panel admin también necesita poder marcar como leído y eliminar mensajes)
DROP POLICY IF EXISTS "contactos_update_auth" ON contactos;
CREATE POLICY "contactos_update_auth" ON contactos FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "contactos_delete_auth" ON contactos;
CREATE POLICY "contactos_delete_auth" ON contactos FOR DELETE USING (auth.role() = 'authenticated');

-- 7) (Opcional) Un par de artículos de ejemplo para que el blog no se vea vacío.
--    Puedes editarlos o borrarlos desde /admin/blog cuando quieras.
INSERT INTO blog_posts (titulo, slug, resumen, contenido, publicado) VALUES
(
  'Qué ver en Cajamarca: la guía esencial',
  'que-ver-en-cajamarca-guia-esencial',
  'Los imprescindibles del centro histórico de Cajamarca, a pocos minutos a pie de Hatuchay Inka.',
  'Cajamarca es una de las ciudades coloniales mejor conservadas del norte del Perú, y también uno de los escenarios más importantes de la historia americana: aquí se encontraron el Inca Atahualpa y Francisco Pizarro en 1532.

A pocos minutos del hotel encontrarás la Plaza de Armas, rodeada por la Catedral y la Iglesia San Francisco, ambas del siglo XVII. Justo al lado está el Cuarto del Rescate, el único vestigio arquitectónico inca que queda en pie en la ciudad.

Si tienes medio día más, sube a la Colina Santa Apolonia para ver toda la ciudad desde arriba, o visita el Complejo Belén, una joya del barroco andino con su antiguo hospital colonial.

Para los que buscan naturaleza, los Baños del Inca y el acueducto preincaico de Cumbemayo están a poco más de 20 minutos en auto, y son una de las experiencias más memorables de la región.',
  true
),
(
  'Baños del Inca: aguas termales con historia',
  'banos-del-inca-aguas-termales',
  'El lugar donde Atahualpa se bañaba antes de su captura, hoy convertido en un complejo termal abierto a todos.',
  'A unos 10 minutos en auto desde el centro de Cajamarca se encuentran los Baños del Inca, aguas termales que brotan naturalmente a más de 70°C y que fueron usadas por el propio Inca Atahualpa antes de ser capturado por Francisco Pizarro en 1532.

Hoy el complejo cuenta con piscinas públicas, tinas privadas y pozas al aire libre rodeadas de paisaje andino. Las aguas son ricas en minerales y tienen fama de propiedades terapéuticas, ideales para relajarse después de explorar la ciudad.

Recomendamos ir a primera hora de la mañana o al atardecer, cuando hay menos gente y el contraste entre el aire frío y el agua caliente es parte de la experiencia.',
  true
),
(
  'Cumbemayo: el acueducto que desafía el tiempo',
  'cumbemayo-acueducto-preincaico',
  'A 3,500 msnm, el canal de piedra tallada hace 3,500 años sigue siendo una maravilla de ingeniería.',
  'Cumbemayo es uno de los sitios arqueológicos más impresionantes del norte peruano: un acueducto preincaico tallado directamente en roca viva, construido hace más de 3,500 años para canalizar agua entre dos cuencas hidrográficas distintas.

El recorrido pasa por formaciones rocosas conocidas como los "Frailones" o "Bosque de Piedras", y por un pequeño santuario con petroglifos. La caminata es accesible y toma entre 1 y 2 horas.

Está a unos 30 minutos en auto desde Cajamarca. Por la altitud (3,500 msnm), te recomendamos llevar abrigo y aclimatarte un poco antes de la visita.',
  true
);
