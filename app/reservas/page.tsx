'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Check, ChevronRight, Loader2, Upload, Copy, Tag, X } from 'lucide-react'
import { HABITACIONES_DATA, HOTEL, BANCO } from '@/lib/constants'
import { formatearPrecio, calcularNoches, formatearFecha, generarCodigoReserva, calcularPrecioPorHuespedes } from '@/lib/utils'
import type { MetodoPago } from '@/types'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { generarQRYapeUrl } from '@/lib/yape'

const schemaCliente = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres'),
  apellido: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  whatsapp: z.string().min(9, 'Número inválido'),
  pais: z.string().min(2, 'Requerido'),
  notas: z.string().optional(),
  terminos: z.boolean().refine((v) => v === true, 'Debes aceptar los términos'),
})

type SchemaCliente = z.infer<typeof schemaCliente>

function ReservasContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('yape')
  const [datosCliente, setDatosCliente] = useState<SchemaCliente | null>(null)
  const [copiado, setCopiado] = useState<string | null>(null)
  const [comprobante, setComprobante] = useState<File | null>(null)
  const [numOperacion, setNumOperacion] = useState('')
  const [yapeNumero, setYapeNumero] = useState('')
  const [cuponInput, setCuponInput] = useState('')
  const [cuponAplicado, setCuponAplicado] = useState<{ codigo: string; descuento: number } | null>(null)
  const [cuponLoading, setCuponLoading] = useState(false)
  const [cuponError, setCuponError] = useState('')
  const [yapeQrUrl, setYapeQrUrl] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/configuracion/yape-qr')
      .then(res => res.json())
      .then(data => setYapeQrUrl(data.url))
      .catch(() => {})
  }, [])

  const habitacionId = searchParams.get('habitacion_id') || HABITACIONES_DATA[0].id
  const checkin = searchParams.get('checkin') || ''
  const checkout = searchParams.get('checkout') || ''
  const numHuespedes = Number(searchParams.get('huespedes') || 2)

  const habitacion = HABITACIONES_DATA.find((h) => h.id === habitacionId) || HABITACIONES_DATA[0]
  const noches = checkin && checkout ? calcularNoches(checkin, checkout) : 2
  const precioPorNoche = calcularPrecioPorHuespedes(habitacion, numHuespedes)
  const total = precioPorNoche * Math.max(noches, 1)
  const totalConDescuento = Math.max(total - (cuponAplicado?.descuento ?? 0), 0)
  const codigoReserva = generarCodigoReserva()

  const aplicarCupon = async () => {
    setCuponError('')
    setCuponLoading(true)
    try {
      const res = await fetch('/api/cupones/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: cuponInput, total }),
      })
      const data = await res.json()
      if (data.valido) {
        setCuponAplicado({ codigo: cuponInput.trim().toUpperCase(), descuento: data.descuento })
      } else {
        setCuponAplicado(null)
        setCuponError(data.mensaje || 'Cupón no válido.')
      }
    } catch {
      setCuponError('No se pudo validar el cupón. Intenta de nuevo.')
    } finally {
      setCuponLoading(false)
    }
  }

  const quitarCupon = () => {
    setCuponAplicado(null)
    setCuponInput('')
    setCuponError('')
  }

  const { register, handleSubmit, formState: { errors } } = useForm<SchemaCliente>({
    resolver: zodResolver(schemaCliente),
    defaultValues: { terminos: false },
  })

  const copiar = (texto: string, key: string) => {
    navigator.clipboard.writeText(texto)
    setCopiado(key)
    setTimeout(() => setCopiado(null), 2000)
  }

  const onSubmitCliente = (data: SchemaCliente) => {
    setDatosCliente(data)
    setStep(3)
  }

  const procesarPago = async () => {
    if (!comprobante) {
      alert('Por favor sube el comprobante de pago.')
      return
    }
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('habitacion_id', habitacionId)
      formData.append('checkin', checkin)
      formData.append('checkout', checkout)
      formData.append('num_huespedes', String(numHuespedes))
      formData.append('noches', String(noches))
      formData.append('precio_total', String(total))
      formData.append('metodo_pago', metodoPago)
      formData.append('nombre', datosCliente?.nombre || '')
      formData.append('apellido', datosCliente?.apellido || '')
      formData.append('email', datosCliente?.email || '')
      formData.append('whatsapp', datosCliente?.whatsapp || '')
      formData.append('pais', datosCliente?.pais || '')
      formData.append('notas', datosCliente?.notas || '')
      if (numOperacion) formData.append('num_operacion', numOperacion)
      if (yapeNumero) formData.append('yape_numero', yapeNumero)
      if (comprobante) formData.append('comprobante', comprobante)
      if (cuponAplicado) formData.append('cupon_codigo', cuponAplicado.codigo)

      const res = await fetch('/api/reservas', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) {
        router.push(`/reservas/confirmacion?id=${data.reserva_id}&codigo=${data.codigo}`)
      } else {
        alert(data.error || 'Error al procesar la reserva.')
      }
    } catch {
      alert('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const pasos = [
    { num: 1, label: 'Resumen' },
    { num: 2, label: 'Tus datos' },
    { num: 3, label: 'Pago' },
  ]

  return (
    <div className="min-h-screen bg-warm pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 pt-8">
          <h1 className="font-display text-primary text-4xl font-bold mb-2">Reserva tu estadía</h1>
          <p className="text-ink/50">Completa los pasos para confirmar tu reserva en Hatuchay Inka</p>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center mb-10">
          {pasos.map((p, i) => (
            <div key={p.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  step > p.num ? 'bg-secondary text-white' :
                  step === p.num ? 'bg-primary text-white ring-4 ring-primary/20' :
                  'bg-warm-dark text-ink/40'
                }`}>
                  {step > p.num ? <Check size={16} /> : p.num}
                </div>
                <span className={`text-xs mt-1 font-medium ${step === p.num ? 'text-primary' : 'text-ink/40'}`}>
                  {p.label}
                </span>
              </div>
              {i < pasos.length - 1 && (
                <div className={`h-0.5 w-16 lg:w-24 mx-2 mb-4 transition-all ${step > p.num + 1 ? 'bg-secondary' : step > p.num ? 'bg-primary' : 'bg-warm-dark'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">

            {/* STEP 1: Summary */}
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-card p-6 space-y-5">
                <h2 className="font-display text-primary text-2xl font-bold">Resumen de tu reserva</h2>

                <div className="flex gap-4 items-start">
                  <div className="relative w-24 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    <Image src={habitacion.imagenes[0]} alt={habitacion.nombre} fill className="object-cover" sizes="96px" />
                  </div>
                  <div>
                    <p className="font-semibold text-primary text-lg">{habitacion.nombre}</p>
                    <p className="text-ink/50 text-sm capitalize">{habitacion.tipo}</p>
                  </div>
                </div>

                <div className="space-y-3 border-t border-warm-dark pt-4">
                  {[
                    { label: 'Check-in', value: checkin ? formatearFecha(checkin) : 'No especificado' },
                    { label: 'Check-out', value: checkout ? formatearFecha(checkout) : 'No especificado' },
                    { label: 'Noches', value: `${noches} noches` },
                    { label: 'Huéspedes', value: `${numHuespedes} persona(s)` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-ink/50">{label}</span>
                      <span className="font-medium text-ink">{value}</span>
                    </div>
                  ))}
                </div>

                <button onClick={() => setStep(2)} className="w-full btn-secondary rounded-xl flex items-center justify-center gap-2 py-4 text-base">
                  Continuar <ChevronRight size={18} />
                </button>
              </div>
            )}

            {/* STEP 2: Client data */}
            {step === 2 && (
              <form onSubmit={handleSubmit(onSubmitCliente)} className="bg-white rounded-2xl shadow-card p-6 space-y-5">
                <h2 className="font-display text-primary text-2xl font-bold">Tus datos personales</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-hotel">Nombre *</label>
                    <input {...register('nombre')} className="input-hotel" placeholder="Juan" />
                    {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
                  </div>
                  <div>
                    <label className="label-hotel">Apellido *</label>
                    <input {...register('apellido')} className="input-hotel" placeholder="Pérez" />
                    {errors.apellido && <p className="text-red-500 text-xs mt-1">{errors.apellido.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="label-hotel">Email *</label>
                  <input {...register('email')} type="email" className="input-hotel" placeholder="juan@email.com" />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="label-hotel">WhatsApp *</label>
                  <div className="flex gap-2">
                    <select className="input-hotel w-28">
                      <option value="+51">🇵🇪 +51</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+55">🇧🇷 +55</option>
                      <option value="+57">🇨🇴 +57</option>
                      <option value="+56">🇨🇱 +56</option>
                      <option value="+34">🇪🇸 +34</option>
                    </select>
                    <input {...register('whatsapp')} className="input-hotel flex-1" placeholder="999 999 999" />
                  </div>
                  {errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp.message}</p>}
                </div>

                <div>
                  <label className="label-hotel">País de procedencia *</label>
                  <input {...register('pais')} className="input-hotel" placeholder="Perú" />
                  {errors.pais && <p className="text-red-500 text-xs mt-1">{errors.pais.message}</p>}
                </div>

                <div>
                  <label className="label-hotel">Notas adicionales</label>
                  <textarea {...register('notas')} className="input-hotel" rows={3} placeholder="Hora de llegada estimada, peticiones especiales..." />
                </div>

                <div className="flex items-start gap-3">
                  <input type="checkbox" {...register('terminos')} id="terminos" className="mt-1 accent-primary w-4 h-4" />
                  <label htmlFor="terminos" className="text-sm text-ink/70">
                    Acepto los <a href="#" className="text-primary underline">términos y condiciones</a> y la <a href="#" className="text-primary underline">política de cancelación</a>
                  </label>
                </div>
                {errors.terminos && <p className="text-red-500 text-xs">{errors.terminos.message}</p>}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(1)} className="btn-outline rounded-xl flex-1 py-3">
                    ← Atrás
                  </button>
                  <button type="submit" className="btn-secondary rounded-xl flex-1 flex items-center justify-center gap-2 py-3">
                    Continuar al pago <ChevronRight size={18} />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Payment */}
            {step === 3 && (
              <div className="space-y-5">
                {/* Method selector */}
                <div className="bg-white rounded-2xl shadow-card p-6">
                  <h2 className="font-display text-primary text-2xl font-bold mb-5">Método de pago</h2>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {[
                      { id: 'yape' as MetodoPago, label: 'Yape', icon: '📱', sub: 'QR dinámico' },
                      { id: 'transferencia_bancaria' as MetodoPago, label: 'Transferencia', icon: '🏦', sub: 'BCP · BBVA' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setMetodoPago(m.id)}
                        className={`p-2 sm:p-4 rounded-xl border-2 text-center transition-all ${
                          metodoPago === m.id
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-warm-dark hover:border-primary/40'
                        }`}
                      >
                        <span className="text-xl sm:text-2xl">{m.icon}</span>
                        <p className="font-semibold text-primary text-xs sm:text-sm mt-1">{m.label}</p>
                        <p className="text-ink/40 text-[10px] sm:text-xs">{m.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cupón de descuento */}
                <div className="bg-white rounded-2xl shadow-card p-6">
                  <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                    <Tag size={16} /> Cupón de descuento
                  </h3>
                  {cuponAplicado ? (
                    <div className="flex items-center justify-between gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-green-600" />
                        <span className="text-sm font-semibold text-green-700">{cuponAplicado.codigo} aplicado — ahorras {formatearPrecio(cuponAplicado.descuento)}</span>
                      </div>
                      <button onClick={quitarCupon} className="text-green-700/60 hover:text-green-800 transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={cuponInput}
                        onChange={(e) => setCuponInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && aplicarCupon()}
                        placeholder="Ingresa tu código"
                        className="input-hotel flex-1"
                      />
                      <button
                        onClick={aplicarCupon}
                        disabled={cuponLoading || !cuponInput.trim()}
                        className="btn-outline rounded-xl px-5 disabled:opacity-50 whitespace-nowrap"
                      >
                        {cuponLoading ? <Loader2 size={16} className="animate-spin" /> : 'Aplicar'}
                      </button>
                    </div>
                  )}
                  {cuponError && <p className="text-red-500 text-xs mt-2">{cuponError}</p>}
                </div>

                {/* Yape */}
                {metodoPago === 'yape' && (
                  <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
                    <h3 className="font-semibold text-primary flex items-center gap-2">
                      📱 Pago con Yape
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-6 items-center">
                      <div className="flex-shrink-0 text-center">
                        <div className="w-40 h-40 bg-warm rounded-xl flex items-center justify-center mx-auto mb-2 border border-warm-dark overflow-hidden">
                          <Image
                            src={yapeQrUrl || generarQRYapeUrl(totalConDescuento, codigoReserva)}
                            alt="QR Yape"
                            width={200}
                            height={200}
                            className={yapeQrUrl ? 'w-full h-full object-contain p-2' : 'w-full h-full object-cover'}
                            unoptimized
                          />
                        </div>
                        <p className="text-ink/50 text-xs">Escanea con tu app Yape</p>
                      </div>
                      <div className="flex-1 space-y-3">
                        {[
                          { label: 'Número Yape', value: HOTEL.whatsapp },
                          { label: 'Titular', value: 'Hatuchay Inka Apart Hotel' },
                          { label: 'Monto', value: formatearPrecio(totalConDescuento) },
                          { label: 'Concepto', value: codigoReserva },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex items-center justify-between gap-2 bg-warm rounded-lg px-3 py-2">
                            <div>
                              <p className="text-ink/40 text-xs">{label}</p>
                              <p className="font-semibold text-sm text-ink">{value}</p>
                            </div>
                            <button onClick={() => copiar(value, label)} className="text-primary hover:text-secondary transition-colors">
                              {copiado === label ? <Check size={15} /> : <Copy size={15} />}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label-hotel">Tu número Yape</label>
                        <input value={yapeNumero} onChange={(e) => setYapeNumero(e.target.value)} className="input-hotel" placeholder="+51 999 999 999" />
                      </div>
                      <div>
                        <label className="label-hotel">Número de operación</label>
                        <input value={numOperacion} onChange={(e) => setNumOperacion(e.target.value)} className="input-hotel" placeholder="Ej: 1234567890" />
                      </div>
                    </div>
                    <div>
                      <label className="label-hotel">Captura del comprobante *</label>
                      <label className="flex flex-col items-center gap-2 border-2 border-dashed border-warm-dark hover:border-primary rounded-xl p-5 cursor-pointer transition-colors mt-1">
                        <Upload size={24} className="text-ink/40" />
                        <span className="text-sm text-ink/60">{comprobante ? comprobante.name : 'Haz clic para subir (JPG, PNG, PDF — máx 5MB)'}</span>
                        <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setComprobante(e.target.files?.[0] || null)} />
                      </label>
                    </div>
                  </div>
                )}

                {/* Transferencia */}
                {metodoPago === 'transferencia_bancaria' && (
                  <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
                    <h3 className="font-semibold text-primary flex items-center gap-2">
                      🏦 Transferencia Bancaria
                    </h3>
                    <p className="text-ink/60 text-sm">Realiza la transferencia a la siguiente cuenta y sube el comprobante:</p>
                    <div className="space-y-2">
                      {[
                        { label: 'Banco', value: BANCO.nombre },
                        { label: 'Cuenta en Soles', value: BANCO.cuentaSoles },
                        { label: 'CCI', value: BANCO.cci },
                        { label: 'Titular', value: BANCO.titular },
                        { label: 'RUC', value: BANCO.ruc },
                        { label: 'Monto', value: formatearPrecio(totalConDescuento) },
                        { label: 'Concepto', value: `Reserva ${codigoReserva}` },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between gap-2 bg-warm rounded-lg px-3 py-2.5">
                          <div>
                            <p className="text-ink/40 text-xs">{label}</p>
                            <p className="font-semibold text-sm text-ink">{value}</p>
                          </div>
                          <button onClick={() => copiar(value, label)} className="text-primary hover:text-secondary transition-colors">
                            {copiado === label ? <Check size={15} /> : <Copy size={15} />}
                          </button>
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="label-hotel">Número de operación</label>
                      <input value={numOperacion} onChange={(e) => setNumOperacion(e.target.value)} className="input-hotel" placeholder="Número de la transacción" />
                    </div>
                    <div>
                      <label className="label-hotel">Comprobante / Voucher *</label>
                      <label className="flex flex-col items-center gap-2 border-2 border-dashed border-warm-dark hover:border-primary rounded-xl p-5 cursor-pointer transition-colors mt-1">
                        <Upload size={24} className="text-ink/40" />
                        <span className="text-sm text-ink/60">{comprobante ? comprobante.name : 'Sube tu voucher (JPG, PNG, PDF — máx 5MB)'}</span>
                        <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setComprobante(e.target.files?.[0] || null)} />
                      </label>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="btn-outline rounded-xl px-6 py-4">
                    ← Atrás
                  </button>
                  <button
                    onClick={procesarPago}
                    disabled={loading}
                    className="flex-1 btn-secondary rounded-xl flex items-center justify-center gap-2 py-4 text-base"
                  >
                    {loading ? (
                      <><Loader2 size={20} className="animate-spin" /> Procesando...</>
                    ) : (
                      <>Ya realicé el pago <ChevronRight size={18} /></>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Summary sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-card p-5 sticky top-24">
              <h3 className="font-semibold text-primary text-sm tracking-wide uppercase mb-4">Tu reserva</h3>
              <div className="relative h-36 rounded-xl overflow-hidden mb-4">
                <Image src={habitacion.imagenes[0]} alt="" fill className="object-cover" sizes="300px" />
              </div>
              <p className="font-display text-primary font-bold text-lg">{habitacion.nombre}</p>
              <p className="text-ink/50 text-xs capitalize mb-4">{habitacion.tipo}</p>
              <div className="space-y-2 text-sm">
                {checkin && <div className="flex justify-between"><span className="text-ink/50">Check-in</span><span className="font-medium">{formatearFecha(checkin)}</span></div>}
                {checkout && <div className="flex justify-between"><span className="text-ink/50">Check-out</span><span className="font-medium">{formatearFecha(checkout)}</span></div>}
                <div className="flex justify-between"><span className="text-ink/50">Noches</span><span className="font-medium">{noches}</span></div>
                <div className="flex justify-between"><span className="text-ink/50">Huéspedes</span><span className="font-medium">{numHuespedes}</span></div>
              </div>
              <div className="border-t border-warm-dark mt-4 pt-4">
                {cuponAplicado && (
                  <>
                    <div className="flex justify-between items-center text-sm mb-1.5">
                      <span className="text-ink/50">Subtotal</span>
                      <span className="text-ink/50 line-through">{formatearPrecio(total)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mb-1.5">
                      <span className="text-green-600">Cupón {cuponAplicado.codigo}</span>
                      <span className="text-green-600 font-medium">-{formatearPrecio(cuponAplicado.descuento)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-primary">Total</span>
                  <span className="font-display text-2xl font-bold text-primary">{formatearPrecio(totalConDescuento)}</span>
                </div>
                <p className="text-ink/40 text-xs mt-1">Impuestos incluidos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ReservasPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
      <ReservasContent />
    </Suspense>
  )
}
