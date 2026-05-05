'use client'

import { useEffect, useState } from 'react'
import AppSidebar from '@/app/components/layout/appSidebar'
import { getPartidos } from '@/services/partidos.service'

interface Partido {
  id_partido: string
  equipo_a: string
  escudo_a: string | null
  equipo_b: string
  escudo_b: string | null
  goles_a: number | null
  goles_b: number | null
  fecha: string
  fase: string
  grupo: string | null
  jornada: number | null
  estado: string
  estadio: string | null
  ciudad: string | null
  pais: string | null
}

const GROUP_COLORS: Record<string, { accent: string; bg: string; border: string }> = {
  A: { accent: '#3B82F6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.25)' },
  B: { accent: '#EF4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.25)' },
  C: { accent: '#22C55E', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.25)' },
  D: { accent: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
  E: { accent: '#A855F7', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.25)' },
  F: { accent: '#06B6D4', bg: 'rgba(6,182,212,0.08)',  border: 'rgba(6,182,212,0.25)' },
  G: { accent: '#EC4899', bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.25)' },
  H: { accent: '#F97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.25)' },
  I: { accent: '#6366F1', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.25)' },
  J: { accent: '#10B981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)' },
  K: { accent: '#F43F5E', bg: 'rgba(244,63,94,0.08)',  border: 'rgba(244,63,94,0.25)' },
  L: { accent: '#14B8A6', bg: 'rgba(20,184,166,0.08)', border: 'rgba(20,184,166,0.25)' }
}

const KNOCKOUT_COLOR = { accent: '#D4AF37', bg: 'rgba(212,175,55,0.08)', border: 'rgba(212,175,55,0.25)' }

const FASE_LABEL: Record<string, string> = {
  grupos: 'Fase de Grupos',
  dieciseisavos: 'Dieciseisavos de Final',
  octavos: 'Octavos de Final',
  cuartos: 'Cuartos de Final',
  semifinal: 'Semifinal',
  tercer_lugar: 'Tercer Lugar',
  final: 'Gran Final'
}

export default function PartidosDashboard () {
  const [partidos, setPartidos] = useState<Partido[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getPartidos()
      .then((res: { partidos: Partido[] }) => {
        setPartidos(res.partidos ?? [])
        setLoading(false)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Error al cargar partidos')
        setLoading(false)
      })
  }, [])

  // Separar grupos de eliminatorias
  const grupos = partidos.filter(p => p.fase === 'grupos')
  const eliminatorias = partidos.filter(p => p.fase !== 'grupos')

  // Agrupar por letra de grupo
  const porGrupo = grupos.reduce<Record<string, Partido[]>>((acc, p) => {
    const g = p.grupo ?? 'SIN GRUPO'
    if (!acc[g]) acc[g] = []
    acc[g].push(p)
    return acc
  }, {})

  // Agrupar eliminatorias por fase
  const porFase = eliminatorias.reduce<Record<string, Partido[]>>((acc, p) => {
    if (!acc[p.fase]) acc[p.fase] = []
    acc[p.fase].push(p)
    return acc
  }, {})

  return (
    <div className="flex min-h-screen" style={{ background: '#060E1E' }}>
      <AppSidebar />

      <main className="flex-1 px-4 pt-20 pb-6 md:py-6 sm:px-6 lg:px-8 overflow-auto">
        <div className="mx-auto max-w-6xl space-y-10">

          {/* Header */}
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Partidos</h1>
              <p className="text-sm mt-1" style={{ color: '#D4AF37' }}>
                FIFA World Cup 2026 · USA · México · Canadá
              </p>
            </div>
            <div className="ml-auto text-4xl">🏆</div>
          </div>

          {loading && (
            <div className="flex justify-center py-20">
              <div className="text-center space-y-3">
                <div className="text-5xl animate-pulse">⚽</div>
                <p className="text-sm tracking-widest uppercase" style={{ color: '#D4AF37' }}>Cargando partidos...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {!loading && !error && partidos.length === 0 && (
            <div className="rounded-2xl p-12 text-center" style={{ background: '#0D1B2A', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-5xl mb-4">📅</p>
              <p className="text-white font-semibold">No hay partidos registrados aún</p>
              <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Los partidos aparecerán aquí una vez que sean cargados</p>
            </div>
          )}

          {/* ── Fase de Grupos ── */}
          {Object.keys(porGrupo).sort().map(grupo => {
            const cfg = GROUP_COLORS[grupo] ?? KNOCKOUT_COLOR
            return (
              <section key={grupo}>
                {/* Group header */}
                <div
                  className="flex items-center gap-3 rounded-xl px-5 py-3 mb-4"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                >
                  <div className="w-2 h-6 rounded-full" style={{ background: cfg.accent }} />
                  <h2 className="text-lg font-black tracking-wide" style={{ color: cfg.accent }}>
                    GRUPO {grupo}
                  </h2>
                  <span className="ml-auto text-xs font-medium" style={{ color: cfg.accent }}>
                    {porGrupo[grupo].length} {porGrupo[grupo].length === 1 ? 'partido' : 'partidos'}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {porGrupo[grupo].map(p => (
                    <PartidoCard key={p.id_partido} partido={p} accentColor={cfg.accent} borderColor={cfg.border} />
                  ))}
                </div>
              </section>
            )
          })}

          {/* ── Eliminatorias ── */}
          {Object.keys(porFase).map(fase => (
            <section key={fase}>
              <div
                className="flex items-center gap-3 rounded-xl px-5 py-3 mb-4"
                style={{ background: KNOCKOUT_COLOR.bg, border: `1px solid ${KNOCKOUT_COLOR.border}` }}
              >
                <div className="w-2 h-6 rounded-full" style={{ background: KNOCKOUT_COLOR.accent }} />
                <h2 className="text-lg font-black tracking-wide" style={{ color: KNOCKOUT_COLOR.accent }}>
                  {FASE_LABEL[fase] ?? fase.toUpperCase()}
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {porFase[fase].map(p => (
                  <PartidoCard key={p.id_partido} partido={p} accentColor={KNOCKOUT_COLOR.accent} borderColor={KNOCKOUT_COLOR.border} />
                ))}
              </div>
            </section>
          ))}

        </div>
      </main>
    </div>
  )
}

/* ── Sub-components ── */

function PartidoCard ({ partido, accentColor, borderColor }: { partido: Partido; accentColor: string; borderColor: string }) {
  const fecha = new Date(partido.fecha)
  const finalizado = partido.estado === 'finalizado'
  const enVivo = partido.estado === 'en_vivo'
  const pendiente = partido.estado === 'pendiente'

  const fmtDate = fecha.toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit', month: 'short' })
  const fmtTime = fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })

  return (
    <div
      className="rounded-2xl p-4 space-y-3 transition-all hover:scale-[1.01]"
      style={{ background: '#0D1B2A', border: `1px solid ${borderColor}` }}
    >
      {/* Top row: date/status */}
      <div className="flex items-center justify-between text-xs">
        <span style={{ color: '#6B7280' }}>
          {partido.estadio ? `${partido.estadio}` : partido.ciudad ?? '—'}
        </span>
        {enVivo && (
          <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold animate-pulse" style={{ background: 'rgba(239,68,68,0.2)', color: '#EF4444' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
            EN VIVO
          </span>
        )}
        {pendiente && <span className="font-medium" style={{ color: accentColor }}>{fmtDate} {fmtTime}</span>}
        {finalizado && <span style={{ color: '#6B7280' }}>FINAL</span>}
        {partido.estado === 'cancelado' && <span style={{ color: '#EF4444' }}>CANCELADO</span>}
      </div>

      {/* Teams + score */}
      <div className="flex items-center gap-2">
        {/* Team A */}
        <div className="flex flex-1 flex-col items-center gap-1.5 text-center">
          <TeamShield url={partido.escudo_a} name={partido.equipo_a} />
          <span className="text-xs font-semibold text-white leading-tight line-clamp-2">{partido.equipo_a}</span>
        </div>

        {/* Score / VS */}
        <div className="flex items-center gap-1.5 px-2 shrink-0">
          {(finalizado || enVivo) && partido.goles_a !== null && partido.goles_b !== null ? (
            <>
              <span className="text-2xl font-black text-white">{partido.goles_a}</span>
              <span className="text-sm" style={{ color: '#4B5563' }}>—</span>
              <span className="text-2xl font-black text-white">{partido.goles_b}</span>
            </>
          ) : (
            <span className="text-sm font-black" style={{ color: accentColor }}>VS</span>
          )}
        </div>

        {/* Team B */}
        <div className="flex flex-1 flex-col items-center gap-1.5 text-center">
          <TeamShield url={partido.escudo_b} name={partido.equipo_b} />
          <span className="text-xs font-semibold text-white leading-tight line-clamp-2">{partido.equipo_b}</span>
        </div>
      </div>

      {/* Bottom: jornada */}
      {partido.jornada !== null && (
        <div className="text-center">
          <span className="text-[10px] font-medium" style={{ color: '#4B5563' }}>Jornada {partido.jornada}</span>
        </div>
      )}
    </div>
  )
}

function TeamShield ({ url, name }: { url: string | null; name: string }) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className="w-10 h-10 object-contain"
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
      />
    )
  }
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black"
      style={{ background: 'rgba(255,255,255,0.07)', color: '#9CA3AF' }}
    >
      {name.charAt(0)}
    </div>
  )
}
