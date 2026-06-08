-- ════════════════════════════════════════════════════════════════
-- Migración: bloqueos_externos
-- Almacena fechas bloqueadas importadas de Airbnb y Booking.com
-- vía sincronización iCal cada 30 minutos.
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS bloqueos_externos (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habitacion_id    text        NOT NULL,
  fecha_inicio     date        NOT NULL,
  fecha_fin        date        NOT NULL,
  fuente           text        NOT NULL CHECK (fuente IN ('airbnb', 'booking', 'manual')),
  uid_externo      text,
  resumen          text,
  sincronizado_en  timestamptz NOT NULL DEFAULT now(),

  -- Evita duplicados: el mismo evento (por uid) en la misma habitación
  UNIQUE (habitacion_id, uid_externo)
);

-- Índice para búsquedas de disponibilidad por habitación y fechas
CREATE INDEX IF NOT EXISTS idx_bloqueos_ext_hab_fechas
  ON bloqueos_externos (habitacion_id, fecha_inicio, fecha_fin);

-- ── Row Level Security ────────────────────────────────────────────
ALTER TABLE bloqueos_externos ENABLE ROW LEVEL SECURITY;

-- Solo el service role (backend) puede leer/escribir
CREATE POLICY "service_role_bloqueos_externos"
  ON bloqueos_externos
  FOR ALL
  USING (auth.role() = 'service_role');

-- El cliente anon puede leer (para mostrar fechas no disponibles)
CREATE POLICY "anon_read_bloqueos_externos"
  ON bloqueos_externos
  FOR SELECT
  USING (true);

-- ── Vista combinada de disponibilidad ────────────────────────────
-- Une reservas confirmadas + bloqueos de plataformas externas
-- Úsala desde el frontend con: supabase.from('v_fechas_bloqueadas')
CREATE OR REPLACE VIEW v_fechas_bloqueadas AS
  SELECT
    habitacion_id,
    fecha_checkin  AS fecha_inicio,
    fecha_checkout AS fecha_fin,
    'reserva'      AS origen
  FROM reservas
  WHERE estado NOT IN ('cancelada', 'pago_rechazado')

  UNION ALL

  SELECT
    habitacion_id,
    fecha_inicio,
    fecha_fin,
    fuente         AS origen
  FROM bloqueos_externos;

-- ── Función: verificar_disponibilidad ────────────────────────────
-- Retorna TRUE si la habitación está disponible en el rango dado.
-- Uso: SELECT verificar_disponibilidad('102', '2026-06-01', '2026-06-05');
CREATE OR REPLACE FUNCTION verificar_disponibilidad(
  p_habitacion_id text,
  p_checkin       date,
  p_checkout      date
) RETURNS boolean
LANGUAGE sql STABLE AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM v_fechas_bloqueadas
    WHERE habitacion_id = p_habitacion_id
      AND fecha_inicio  < p_checkout
      AND fecha_fin     > p_checkin
  );
$$;
