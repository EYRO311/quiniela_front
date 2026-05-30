'use client'

import { useEffect, useState } from 'react'
import AppSidebar from '@/app/components/layout/appSidebar'
import {
  getF1Pilotos, getF1Escuderias,
  getF1StandingsPilotos, getF1StandingsConstructores,
  getF1CalendarioAPI, getF1UltimoResultado
} from '@/services/f1.service'

/* ── Types ── */

interface EscuderiaRef { id_escuderia: number; nombre: string; color: string | null; pais: string | null }
interface PilotoEscuderiaRef { rol: string; temporada: number; activo: number; f1_escuderias: EscuderiaRef | null }
interface F1Piloto { id_piloto: number; nombre: string; numero: number | null; pais: string | null; activo: number; f1_piloto_escuderia: PilotoEscuderiaRef[] }
interface F1Escuderia { id_escuderia: number; nombre: string; pais: string | null; color: string | null; activo: number }

interface StandingPiloto {
  posicion: number; puntos: number; victorias: number
  piloto: { id: string; nombre: string; apellido: string; numero: string | null; pais: string; codigo: string | null }
  escuderia: { id: string | null; nombre: string; color: string | null }
}

interface StandingConstructor {
  posicion: number; puntos: number; victorias: number
  escuderia: { id: string; nombre: string; pais: string; color: string | null }
}

interface CarreraAPI {
  round: number; nombre_gp: string; circuito: string; pais: string; ciudad: string
  fecha_carrera: string; fecha_clasificacion: string | null; fecha_sprint: string | null
  estado: 'pendiente' | 'en_vivo' | 'finalizada' | 'cancelada'
}

interface ResultadoItem {
  posicion: number; codigo: string; piloto: string; numero: string | null
  escuderia: string; puntos: number; tiempo: string; vuelta_rapida: boolean; color: string | null
}

interface UltimoResultado {
  round: number; nombre_gp: string; circuito: string; pais: string; fecha: string
  resultados: ResultadoItem[]
}

type Tab = 'campeonato' | 'calendario' | 'pilotos' | 'escuderias'

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'campeonato', label: 'Campeonato', emoji: '🏆' },
  { id: 'calendario', label: 'Calendario', emoji: '📅' },
  { id: 'pilotos',    label: 'Pilotos',    emoji: '🪖' },
  { id: 'escuderias', label: 'Escuderías', emoji: '🏎️' }
]

const ESTADO_CFG = {
  pendiente:  { label: 'Próxima',    color: '#60A5FA', bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.25)' },
  en_vivo:    { label: 'En Vivo',    color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.25)' },
  finalizada: { label: 'Finalizada', color: '#4ADE80', bg: 'rgba(74,222,128,0.10)',  border: 'rgba(74,222,128,0.20)' },
  cancelada:  { label: 'Cancelada',  color: '#6B7280', bg: 'rgba(107,114,128,0.10)', border: 'rgba(107,114,128,0.20)' }
}

