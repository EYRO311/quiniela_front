'use client'

import { useEffect, useState, useCallback } from 'react'
import AppSidebar from '@/app/components/layout/appSidebar'
import { getF1Pilotos, getF1Carreras } from '@/services/f1.service'
import { getUsuarioInfo } from '@/services/usuario.service'

const API_URL = process.env.NEXT_PUBLIC_API_URL

/* ── Types ── */
interface Piloto {
  id_piloto: number
  nombre: string
  numero: number | null
  pais: string | null
  f1_piloto_escuderia: { rol: string; f1_escuderias: { nombre: string; color: string | null } | null }[]
}

interface Carrera {
  id_carrera: number
  nombre_gp: string
  circuito: string | null
  pais: string | null
  ciudad: string | null
  fecha_carrera: string
  estado: 'pendiente' | 'en_vivo' | 'finalizada' | 'cancelada'
}

interface Quiniela {
  id_quiniela: string
  nombre: string
  estado: string
}

interface Pronostico {
  id_pronostico_f1: number
  id_carrera: number
  pred_piloto_p1: number
  pred_piloto_p2: number | null
  pred_piloto_p3: number | null
  pred_pole: number | null
  pred_vuelta_rapida: number | null
  puntos: number
}

interface Props { idUsuario: string }

/* ── Helpers ── */
const ESTADO_CFG = {
  pendiente:  { label: 'Próxima',    color: '#60A5FA' },
  en_vivo:    { label: 'En Vivo',    color: '#EF4444' },
  finalizada: { label: 'Finalizada', color: '#4ADE80' },
  cancelada:  { label: 'Cancelada',  color: '#6B7280' }
}

function fmtFecha (iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
}

/* ── Selector de piloto ── */
function PilotSelect ({
  label, value, onChange, pilotos, accentColor, disabled
}: {
  label: string; value: string; onChange: (v: string) => void
  pilotos: Piloto[]; accentColor: string; disabled?: boolean
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: accentColor }}>
        {label}
      </p>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className="w-full text-sm font-semibold rounded-xl px-3 py-2 focus:outline-none transition-all"
        style={{
          background: '#060E1E',
          color: value ? 'white' : '#4B5563',
          border: `1px solid ${value ? accentColor + '66' : 'rgba(255,255,255,0.08)'}`,
          appearance: 'none',
          opacity: disabled ? 0.5 : 1
        }}
      >
        <option value="" style={{ background: '#0D1B2A' }}>— Sin selección —</option>
        {pilotos.map(p => {
          const eq = p.f1_piloto_escuderia?.[0]?.f1_escuderias
          return (
            <option key={p.id_piloto} value={p.id_piloto} style={{ background: '#0D1B2A' }}>
              #{p.numero ?? '—'} {p.nombre}{eq ? ` · ${eq.nombre}` : ''}
            </option>
          )
        })}
      </select>
    </div>
  )
}

