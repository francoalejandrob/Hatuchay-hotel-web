import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/auth-helpers-nextjs'

// Cookie-based client so the session is readable by middleware (server-side route protection)
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
)

export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  return createClient(url, key)
}

export const SQL_RESENAS_MIGRATION = `
-- Ejecutar en Supabase SQL Editor para habilitar aprobación de reseñas públicas
ALTER TABLE resenas ADD COLUMN IF NOT EXISTS aprobada BOOLEAN DEFAULT true;
ALTER TABLE resenas ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ DEFAULT NOW();
-- Marcar todas las reseñas existentes como aprobadas
UPDATE resenas SET aprobada = true WHERE aprobada IS NULL;
`

export const SQL_SCHEMA = `
-- Ejecutar en Supabase SQL Editor

CREATE TABLE habitaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(50),
  capacidad INTEGER,
  precio_por_noche DECIMAL(10,2),
  imagenes TEXT[],
  amenidades TEXT[],
  disponible BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  telefono VARCHAR(20),
  whatsapp VARCHAR(20),
  pais VARCHAR(80),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reservas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  cliente_id UUID REFERENCES clientes(id),
  habitacion_id UUID REFERENCES habitaciones(id),
  fecha_checkin DATE NOT NULL,
  fecha_checkout DATE NOT NULL,
  num_huespedes INTEGER,
  noches INTEGER,
  precio_total DECIMAL(10,2),
  estado VARCHAR(30) DEFAULT 'pendiente',
  whatsapp_enviado BOOLEAN DEFAULT false,
  email_enviado BOOLEAN DEFAULT false,
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE pagos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reserva_id UUID REFERENCES reservas(id),
  monto DECIMAL(10,2),
  moneda VARCHAR(10) DEFAULT 'PEN',
  metodo VARCHAR(50),
  estado VARCHAR(30),
  referencia_externa VARCHAR(200),
  comprobante_url TEXT,
  fecha_pago TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE bloqueos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habitacion_id UUID REFERENCES habitaciones(id),
  fecha_inicio DATE,
  fecha_fin DATE,
  motivo TEXT
);
`
