'use client'

import { useEffect, useState } from 'react'
import AppSidebar from '@/app/components/layout/appSidebar'
import { getF1Pilotos, getF1Escuderias, getF1Carreras, getF1Campeonato } from '@/services/f1.service'

/* ── Types ── */

interface EscuderiaRef {
  id_escuderia: number
  nombre: string
  color: string | null
  pais: string | null
}

interface PilotoEscuderiaRef {
  rol: string
  temporada: number
  activo: number
  f1_escuderias: EscuderiaRef | null
}

interface F1Piloto {
  id_piloto: number
  nombre: string
  numero: number | null
  pais: string | null
  activo: number
  f1_piloto_escuderia: PilotoEscuderiaRef[]
}

interface F1Escuderia {
  id_escuderia: number
  nombre: string
  pais: string | null
  color: string | null
  activo: number
}

interface F1Carrera {
  id_carrera: number
  nombre_gp: string
  circuito: string | null
  pais: string | null
  ciudad: string | null
  fecha_carrera: string
  estado: 'pendiente' | 'en_vivo' | 'finalizada' | 'cancelada'
}

interface CampeonatoItem {
  id_piloto_escuderia: number
  rol: string
  temporada: number
  f1_pilotos: { id_piloto: number; nombre: string; numero: number | null; pais: string | null } | null
  f1_escuderias: { id_escuderia: number; nombre: string; color: string | null } | null
}

type Tab = 'pilotos' | 'escuderias' | 'calendario' | 'campeonato'

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'pilotos', label: 'Pilotos', emoji: '🪖' },
  { id: 'escuderias', label: 'Escuderías', emoji: '🏎️' },
  { id: 'calendario', label: 'Calendario', emoji: '📅' },
  { id: 'campeonato', label: 'Campeonato', emoji: '🏆' }
]

const ESTADO_CFG = {
  pendiente:  { label: 'Próxima',    color: '#60A5FA', bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.25)' },
  en_vivo:    { label: 'En Vivo',    color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.25)' },
  finalizada: { label: 'Finalizada', color: '#4ADE80', bg: 'rgba(74,222,128,0.10)',  border: 'rgba(74,222,128,0.20)' },
  cancelada:  { label: 'Cancelada',  color: '#6B7280', bg: 'rgba(107,114,128,0.10)', border: 'rgba(107,114,128,0.20)' }
}