/* ── Tarjeta de carrera ── */
function CarreraCard ({
  carrera, pilotos, pronostico, idQuiniela, idUsuario, onSaved
}: {
  carrera: Carrera
  pilotos: Piloto[]
  pronostico: Pronostico | undefined
  idQuiniela: string
  idUsuario: string
  onSaved: (p: Pronostico) => void
}) {
  const editable = carrera.estado === 'pendiente' && new Date(carrera.fecha_carrera) > new Date()
  const cfg = ESTADO_CFG[carrera.estado] ?? ESTADO_CFG.pendiente

  const [p1, setP1] = useState(String(pronostico?.pred_piloto_p1 ?? ''))
  const [p2, setP2] = useState(String(pronostico?.pred_piloto_p2 ?? ''))
  const [p3, setP3] = useState(String(pronostico?.pred_piloto_p3 ?? ''))
  const [pole, setPole] = useState(String(pronostico?.pred_pole ?? ''))
  const [vr, setVr] = useState(String(pronostico?.pred_vuelta_rapida ?? ''))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const pilotName = (id: number | null | undefined) => {
    if (!id) return '—'
    const p = pilotos.find(x => x.id_piloto === id)
    return p ? `#${p.numero ?? '?'} ${p.nombre}` : '—'
  }

  const handleSave = async () => {
    if (!p1) { setError('El piloto P1 es obligatorio'); return }
    setSaving(true); setError('')
    try {
      const res = await fetch(`${API_URL}/f1/pronosticos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idPronostico: pronostico?.id_pronostico_f1 ?? null,
          idQuiniela,
          idUsuario,
          idCarrera: carrera.id_carrera,
          p1, p2: p2 || null, p3: p3 || null,
          pole: pole || null, vueltaRapida: vr || null
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onSaved(data.pronostico)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all"
      style={{
        background: '#1e1e2e',
        border: `1px solid ${cfg.color}33`,
        opacity: carrera.estado === 'cancelada' ? 0.5 : 1
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cfg.color }} />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm truncate">{carrera.nombre_gp}</p>
          <p className="text-xs" style={{ color: '#6B7280' }}>
            {[carrera.circuito, carrera.ciudad, carrera.pais].filter(Boolean).join(' · ')}
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}33` }}>
            {cfg.label}
          </span>
          <p className="text-[10px] mt-0.5" style={{ color: '#4B5563' }}>{fmtFecha(carrera.fecha_carrera)}</p>
        </div>
        {pronostico && (
          <div className="shrink-0 text-right ml-2">
            <p className="text-lg font-black" style={{ color: '#D4AF37' }}>{pronostico.puntos}</p>
            <p className="text-[9px] uppercase tracking-wider" style={{ color: '#6B7280' }}>pts</p>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        {/* Banner cerrado */}
        {!editable && carrera.estado === 'pendiente' && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl mb-3 text-xs font-semibold"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.2)' }}>
            🔒 Pronósticos cerrados — la carrera ya ha iniciado
          </div>
        )}

        {editable ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <PilotSelect label="🥇 P1 (obligatorio)" value={p1} onChange={setP1} pilotos={pilotos} accentColor="#D4AF37" />
              <PilotSelect label="🥈 P2" value={p2} onChange={setP2} pilotos={pilotos} accentColor="#9CA3AF" />
              <PilotSelect label="🥉 P3" value={p3} onChange={setP3} pilotos={pilotos} accentColor="#CD7F32" />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <PilotSelect label="⚡ Pole Position" value={pole} onChange={setPole} pilotos={pilotos} accentColor="#A855F7" />
              <PilotSelect label="🔥 Vuelta Rápida" value={vr} onChange={setVr} pilotos={pilotos} accentColor="#E8002D" />
            </div>

            {error && <p className="text-xs rounded-xl px-3 py-2" style={{ background: 'rgba(239,68,68,0.1)', color: '#FCA5A5' }}>{error}</p>}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02]"
              style={{
                background: saved ? 'rgba(74,222,128,0.2)' : saving ? '#374151' : 'linear-gradient(135deg, #E8002D, #9B0018)',
                color: saved ? '#4ADE80' : 'white',
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              {saved ? '✓ Guardado' : saving ? 'Guardando...' : pronostico ? 'Actualizar pronóstico' : 'Guardar pronóstico'}
            </button>
          </div>
        ) : (
          /* Solo lectura para carreras pasadas */
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
            {[
              { label: '🥇 P1', value: pilotName(pronostico?.pred_piloto_p1) },
              { label: '🥈 P2', value: pilotName(pronostico?.pred_piloto_p2) },
              { label: '🥉 P3', value: pilotName(pronostico?.pred_piloto_p3) },
              { label: '⚡ Pole', value: pilotName(pronostico?.pred_pole) },
              { label: '🔥 V. Rápida', value: pilotName(pronostico?.pred_vuelta_rapida) }
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: '#4B5563' }}>{label}</p>
                <p className="text-xs text-white">{pronostico ? value : <span style={{ color: '#4B5563' }}>Sin pronóstico</span>}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Main ── */
export default function F1PronosticosPage ({ idUsuario }: Props) {
  const [quinielas, setQuinielas] = useState<Quiniela[]>([])
  const [quinielaActiva, setQuinielaActiva] = useState('')
  const [pilotos, setPilotos] = useState<Piloto[]>([])
  const [carreras, setCarreras] = useState<Carrera[]>([])
  const [pronosticos, setPronosticos] = useState<Pronostico[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingProno, setLoadingProno] = useState(false)
  const [error, setError] = useState('')

  // Fetch base data
  useEffect(() => {
    Promise.allSettled([
      getUsuarioInfo(idUsuario),
      getF1Pilotos(),
      getF1Carreras()
    ]).then(([rU, rP, rC]) => {
      if (rU.status === 'fulfilled') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const qs = (rU.value as any).quinielas ?? []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped: Quiniela[] = qs.map((q: any) => ({ id_quiniela: q.quinielas?.id_quiniela, nombre: q.quinielas?.nombre, estado: q.quinielas?.estado })).filter((q: Quiniela) => q.id_quiniela)
        setQuinielas(mapped)
        if (mapped.length > 0) setQuinielaActiva(mapped[0].id_quiniela)
      }
      if (rP.status === 'fulfilled') setPilotos(rP.value.pilotos ?? [])
      if (rC.status === 'fulfilled') setCarreras(rC.value.carreras ?? [])
    }).catch(() => setError('Error al cargar datos'))
      .finally(() => setLoading(false))
  }, [idUsuario])

  // Fetch pronósticos cuando cambia la quiniela
  const fetchPronosticos = useCallback(async () => {
    if (!quinielaActiva) return
    setLoadingProno(true)
    try {
      const res = await fetch(`${API_URL}/f1/pronosticos?idUsuario=${idUsuario}&idQuiniela=${quinielaActiva}`)
      const data = await res.json()
      setPronosticos(data.pronosticos ?? [])
    } catch { /* silently fail */ }
    finally { setLoadingProno(false) }
  }, [quinielaActiva, idUsuario])

  useEffect(() => { fetchPronosticos() }, [fetchPronosticos])

  const handleSaved = (pronostico: Pronostico) => {
    setPronosticos(prev => {
      const idx = prev.findIndex(p => p.id_carrera === pronostico.id_carrera)
      if (idx >= 0) { const next = [...prev]; next[idx] = pronostico; return next }
      return [...prev, pronostico]
    })
  }

  const pronoMap = Object.fromEntries(pronosticos.map(p => [p.id_carrera, p]))
  const pendientes = carreras.filter(c => c.estado === 'pendiente' || c.estado === 'en_vivo')
  const pasadas = carreras.filter(c => c.estado === 'finalizada' || c.estado === 'cancelada')
  const puntosTotal = pronosticos.reduce((sum, p) => sum + (p.puntos ?? 0), 0)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#15151E' }}>
        <div className="text-center space-y-3">
          <div className="text-5xl animate-pulse">🏎️</div>
          <p className="text-sm font-medium tracking-widest uppercase" style={{ color: '#E8002D' }}>Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#15151E' }}>
      <AppSidebar />
      <main className="flex-1 px-4 pt-20 pb-10 md:py-6 sm:px-6 lg:px-8 overflow-auto">
        <div className="mx-auto max-w-4xl space-y-6">

          {/* Header */}
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Pronósticos F1</h1>
              <p className="text-sm mt-1" style={{ color: '#E8002D' }}>Temporada 2026 · Predice y gana puntos</p>
            </div>
            <div className="ml-auto text-center">
              <p className="text-3xl font-black" style={{ color: '#D4AF37' }}>{puntosTotal}</p>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: '#6B7280' }}>mis puntos</p>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Sin quinielas */}
          {quinielas.length === 0 && !error && (
            <div className="rounded-2xl p-10 text-center" style={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-4xl mb-3">🏆</p>
              <p className="text-white font-bold">No estás en ninguna quiniela</p>
              <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Crea o únete a una quiniela desde el Inicio para poder hacer pronósticos</p>
            </div>
          )}

          {quinielas.length > 0 && (
            <>
              {/* Selector de quiniela */}
              {quinielas.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {quinielas.map(q => (
                    <button
                      key={q.id_quiniela}
                      onClick={() => setQuinielaActiva(q.id_quiniela)}
                      className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                      style={quinielaActiva === q.id_quiniela
                        ? { background: 'linear-gradient(135deg, #E8002D, #9B0018)', color: 'white' }
                        : { background: '#1e1e2e', color: '#6B7280', border: '1px solid rgba(255,255,255,0.08)' }
                      }
                    >
                      🏆 {q.nombre}
                    </button>
                  ))}
                </div>
              )}

              {loadingProno ? (
                <div className="text-center py-10">
                  <div className="text-3xl animate-pulse">⏳</div>
                </div>
              ) : (
                <div className="space-y-8">

                  {/* Próximas carreras */}
                  {pendientes.length > 0 && (
                    <section className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-5 rounded-full" style={{ background: '#E8002D' }} />
                        <h2 className="text-base font-black text-white">Próximas carreras</h2>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(232,0,45,0.15)', color: '#E8002D' }}>{pendientes.length}</span>
                      </div>
                      {pendientes.map(c => (
                        <CarreraCard
                          key={c.id_carrera}
                          carrera={c}
                          pilotos={pilotos}
                          pronostico={pronoMap[c.id_carrera]}
                          idQuiniela={quinielaActiva}
                          idUsuario={idUsuario}
                          onSaved={handleSaved}
                        />
                      ))}
                    </section>
                  )}

                  {/* Carreras pasadas */}
                  {pasadas.length > 0 && (
                    <section className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-5 rounded-full" style={{ background: '#4ADE80' }} />
                        <h2 className="text-base font-black text-white">Historial</h2>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(74,222,128,0.1)', color: '#4ADE80' }}>{pasadas.length}</span>
                      </div>
                      {[...pasadas].reverse().map(c => (
                        <CarreraCard
                          key={c.id_carrera}
                          carrera={c}
                          pilotos={pilotos}
                          pronostico={pronoMap[c.id_carrera]}
                          idQuiniela={quinielaActiva}
                          idUsuario={idUsuario}
                          onSaved={handleSaved}
                        />
                      ))}
                    </section>
                  )}

                  {pendientes.length === 0 && pasadas.length === 0 && (
                    <div className="rounded-2xl p-10 text-center" style={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <p className="text-4xl mb-3">📅</p>
                      <p className="text-white font-bold">No hay carreras cargadas</p>
                      <p className="text-sm mt-1" style={{ color: '#6B7280' }}>El calendario se mostrará aquí una vez que se carguen las carreras</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