const ROL_CFG: Record<string, { label: string; color: string; bg: string }> = {
  titular:       { label: 'Titular',       color: '#4ADE80', bg: 'rgba(74,222,128,0.12)' },
  reserva:       { label: 'Reserva',       color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' },
  tercer_piloto: { label: 'Tercer Piloto', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  test:          { label: 'Test',          color: '#A855F7', bg: 'rgba(168,85,247,0.12)' },
  desarrollo:    { label: 'Desarrollo',    color: '#6B7280', bg: 'rgba(107,114,128,0.12)' }
}

/* ── Main ── */

export default function F1Dashboard () {
  const [tab, setTab] = useState<Tab>('campeonato')
  const [pilotos, setPilotos]           = useState<F1Piloto[]>([])
  const [escuderias, setEscuderias]     = useState<F1Escuderia[]>([])
  const [standingsP, setStandingsP]     = useState<StandingPiloto[]>([])
  const [standingsC, setStandingsC]     = useState<StandingConstructor[]>([])
  const [calendario, setCalendario]     = useState<CarreraAPI[]>([])
  const [ultimoRes, setUltimoRes]       = useState<UltimoResultado | null>(null)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')

  useEffect(() => {
    Promise.allSettled([
      getF1Pilotos(),
      getF1Escuderias(),
      getF1StandingsPilotos(),
      getF1StandingsConstructores(),
      getF1CalendarioAPI(),
      getF1UltimoResultado()
    ]).then(([rP, rE, rSP, rSC, rCal, rRes]) => {
      if (rP.status  === 'fulfilled') setPilotos(rP.value.pilotos ?? [])
      if (rE.status  === 'fulfilled') setEscuderias(rE.value.escuderias ?? [])
      if (rSP.status === 'fulfilled') setStandingsP(rSP.value.standings ?? [])
      if (rSC.status === 'fulfilled') setStandingsC(rSC.value.standings ?? [])
      if (rCal.status === 'fulfilled') setCalendario(rCal.value.carreras ?? [])
      if (rRes.status === 'fulfilled') setUltimoRes(rRes.value.resultado ?? null)
    }).catch(() => setError('Error al cargar datos de F1'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex min-h-screen" style={{ background: '#15151E' }}>
      <AppSidebar />
      <main className="flex-1 px-4 pt-20 pb-6 md:py-6 sm:px-6 lg:px-8 overflow-auto">
        <div className="mx-auto max-w-6xl space-y-6">

          {/* Header */}
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Fórmula 1</h1>
              <p className="text-sm mt-1" style={{ color: '#E8002D' }}>
                Temporada 2026 · Datos en tiempo real
              </p>
            </div>
            <div className="ml-auto text-4xl">🏎️</div>
          </div>

          {/* Último resultado banner */}
          {!loading && ultimoRes && (
            <UltimoResultadoBanner resultado={ultimoRes} />
          )}

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-2xl" style={{ background: '#1e1e2e', border: '1px solid rgba(232,0,45,0.1)' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all"
                style={tab === t.id
                  ? { background: 'linear-gradient(135deg, rgba(232,0,45,0.25), rgba(13,27,42,0.8))', color: '#fff', border: '1px solid rgba(232,0,45,0.35)' }
                  : { color: '#4B5563', border: '1px solid transparent' }
                }
              >
                <span className="hidden sm:inline">{t.emoji}</span>{t.label}
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
              {tab === 'campeonato' && <CampeonatoTab standingsP={standingsP} standingsC={standingsC} />}
              {tab === 'calendario' && <CalendarioTab carreras={calendario} />}
              {tab === 'pilotos'    && <PilotosTab pilotos={pilotos} />}
              {tab === 'escuderias' && <EscuderiasTab escuderias={escuderias} pilotos={pilotos} />}
            </>
          )}

        </div>
      </main>
    </div>
  )
}

/* ── Último resultado banner ── */

function UltimoResultadoBanner ({ resultado }: { resultado: UltimoResultado }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#0D1B2A', border: '1px solid rgba(232,0,45,0.25)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-5 py-3 text-left"
      >
        <div className="w-2 h-6 rounded-full shrink-0" style={{ background: '#E8002D' }} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#E8002D' }}>Último resultado</p>
          <p className="text-sm font-bold text-white truncate">{resultado.nombre_gp} · {resultado.circuito}</p>
        </div>
        <span className="text-xs font-medium shrink-0" style={{ color: '#4B5563' }}>{open ? '▲' : '▼'} Ver top 10</span>
      </button>

      {open && (
        <div className="px-5 pb-4 space-y-1.5">
          {resultado.resultados.map(r => (
            <div key={r.posicion} className="flex items-center gap-3 rounded-xl px-3 py-2"
              style={{ background: r.color ? `${r.color}0D` : 'rgba(255,255,255,0.03)', border: `1px solid ${r.color ?? '#ffffff'}18` }}
            >
              <span className="text-xs font-black w-5 text-center shrink-0"
                style={{ color: r.posicion <= 3 ? '#D4AF37' : '#4B5563' }}>
                {r.posicion}
              </span>
              {r.color && <div className="w-1 h-5 rounded-full shrink-0" style={{ background: r.color }} />}
              <span className="text-xs font-bold text-white w-8 shrink-0">{r.codigo}</span>
              <span className="text-xs text-white flex-1 truncate">{r.piloto}</span>
              <span className="text-xs shrink-0" style={{ color: '#6B7280' }}>{r.escuderia}</span>
              <span className="text-xs font-bold shrink-0 ml-2" style={{ color: '#4ADE80' }}>+{r.puntos}pts</span>
              {r.vuelta_rapida && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'rgba(168,85,247,0.2)', color: '#C084FC' }}>⚡VR</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Tab: Campeonato (datos reales) ── */

function CampeonatoTab ({ standingsP, standingsC }: { standingsP: StandingPiloto[]; standingsC: StandingConstructor[] }) {
  if (standingsP.length === 0 && standingsC.length === 0)
    return <EmptyState emoji="🏆" texto="Sin datos de campeonato" subtexto="Los standings se cargarán desde la API de F1" />

  return (
    <div className="space-y-8">
      {/* Pilotos */}
      <section>
        <div className="flex items-center gap-3 rounded-xl px-5 py-3 mb-4"
          style={{ background: 'rgba(232,0,45,0.08)', border: '1px solid rgba(232,0,45,0.25)' }}>
          <div className="w-2 h-6 rounded-full" style={{ background: '#E8002D' }} />
          <h2 className="text-base font-black tracking-wide" style={{ color: '#E8002D' }}>CLASIFICACIÓN DE PILOTOS</h2>
          <span className="ml-auto text-xs" style={{ color: '#4B5563' }}>{standingsP.length} pilotos</span>
        </div>
        <div className="space-y-1.5">
          {standingsP.map(s => {
            const tc = s.escuderia.color ?? '#4B5563'
            return (
              <div key={s.piloto.id} className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: '#0D1B2A', border: `1px solid ${tc}33` }}>
                <span className="text-sm font-black w-6 text-center shrink-0"
                  style={{ color: s.posicion <= 3 ? '#D4AF37' : '#4B5563' }}>{s.posicion}</span>
                <div className="w-1 h-8 rounded-full shrink-0" style={{ background: tc }} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm leading-tight truncate">{s.piloto.nombre}</p>
                  <p className="text-xs" style={{ color: '#6B7280' }}>{s.escuderia.nombre}</p>
                </div>
                {s.piloto.codigo && (
                  <span className="text-xs font-black shrink-0" style={{ color: tc }}>{s.piloto.codigo}</span>
                )}
                <div className="text-right shrink-0 space-y-0.5">
                  <p className="text-sm font-black text-white">{s.puntos} <span className="text-xs font-normal" style={{ color: '#6B7280' }}>pts</span></p>
                  {s.victorias > 0 && <p className="text-[10px]" style={{ color: '#D4AF37' }}>{s.victorias} victoria{s.victorias > 1 ? 's' : ''}</p>}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Constructores */}
      <section>
        <div className="flex items-center gap-3 rounded-xl px-5 py-3 mb-4"
          style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)' }}>
          <div className="w-2 h-6 rounded-full" style={{ background: '#D4AF37' }} />
          <h2 className="text-base font-black tracking-wide" style={{ color: '#D4AF37' }}>CLASIFICACIÓN DE CONSTRUCTORES</h2>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {standingsC.map(s => {
            const tc = s.escuderia.color ?? '#4B5563'
            return (
              <div key={s.escuderia.id} className="flex items-center gap-3 rounded-xl overflow-hidden"
                style={{ background: '#0D1B2A', border: `1px solid ${tc}33` }}>
                <div className="w-2 self-stretch shrink-0" style={{ background: tc }} />
                <div className="flex-1 py-3 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black w-5 shrink-0"
                      style={{ color: s.posicion <= 3 ? '#D4AF37' : '#4B5563' }}>{s.posicion}</span>
                    <p className="font-bold text-white text-sm truncate">{s.escuderia.nombre}</p>
                  </div>
                  <p className="text-xs mt-0.5 pl-7" style={{ color: '#6B7280' }}>{s.escuderia.pais}</p>
                </div>
                <div className="text-right pr-4 shrink-0">
                  <p className="text-sm font-black text-white">{s.puntos} <span className="text-xs font-normal" style={{ color: '#6B7280' }}>pts</span></p>
                  {s.victorias > 0 && <p className="text-[10px]" style={{ color: '#D4AF37' }}>{s.victorias}V</p>}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

/* ── Tab: Calendario (API real) ── */

function CalendarioTab ({ carreras }: { carreras: CarreraAPI[] }) {
  if (carreras.length === 0)
    return <EmptyState emoji="📅" texto="Calendario no disponible" subtexto="No se pudo cargar el calendario desde la API de F1" />

  const proxima = carreras.find(c => c.estado === 'pendiente' || c.estado === 'en_vivo')

  return (
    <div className="space-y-2">
      {carreras.map(c => {
        const cfg = ESTADO_CFG[c.estado]
        const esProxima = c.round === proxima?.round
        const fecha = new Date(c.fecha_carrera)
        const fmtFecha = fecha.toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit', month: 'short' })
        const fmtHora  = fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })

        return (
          <div key={c.round}
            className="flex items-center gap-4 rounded-2xl p-4 transition-all hover:scale-[1.005]"
            style={{
              background: esProxima ? `${cfg.bg}` : '#0D1B2A',
              border: `1px solid ${esProxima ? cfg.border : 'rgba(255,255,255,0.05)'}`,
              boxShadow: esProxima ? `0 0 20px ${cfg.color}18` : 'none'
            }}
          >
            {/* Round */}
            <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black"
              style={{ background: cfg.bg, color: cfg.color }}>
              {c.round}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white leading-tight truncate">
                {esProxima && <span className="mr-1">📍</span>}{c.nombre_gp}
              </p>
              <p className="text-xs mt-0.5 truncate" style={{ color: '#6B7280' }}>
                {[c.circuito, c.ciudad, c.pais].filter(Boolean).join(' · ')}
              </p>
              {c.fecha_sprint && (
                <p className="text-[10px] mt-0.5" style={{ color: '#F59E0B' }}>
                  Sprint · {new Date(c.fecha_sprint).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                </p>
              )}
            </div>

            {/* Fecha + estado */}
            <div className="shrink-0 text-right space-y-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                {c.estado === 'en_vivo' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />}
                {cfg.label}
              </span>
              <p className="text-[11px]" style={{ color: '#9CA3AF' }}>{fmtFecha}</p>
              <p className="text-[11px]" style={{ color: '#4B5563' }}>{fmtHora}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Tab: Pilotos (DB) ── */

function PilotosTab ({ pilotos }: { pilotos: F1Piloto[] }) {
  if (pilotos.length === 0)
    return <EmptyState emoji="🪖" texto="No hay pilotos registrados" subtexto="Agrega pilotos desde la base de datos" />

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {pilotos.map(p => {
        const asig = p.f1_piloto_escuderia?.[0]
        const equipo = asig?.f1_escuderias
        const tc = equipo?.color ?? '#4B5563'
        const rol = asig?.rol ?? ''
        const rolCfg = ROL_CFG[rol] ?? { label: rol, color: '#6B7280', bg: 'rgba(107,114,128,0.12)' }
        return (
          <div key={p.id_piloto} className="rounded-2xl overflow-hidden transition-all hover:scale-[1.01]"
            style={{ background: '#1e1e2e', border: '1px solid rgba(232,0,45,0.1)' }}>
            <div className="h-1.5 w-full" style={{ background: tc }} />
            <div className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black"
                  style={{ background: `${tc}22`, color: tc, border: `1px solid ${tc}44` }}>
                  {p.numero ?? '–'}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-white leading-tight truncate">{p.nombre}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{p.pais ?? '—'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: tc }} />
                  <span className="text-xs font-medium truncate" style={{ color: '#9CA3AF' }}>{equipo?.nombre ?? 'Sin equipo'}</span>
                </div>
                {rol && (
                  <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: rolCfg.bg, color: rolCfg.color }}>{rolCfg.label}</span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Tab: Escuderías (DB) ── */

function EscuderiasTab ({ escuderias, pilotos }: { escuderias: F1Escuderia[]; pilotos: F1Piloto[] }) {
  if (escuderias.length === 0)
    return <EmptyState emoji="🏎️" texto="No hay escuderías registradas" subtexto="Agrega equipos desde la base de datos" />

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {escuderias.map(e => {
        const tc = e.color ?? '#4B5563'
        const titulares = pilotos.filter(p =>
          p.f1_piloto_escuderia?.some(pe => pe.f1_escuderias?.id_escuderia === e.id_escuderia && pe.rol === 'titular')
        )
        return (
          <div key={e.id_escuderia} className="rounded-2xl overflow-hidden transition-all hover:scale-[1.01]"
            style={{ background: '#0D1B2A', border: `1px solid ${tc}33` }}>
            <div className="h-2 w-full" style={{ background: tc }} />
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-white leading-tight">{e.nombre}</h3>
                  <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{e.pais ?? '—'}</p>
                </div>
                <div className="w-10 h-10 rounded-xl shrink-0" style={{ background: `${tc}22`, border: `2px solid ${tc}66` }} />
              </div>
              {titulares.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#4B5563' }}>Pilotos Titulares</p>
                  {titulares.map(p => (
                    <div key={p.id_piloto} className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                      style={{ background: `${tc}0D` }}>
                      <span className="text-xs font-black w-6 text-right shrink-0" style={{ color: tc }}>{p.numero ?? '–'}</span>
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

/* ── Empty state ── */

function EmptyState ({ emoji, texto, subtexto }: { emoji: string; texto: string; subtexto: string }) {
  return (
    <div className="rounded-2xl p-12 text-center" style={{ background: '#1e1e2e', border: '1px solid rgba(232,0,45,0.1)' }}>
      <p className="text-5xl mb-4">{emoji}</p>
      <p className="text-white font-semibold">{texto}</p>
      <p className="text-sm mt-1" style={{ color: '#6B7280' }}>{subtexto}</p>
    </div>
  )
}
