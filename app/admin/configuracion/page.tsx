'use client'

import { useState } from 'react'
import { HOTEL, BANCO, HABITACIONES_DATA } from '@/lib/constants'
import { supabase } from '@/lib/supabase'
import { Save, CheckCircle, Phone, Mail, Building2, BedDouble, Info } from 'lucide-react'

interface PrecioEdit {
  id: string
  nombre: string
  precio: number
  precioEdit: string
}

function SectionCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
      <h2 className="font-semibold text-primary flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
        <Icon size={16} className="text-secondary" /> {title}
      </h2>
      {children}
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-ink/35 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm font-medium text-ink bg-[#f4f3f0] px-3.5 py-2.5 rounded-xl">{value}</p>
    </div>
  )
}

export default function ConfiguracionPage() {
  // Hotel contact (editable)
  const [telefono, setTelefono] = useState(HOTEL.telefono)
  const [whatsapp, setWhatsapp] = useState(HOTEL.whatsapp)
  const [email, setEmail] = useState(HOTEL.email)
  const [savingContacto, setSavingContacto] = useState(false)
  const [savedContacto, setSavedContacto] = useState(false)

  // Bank info (editable)
  const [cuentaSoles, setCuentaSoles] = useState(BANCO.cuentaSoles)
  const [cuentaDolares, setCuentaDolares] = useState(BANCO.cuentaDolares)
  const [cci, setCci] = useState(BANCO.cci)
  const [savingBanco, setSavingBanco] = useState(false)
  const [savedBanco, setSavedBanco] = useState(false)

  // Room prices (editable)
  const [precios, setPrecios] = useState<PrecioEdit[]>(
    HABITACIONES_DATA.map(h => ({ id: h.id, nombre: h.nombre, precio: h.precio_por_noche, precioEdit: String(h.precio_por_noche) }))
  )
  const [savingPrecios, setSavingPrecios] = useState(false)
  const [savedPrecios, setSavedPrecios] = useState(false)

  const saveContacto = async () => {
    setSavingContacto(true)
    await supabase.from('configuracion').upsert([
      { clave: 'telefono', valor: telefono },
      { clave: 'whatsapp', valor: whatsapp },
      { clave: 'email', valor: email },
    ], { onConflict: 'clave' })
    setSavingContacto(false)
    setSavedContacto(true)
    setTimeout(() => setSavedContacto(false), 3000)
  }

  const saveBanco = async () => {
    setSavingBanco(true)
    await supabase.from('configuracion').upsert([
      { clave: 'banco_cuenta_soles', valor: cuentaSoles },
      { clave: 'banco_cuenta_dolares', valor: cuentaDolares },
      { clave: 'banco_cci', valor: cci },
    ], { onConflict: 'clave' })
    setSavingBanco(false)
    setSavedBanco(true)
    setTimeout(() => setSavedBanco(false), 3000)
  }

  const savePrecios = async () => {
    setSavingPrecios(true)
    const upserts = precios.map(p => ({
      clave: `precio_hab_${p.id}`,
      valor: p.precioEdit,
    }))
    await supabase.from('configuracion').upsert(upserts, { onConflict: 'clave' })
    setSavingPrecios(false)
    setSavedPrecios(true)
    setTimeout(() => setSavedPrecios(false), 3000)
  }

  const SaveButton = ({ saving, saved, onClick }: { saving: boolean; saved: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      disabled={saving}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 ${
        saved ? 'bg-green-500 text-white' : 'bg-primary hover:bg-primary/90 text-white'
      }`}
    >
      {saved ? <><CheckCircle size={15} /> Guardado</> : saving ? 'Guardando...' : <><Save size={15} /> Guardar cambios</>}
    </button>
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Configuración</h1>
        <p className="text-ink/40 text-sm mt-0.5">Gestiona la información del hotel y precios</p>
      </div>

      {/* Info note */}
      <div className="flex gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-sm text-blue-700">
        <Info size={16} className="flex-shrink-0 mt-0.5" />
        <p>Los cambios guardados aquí quedan registrados en la base de datos. Para que se reflejen completamente en el sitio, puede ser necesario actualizar también el archivo <code className="font-mono bg-blue-100 px-1 rounded">lib/constants.ts</code>.</p>
      </div>

      <div className="space-y-5">
        {/* Contact info */}
        <SectionCard icon={Phone} title="Información de contacto">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">Teléfono</label>
              <input
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">WhatsApp (sin espacios)</label>
              <input
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">Email de reservas</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9]"
              />
            </div>
            <div className="pt-1 flex justify-end">
              <SaveButton saving={savingContacto} saved={savedContacto} onClick={saveContacto} />
            </div>
          </div>
        </SectionCard>

        {/* Room prices */}
        <SectionCard icon={BedDouble} title="Precios por habitación (S/ por noche)">
          <div className="space-y-3">
            {precios.map((p, i) => (
              <div key={p.id} className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{p.nombre}</p>
                  <p className="text-xs text-ink/35">Hab. {p.id}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm text-ink/40 font-medium">S/</span>
                  <input
                    type="number"
                    value={p.precioEdit}
                    onChange={e => {
                      const updated = [...precios]
                      updated[i] = { ...updated[i], precioEdit: e.target.value }
                      setPrecios(updated)
                    }}
                    className="w-24 px-3 py-2 border border-gray-200 rounded-xl text-sm text-right focus:outline-none focus:border-secondary bg-[#fafaf9] font-semibold"
                  />
                  <span className="text-xs text-ink/35">/noche</span>
                </div>
              </div>
            ))}
            <div className="pt-2 flex justify-end border-t border-gray-100">
              <SaveButton saving={savingPrecios} saved={savedPrecios} onClick={savePrecios} />
            </div>
          </div>
        </SectionCard>

        {/* Bank info */}
        <SectionCard icon={Building2} title="Datos bancarios (BCP)">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">Cuenta en Soles</label>
              <input
                value={cuentaSoles}
                onChange={e => setCuentaSoles(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9] font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">Cuenta en Dólares</label>
              <input
                value={cuentaDolares}
                onChange={e => setCuentaDolares(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9] font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1.5 block">CCI</label>
              <input
                value={cci}
                onChange={e => setCci(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-secondary bg-[#fafaf9] font-mono"
              />
            </div>
            <div className="pt-1 flex justify-end">
              <SaveButton saving={savingBanco} saved={savedBanco} onClick={saveBanco} />
            </div>
          </div>
        </SectionCard>

        {/* Static info (read-only) */}
        <SectionCard icon={Mail} title="Información general del hotel">
          <div className="grid sm:grid-cols-2 gap-3">
            <InfoField label="Nombre del hotel" value={HOTEL.nombre} />
            <InfoField label="RUC" value={HOTEL.ruc} />
            <InfoField label="Dirección" value={HOTEL.direccion} />
            <InfoField label="Check-in / Check-out" value={`${HOTEL.checkIn} / ${HOTEL.checkOut}`} />
            <InfoField label="Titular de la cuenta" value={BANCO.titular} />
            <InfoField label="Banco" value={BANCO.nombre} />
          </div>
          <p className="text-xs text-ink/35 mt-4">Estos datos son fijos. Para modificarlos contacte al desarrollador.</p>
        </SectionCard>
      </div>
    </div>
  )
}
