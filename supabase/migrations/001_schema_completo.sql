-- ════════════════════════════════════════════════════════════════
-- Schema completo Hatuchay Inka Apart Hotel
-- Ejecutar en Supabase → SQL Editor → New query → Run
-- ════════════════════════════════════════════════════════════════

-- Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id          uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      text    NOT NULL,
  apellido    text    NOT NULL,
  email       text    UNIQUE NOT NULL,
  telefono    text,
  whatsapp    text,
  pais        text,
  created_at  timestamptz DEFAULT now()
);

-- Reservas (habitacion_id es texto: '102', '105', '106', '107')
CREATE TABLE IF NOT EXISTS reservas (
  id                uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo            text    UNIQUE NOT NULL,
  cliente_id        uuid    REFERENCES clientes(id),
  habitacion_id     text    NOT NULL,
  fecha_checkin     date    NOT NULL,
  fecha_checkout    date    NOT NULL,
  num_huespedes     integer,
  noches            integer,
  precio_total      numeric(10,2),
  estado            text    NOT NULL DEFAULT 'pendiente',
  whatsapp_enviado  boolean DEFAULT false,
  email_enviado     boolean DEFAULT false,
  notas             text,
  created_at        timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reservas_hab_fechas
  ON reservas (habitacion_id, fecha_checkin, fecha_checkout);

-- Pagos
CREATE TABLE IF NOT EXISTS pagos (
  id                  uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  reserva_id          uuid    REFERENCES reservas(id),
  monto               numeric(10,2),
  moneda              text    DEFAULT 'PEN',
  metodo              text,
  estado              text,
  referencia_externa  text,
  comprobante_url     text,
  fecha_pago          timestamptz,
  created_at          timestamptz DEFAULT now()
);

-- Bloqueos manuales (días cerrados por el hotel)
CREATE TABLE IF NOT EXISTS bloqueos (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habitacion_id  text NOT NULL,
  fecha_inicio   date NOT NULL,
  fecha_fin      date NOT NULL,
  motivo         text
);

-- Bloqueos externos (sincronizados desde Airbnb / Booking.com vía iCal)
CREATE TABLE IF NOT EXISTS bloqueos_externos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habitacion_id   text NOT NULL,
  fecha_inicio    date NOT NULL,
  fecha_fin       date NOT NULL,
  fuente          text NOT NULL CHECK (fuente IN ('airbnb', 'booking', 'manual')),
  uid_externo     text,
  resumen         text,
  sincronizado_en timestamptz DEFAULT now(),
  UNIQUE (habitacion_id, uid_externo)
);

CREATE INDEX IF NOT EXISTS idx_bloqueos_ext_hab_fechas
  ON bloqueos_externos (habitacion_id, fecha_inicio, fecha_fin);

-- ── Vista combinada de disponibilidad ─────────────────────────
CREATE OR REPLACE VIEW v_fechas_bloqueadas AS
  SELECT habitacion_id,
         fecha_checkin  AS fecha_inicio,
         fecha_checkout AS fecha_fin,
         'reserva'      AS origen
  FROM reservas
  WHERE estado NOT IN ('cancelada', 'pago_rechazado')
  UNION ALL
  SELECT habitacion_id, fecha_inicio, fecha_fin, motivo AS origen
  FROM bloqueos
  UNION ALL
  SELECT habitacion_id, fecha_inicio, fecha_fin, fuente AS origen
  FROM bloqueos_externos;

-- ── Storage bucket para comprobantes de pago ──────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('comprobantes', 'comprobantes', false)
ON CONFLICT (id) DO NOTHING;

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE clientes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas         ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE bloqueos         ENABLE ROW LEVEL SECURITY;
ALTER TABLE bloqueos_externos ENABLE ROW LEVEL SECURITY;

-- Solo el service_role (backend) puede escribir
CREATE POLICY "service_all_clientes"          ON clientes          FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_all_reservas"          ON reservas          FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_all_pagos"             ON pagos             FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_all_bloqueos"          ON bloqueos          FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_all_bloqueos_externos" ON bloqueos_externos FOR ALL USING (auth.role() = 'service_role');

-- Anon puede leer disponibilidad (para el calendario del sitio web)
CREATE POLICY "anon_read_reservas"           ON reservas          FOR SELECT USING (true);
CREATE POLICY "anon_read_bloqueos"           ON bloqueos          FOR SELECT USING (true);
CREATE POLICY "anon_read_bloqueos_externos"  ON bloqueos_externos FOR SELECT USING (true);

-- Storage: solo service_role sube/lee comprobantes
CREATE POLICY "service_storage_comprobantes"
  ON storage.objects FOR ALL
  USING (bucket_id = 'comprobantes' AND auth.role() = 'service_role');