const ROL_CFG: Record<string, { label: string; color: string; bg: string }> = {
  titular:       { label: 'Titular',        color: '#4ADE80', bg: 'rgba(74,222,128,0.12)' },
  reserva:       { label: 'Reserva',        color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' },
  tercer_piloto: { label: 'Tercer Piloto',  color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  test:          { label: 'Test',           color: '#A855F7', bg: 'rgba(168,85,247,0.12)' },
  desarrollo:    { label: 'Desarrollo',     color: '#6B7280', bg: 'rgba(107,114,128,0.12)' }
}

/* ── Main component ── */

export default function F1Dashboard () {
  const [tab, setTab] = useState<Tab>('pilotos')
  const [pilotos, setPilotos] = useState<F1Piloto[]>([])
  const [escuderias, setEscuderias] = useState<F1Escuderia[]>([])
  const [carreras, setCarreras] = useState<F1Carrera[]>([])
  const [campeonato, setCampeonato] = useState<CampeonatoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [rP, rE, rC, rCamp] = await Promise.allSettled([
          getF1Pilotos(),
          getF1Escuderias(),
          getF1Carreras(),
          getF1Campeonato()
        ])
        if (rP.status === 'fulfilled') setPilotos(rP.value.pilotos ?? [])
        if (rE.status === 'fulfilled') setEscuderias(rE.value.escuderias ?? [])
        if (rC.status === 'fulfilled') setCarreras(rC.value.carreras ?? [])
        if (rCamp.status === 'fulfilled') setCampeonato(rCamp.value.pilotos ?? [])
      } catch {
        setError('Error al cargar datos de F1')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  return (
    <div className="flex min-h-screen" style={{ background: '#060E1E' }}>
      <AppSidebar />

      <main className="flex-1 px-4 pt-20 pb-6 md:py-6 sm:px-6 lg:px-8 overflow-auto">
        <div className="mx-auto max-w-6xl space-y-8">

          {/* Header */}
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Fórmula 1</h1>
              <p className="text-sm mt-1" style={{ color: '#E8002D' }}>
                Temporada 2026 · Pilotos · Escuderías · Campeonato
              </p>
            </div>
            <div className="ml-auto text-4xl">🏎️</div>
          </div>

          {/* Tabs */}
          <div
            className="flex gap-1 p-1 rounded-2xl"
            style={{ background: '#0D1B2A', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all"
                style={tab === t.id
                  ? { background: 'linear-gradient(135deg, rgba(232,0,45,0.25), rgba(13,27,42,0.8))', color: '#fff', border: '1px solid rgba(232,0,45,0.35)' }
                  : { color: '#4B5563', border: '1px solid transparent' }
                }
              >
                <span className="hidden sm:inline">{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>

          {loading && (
            <div className="flex justify-center py-20">
              <div className="text-center space-y-3">
                <div className="text-5xl animate-pulse">🏎️</div>
                <p className="text-sm tracking-widest uppercase" style={{ color: '#E8002D' }}>Cargando datos F1...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {tab === 'pilotos'    && <PilotosTab pilotos={pilotos} />}
              {tab === 'escuderias' && <EscuderiasTab escuderias={escuderias} pilotos={pilotos} />}
              {tab === 'calendario' && <CalendarioTab carreras={carreras} />}
              {tab === 'campeonato' && <CampeonatoTab campeonato={campeonato} />}
            </>
          )}

        </div>
      </main>
    </div>
  )
}

/* ── Tab: Pilotos ── */

function PilotosTab ({ pilotos }: { pilotos: F1Piloto[] }) {
  if (pilotos.length === 0) return <EmptyState emoji="🪖" texto="No hay pilotos registrados" subtexto="Los pilotos aparecerán aquí una vez que sean cargados" />

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {pilotos.map(p => {
        const asignacion = p.f1_piloto_escuderia?.[0]
        const equipo = asignacion?.f1_escuderias
        const teamColor = equipo?.color ?? '#4B5563'
        const rol = asignacion?.rol ?? ''
        const rolCfg = ROL_CFG[rol] ?? { label: rol, color: '#6B7280', bg: 'rgba(107,114,128,0.12)' }

        return (
          <div
            key={p.id_piloto}
            className="rounded-2xl overflow-hidden transition-all hover:scale-[1.01]"
            style={{ background: '#0D1B2A', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {/* Team color bar */}
            <div className="h-1.5 w-full" style={{ background: teamColor }} />

            <div className="p-4 space-y-3">
              {/* Number + name */}
              <div className="flex items-start gap-3">
                <div
                  className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black"
                  style={{ background: `${teamColor}22`, color: teamColor, border: `1px solid ${teamColor}44` }}
                >
                  {p.numero ?? '–'}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-white leading-tight truncate">{p.nombre}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{p.pais ?? '—'}</p>
                </div>
              </div>

              {/* Team + role */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: teamColor }} />
                  <span className="text-xs font-medium truncate" style={{ color: '#9CA3AF' }}>
                    {equipo?.nombre ?? 'Sin equipo'}
                  </span>
                </div>
                {rol && (
                  <span
                    className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: rolCfg.bg, color: rolCfg.color }}
                  >
                    {rolCfg.label}
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Tab: Escuderías ── */

function EscuderiasTab ({ escuderias, pilotos }: { escuderias: F1Escuderia[]; pilotos: F1Piloto[] }) {
  if (escuderias.length === 0) return <EmptyState emoji="🏎️" texto="No hay escuderías registradas" subtexto="Las escuderías aparecerán aquí una vez que sean cargadas" />

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {escuderias.map(e => {
        const teamColor = e.color ?? '#4B5563'
        const pilotosDelEquipo = pilotos.filter(p =>
          p.f1_piloto_escuderia?.some(pe => pe.f1_escuderias?.id_escuderia === e.id_escuderia && pe.rol === 'titular')
        )

        return (
          <div
            key={e.id_escuderia}
            className="rounded-2xl overflow-hidden transition-all hover:scale-[1.01]"
            style={{ background: '#0D1B2A', border: `1px solid ${teamColor}33` }}
          >
            {/* Color bar */}
            <div className="h-2 w-full" style={{ background: teamColor }} />

            <div className="p-5 space-y-4">
              {/* Name + country */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-white leading-tight">{e.nombre}</h3>
                  <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{e.pais ?? '—'}</p>
                </div>
                <div
                  className="w-10 h-10 rounded-xl shrink-0"
                  style={{ background: `${teamColor}22`, border: `2px solid ${teamColor}66` }}
                />
              </div>

              {/* Titulares */}
              {pilotosDelEquipo.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#4B5563' }}>Pilotos Titulares</p>
                  {pilotosDelEquipo.map(p => (
                    <div
                      key={p.id_piloto}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                      style={{ background: `${teamColor}0D` }}
                    >
                      <span className="text-xs font-black w-6 text-right shrink-0" style={{ color: teamColor }}>
                        {p.numero ?? '–'}
                      </span>
                      <span className="text-sm font-semibold text-white truncate">{p.nombre}</span>
                      <span className="ml-auto text-xs shrink-0" style={{ color: '#6B7280' }}>{p.pais ?? ''}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Tab: Calendario ── */

function CalendarioTab ({ carreras }: { carreras: F1Carrera[] }) {
  if (carreras.length === 0) return <EmptyState emoji="📅" texto="No hay carreras registradas" subtexto="El calendario aparecerá aquí una vez que sea cargado" />

  return (
    <div className="space-y-3">
      {carreras.map((c, idx) => {
        const cfg = ESTADO_CFG[c.estado] ?? ESTADO_CFG.pendiente
        const fecha = new Date(c.fecha_carrera)
        const fmtFecha = fecha.toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
        const fmtHora  = fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })

        return (
          <div
            key={c.id_carrera}
            className="flex items-center gap-4 rounded-2xl p-4 transition-all hover:scale-[1.005]"
            style={{ background: '#0D1B2A', border: `1px solid ${cfg.border}` }}
          >
            {/* Round number */}
            <div
              className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black"
              style={{ background: cfg.bg, color: cfg.color }}
            >
              {idx + 1}
            </div>

            {/* GP info */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white leading-tight truncate">{c.nombre_gp}</p>
              <p className="text-xs mt-0.5 truncate" style={{ color: '#6B7280' }}>
                {[c.circuito, c.ciudad, c.pais].filter(Boolean).join(' · ')}
              </p>
            </div>

            {/* Date + status */}
            <div className="shrink-0 text-right space-y-1">
              <span
                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
              >
                {c.estado === 'en_vivo' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />}
                {cfg.label}
              </span>
              <p className="text-[11px]" style={{ color: '#6B7280' }}>{fmtFecha}</p>
              <p className="text-[11px]" style={{ color: '#4B5563' }}>{fmtHora}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Tab: Campeonato ── */

function CampeonatoTab ({ campeonato }: { campeonato: CampeonatoItem[] }) {
  if (campeonato.length === 0) return <EmptyState emoji="🏆" texto="Sin datos de campeonato" subtexto="Los datos del campeonato aparecerán aquí una vez que se registren resultados" />

  // Agrupar por escudería para constructores
  const constructores = campeonato.reduce<Record<string, { nombre: string; color: string | null; pilotos: string[] }>>((acc, item) => {
    const esc = item.f1_escuderias
    if (!esc) return acc
    if (!acc[esc.id_escuderia]) acc[esc.id_escuderia] = { nombre: esc.nombre, color: esc.color, pilotos: [] }
    if (item.f1_pilotos) acc[esc.id_escuderia].pilotos.push(item.f1_pilotos.nombre)
    return acc
  }, {})

  return (
    <div className="space-y-8">

      {/* Pilotos */}
      <section>
        <div
          className="flex items-center gap-3 rounded-xl px-5 py-3 mb-4"
          style={{ background: 'rgba(232,0,45,0.08)', border: '1px solid rgba(232,0,45,0.25)' }}
        >
          <div className="w-2 h-6 rounded-full" style={{ background: '#E8002D' }} />
          <h2 className="text-lg font-black tracking-wide" style={{ color: '#E8002D' }}>
            CLASIFICACIÓN DE PILOTOS
          </h2>
          <span className="ml-auto text-xs font-medium" style={{ color: '#E8002D' }}>
            {campeonato.length} pilotos
          </span>
        </div>

        <div className="space-y-2">
          {campeonato.map((item, idx) => {
            const piloto = item.f1_pilotos
            const equipo = item.f1_escuderias
            const teamColor = equipo?.color ?? '#4B5563'
            if (!piloto) return null

            return (
              <div
                key={item.id_piloto_escuderia}
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: '#0D1B2A', border: `1px solid ${teamColor}33` }}
              >
                <span className="text-sm font-black w-6 text-center shrink-0" style={{ color: idx < 3 ? '#D4AF37' : '#4B5563' }}>
                  {idx + 1}
                </span>
                <div className="w-1 h-8 rounded-full shrink-0" style={{ background: teamColor }} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm leading-tight truncate">{piloto.nombre}</p>
                  <p className="text-xs" style={{ color: '#6B7280' }}>{equipo?.nombre ?? '—'}</p>
                </div>
                <span className="text-xs shrink-0" style={{ color: '#6B7280' }}>#{piloto.numero ?? '–'}</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* Constructores */}
      <section>
        <div
          className="flex items-center gap-3 rounded-xl px-5 py-3 mb-4"
          style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)' }}
        >
          <div className="w-2 h-6 rounded-full" style={{ background: '#D4AF37' }} />
          <h2 className="text-lg font-black tracking-wide" style={{ color: '#D4AF37' }}>
            CLASIFICACIÓN DE CONSTRUCTORES
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Object.entries(constructores).map(([id, c], idx) => {
            const teamColor = c.color ?? '#4B5563'
            return (
              <div
                key={id}
                className="flex items-center gap-3 rounded-xl overflow-hidden"
                style={{ background: '#0D1B2A', border: `1px solid ${teamColor}33` }}
              >
                <div className="w-2 self-stretch" style={{ background: teamColor }} />
                <div className="flex-1 py-3 pr-3 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black w-5 shrink-0" style={{ color: idx < 3 ? '#D4AF37' : '#4B5563' }}>
                      {idx + 1}
                    </span>
                    <p className="font-bold text-white text-sm truncate">{c.nombre}</p>
                  </div>
                  <p className="text-xs mt-0.5 pl-7 truncate" style={{ color: '#6B7280' }}>
                    {c.pilotos.join(' · ')}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

    </div>
  )
}

/* ── Shared empty state ── */

function EmptyState ({ emoji, texto, subtexto }: { emoji: string; texto: string; subtexto: string }) {
  return (
    <div
      className="rounded-2xl p-12 text-center"
      style={{ background: '#0D1B2A', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <p className="text-5xl mb-4">{emoji}</p>
      <p className="text-white font-semibold">{texto}</p>
      <p className="text-sm mt-1" style={{ color: '#6B7280' }}>{subtexto}</p>
    </div>
  )
}
