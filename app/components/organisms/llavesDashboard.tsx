'use client'

import { useEffect, useState } from 'react'
import AppSidebar from '@/app/components/layout/appSidebar'
import { getPartidos } from '@/services/partidos.service'

interface PartidoDB {
  id_partido: string
  equipo_a: string
  escudo_a: string | null
  equipo_b: string
  escudo_b: string | null
  goles_a: number | null
  goles_b: number | null
  penal_a: number | null
  penal_b: number | null
  fecha: string
  fase: string
  estado: string
  estadio: string | null
  ciudad: string | null
  jornada: number | null
}

type TeamInfo = { nombre: string; escudo: string | null }

// ── Bracket structure ──────────────────────────────────────────────────────────
// Left side columns (outside → inside)
const LEFT_COLS = [
  [73, 75, 74, 77, 76, 78, 79, 80], // 16avos (8)
  [90, 89, 91, 92],                   // Octavos (4)
  [97, 99],                           // Cuartos (2)
  [101],                              // Semi (1)
]
// Right side columns (inside → outside)
const RIGHT_COLS = [
  [102],                              // Semi (1)
  [98, 100],                          // Cuartos (2)
  [93, 94, 95, 96],                   // Octavos (4)
  [83, 84, 81, 82, 86, 88, 85, 87], // 16avos (8)
]
const COL_LABELS = ['16avos', 'Octavos', 'Cuartos', 'Semis']

// Which jornadas feed (as winners) into each slot's teams
const MATCH_SOURCES: Record<number, [number, number] | null> = {
  73: null, 74: null, 75: null, 76: null, 77: null, 78: null,
  79: null, 80: null, 81: null, 82: null, 83: null, 84: null,
  85: null, 86: null, 87: null, 88: null,
  90: [73, 75], 89: [74, 77],
  91: [76, 78], 92: [79, 80],
  93: [83, 84], 94: [81, 82],
  95: [86, 88], 96: [85, 87],
  97: [89, 90], 99: [91, 92],
  98: [93, 94], 100: [95, 96],
  101: [97, 98], 102: [99, 100],
  103: [101, 102], // perdedores
  104: [101, 102], // ganadores
}

// Hardcoded dates/venues for all 32 matches (CDMX → UTC, UTC-6)
const MATCH_INFO: Record<number, { fecha: string; estadio: string; ciudad: string }> = {
  73:  { fecha: '2026-06-28T19:00:00Z', estadio: 'SoFi Stadium',             ciudad: 'Los Ángeles'   },
  74:  { fecha: '2026-06-29T20:30:00Z', estadio: 'Gillette Stadium',          ciudad: 'Boston'        },
  75:  { fecha: '2026-06-30T01:00:00Z', estadio: 'Estadio BBVA',              ciudad: 'Monterrey'     },
  76:  { fecha: '2026-06-29T17:00:00Z', estadio: 'NRG Stadium',               ciudad: 'Houston'       },
  77:  { fecha: '2026-06-30T21:00:00Z', estadio: 'MetLife Stadium',           ciudad: 'Nueva York/NJ' },
  78:  { fecha: '2026-06-30T17:00:00Z', estadio: 'AT&T Stadium',              ciudad: 'Dallas'        },
  79:  { fecha: '2026-07-01T01:00:00Z', estadio: 'Estadio Azteca',            ciudad: 'Cd. de México' },
  80:  { fecha: '2026-07-01T16:00:00Z', estadio: 'Mercedes-Benz Stadium',     ciudad: 'Atlanta'       },
  81:  { fecha: '2026-07-02T00:00:00Z', estadio: "Levi's Stadium",            ciudad: 'San Francisco' },
  82:  { fecha: '2026-07-01T20:00:00Z', estadio: 'Lumen Field',               ciudad: 'Seattle'       },
  83:  { fecha: '2026-07-02T23:00:00Z', estadio: 'BMO Field',                 ciudad: 'Toronto'       },
  84:  { fecha: '2026-07-02T19:00:00Z', estadio: 'SoFi Stadium',              ciudad: 'Los Ángeles'   },
  85:  { fecha: '2026-07-03T03:00:00Z', estadio: 'BC Place',                  ciudad: 'Vancouver'     },
  86:  { fecha: '2026-07-03T22:00:00Z', estadio: 'Hard Rock Stadium',         ciudad: 'Miami'         },
  87:  { fecha: '2026-07-04T01:30:00Z', estadio: 'Arrowhead Stadium',         ciudad: 'Kansas City'   },
  88:  { fecha: '2026-07-03T18:00:00Z', estadio: 'AT&T Stadium',              ciudad: 'Dallas'        },
  89:  { fecha: '2026-07-04T21:00:00Z', estadio: 'Lincoln Financial Field',   ciudad: 'Philadelphia'  },
  90:  { fecha: '2026-07-04T17:00:00Z', estadio: 'NRG Stadium',               ciudad: 'Houston'       },
  91:  { fecha: '2026-07-05T20:00:00Z', estadio: 'MetLife Stadium',           ciudad: 'Nueva York/NJ' },
  92:  { fecha: '2026-07-06T00:00:00Z', estadio: 'Estadio Azteca',            ciudad: 'Cd. de México' },
  93:  { fecha: '2026-07-06T19:00:00Z', estadio: 'AT&T Stadium',              ciudad: 'Dallas'        },
  94:  { fecha: '2026-07-07T00:00:00Z', estadio: 'Lumen Field',               ciudad: 'Seattle'       },
  95:  { fecha: '2026-07-07T16:00:00Z', estadio: 'Mercedes-Benz Stadium',     ciudad: 'Atlanta'       },
  96:  { fecha: '2026-07-07T20:00:00Z', estadio: 'BC Place',                  ciudad: 'Vancouver'     },
  97:  { fecha: '2026-07-09T20:00:00Z', estadio: 'Gillette Stadium',          ciudad: 'Boston'        },
  98:  { fecha: '2026-07-10T19:00:00Z', estadio: 'SoFi Stadium',              ciudad: 'Los Ángeles'   },
  99:  { fecha: '2026-07-11T21:00:00Z', estadio: 'Hard Rock Stadium',         ciudad: 'Miami'         },
  100: { fecha: '2026-07-12T01:00:00Z', estadio: 'Arrowhead Stadium',         ciudad: 'Kansas City'   },
  101: { fecha: '2026-07-14T19:00:00Z', estadio: 'AT&T Stadium',              ciudad: 'Dallas'        },
  102: { fecha: '2026-07-15T19:00:00Z', estadio: 'Mercedes-Benz Stadium',     ciudad: 'Atlanta'       },
  103: { fecha: '2026-07-18T21:00:00Z', estadio: 'Hard Rock Stadium',         ciudad: 'Miami'         },
  104: { fecha: '2026-07-19T19:00:00Z', estadio: 'MetLife Stadium',           ciudad: 'Nueva York/NJ' },
}

const TOTAL_HEIGHT = 8 * 110 // 880px — drives all vertical alignment via justify-around

// ── Helpers ───────────────────────────────────────────────────────────────────

function teamResult (p: PartidoDB | null): 'A' | 'B' | null {
  if (!p || p.estado !== 'finalizado') return null
  const gA = p.goles_a ?? 0, gB = p.goles_b ?? 0
  if (gA !== gB) return gA > gB ? 'A' : 'B'
  return (p.penal_a ?? 0) > (p.penal_b ?? 0) ? 'A' : 'B'
}

function getGanador (p: PartidoDB | null): TeamInfo | null {
  if (!p || p.estado !== 'finalizado') return null
  return teamResult(p) === 'A'
    ? { nombre: p.equipo_a, escudo: p.escudo_a }
    : { nombre: p.equipo_b, escudo: p.escudo_b }
}

function getPerdedor (p: PartidoDB | null): TeamInfo | null {
  if (!p || p.estado !== 'finalizado') return null
  return teamResult(p) === 'A'
    ? { nombre: p.equipo_b, escudo: p.escudo_b }
    : { nombre: p.equipo_a, escudo: p.escudo_a }
}

function resolveTeams (
  jornada: number,
  map: Map<number, PartidoDB>,
  tercerLugar = false
): { a: TeamInfo | null; b: TeamInfo | null } {
  const p = map.get(jornada)
  if (p) return { a: { nombre: p.equipo_a, escudo: p.escudo_a }, b: { nombre: p.equipo_b, escudo: p.escudo_b } }

  const src = MATCH_SOURCES[jornada]
  if (!src) return { a: null, b: null }
  const fn = tercerLugar ? getPerdedor : getGanador
  return { a: fn(map.get(src[0]) ?? null), b: fn(map.get(src[1]) ?? null) }
}

// ── Main component ────────────────────────────────────────────────────────────

export default function LlavesDashboard () {
  const [partidos, setPartidos] = useState<PartidoDB[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getPartidos()
      .then((res: { partidos: PartidoDB[] }) => {
        setPartidos(res.partidos ?? [])
        setLoading(false)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Error al cargar las llaves')
        setLoading(false)
      })
  }, [])

  const partidoMap = new Map<number, PartidoDB>()
  for (const p of partidos) {
    if (p.jornada != null) partidoMap.set(p.jornada, p)
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#060E1E' }}>
      <AppSidebar />

      <main className="flex-1 px-4 pt-20 pb-6 md:py-6 sm:px-6 lg:px-8 overflow-auto">
        <div className="mx-auto space-y-6" style={{ maxWidth: 1900 }}>

          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Las Llaves del Mundial</h1>
              <p className="text-sm mt-1" style={{ color: '#D4AF37' }}>
                16avos · Octavos · Cuartos · Semis · Final · 19 Jul 2026
              </p>
            </div>
            <div className="ml-auto text-4xl">🏆</div>
          </div>

          {loading && (
            <div className="flex justify-center py-20">
              <div className="text-center space-y-3">
                <div className="text-5xl animate-pulse">⚽</div>
                <p className="text-sm tracking-widest uppercase" style={{ color: '#D4AF37' }}>Cargando llaves...</p>
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
              {/* ── Bracket ── */}
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-1.5 min-w-max" style={{ height: TOTAL_HEIGHT + 36 }}>

                  {/* Left columns: 16avos → Octavos → Cuartos → Semi */}
                  {LEFT_COLS.map((slots, ci) => (
                    <BracketCol
                      key={`L${ci}`}
                      label={COL_LABELS[ci]}
                      slots={slots}
                      partidoMap={partidoMap}
                    />
                  ))}

                  {/* Center: Final */}
                  <div className="flex flex-col shrink-0" style={{ width: 200 }}>
                    <div className="text-center mb-2 h-5.5 flex items-center justify-center">
                      <span className="text-[11px] font-black tracking-widest uppercase" style={{ color: '#D4AF37' }}>
                        🏆 FINAL
                      </span>
                    </div>
                    <div className="flex flex-col justify-center" style={{ height: TOTAL_HEIGHT }}>
                      <BracketSlot
                        jornada={104}
                        partido={partidoMap.get(104) ?? null}
                        teams={resolveTeams(104, partidoMap)}
                        isFinal
                      />
                    </div>
                  </div>

                  {/* Right columns: Semi → Cuartos → Octavos → 16avos */}
                  {RIGHT_COLS.map((slots, ci) => (
                    <BracketCol
                      key={`R${ci}`}
                      label={COL_LABELS[3 - ci]}
                      slots={slots}
                      partidoMap={partidoMap}
                    />
                  ))}

                </div>
              </div>

              {/* ── Tercer Lugar ── */}
              <div className="max-w-xs">
                <p className="text-[10px] font-black tracking-widest uppercase mb-2" style={{ color: '#6B7280' }}>
                  🥉 Tercer Lugar
                </p>
                <BracketSlot
                  jornada={103}
                  partido={partidoMap.get(103) ?? null}
                  teams={resolveTeams(103, partidoMap, true)}
                />
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function BracketCol ({
  label, slots, partidoMap
}: {
  label: string
  slots: number[]
  partidoMap: Map<number, PartidoDB>
}) {
  return (
    <div className="flex flex-col shrink-0" style={{ width: 184 }}>
      <div className="text-center mb-2 h-5.5 flex items-center justify-center">
        <span className="text-[11px] font-black tracking-widest uppercase" style={{ color: '#D4AF37' }}>
          {label}
        </span>
      </div>
      <div className="flex flex-col justify-around" style={{ height: TOTAL_HEIGHT }}>
        {slots.map(jornada => (
          <BracketSlot
            key={jornada}
            jornada={jornada}
            partido={partidoMap.get(jornada) ?? null}
            teams={resolveTeams(jornada, partidoMap)}
          />
        ))}
      </div>
    </div>
  )
}

function BracketSlot ({
  jornada, partido, teams, isFinal
}: {
  jornada: number
  partido: PartidoDB | null
  teams: { a: TeamInfo | null; b: TeamInfo | null }
  isFinal?: boolean
}) {
  const info = MATCH_INFO[jornada]
  const rawFecha = partido?.fecha ?? info?.fecha ?? ''
  const fecha = new Date(rawFecha)
  const fmtDate = isNaN(fecha.getTime()) ? '' : fecha.toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit', month: 'short' })
  const fmtTime = isNaN(fecha.getTime()) ? '' : fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  const lugar  = partido?.estadio ?? info?.estadio ?? ''
  const ciudad = partido?.ciudad  ?? info?.ciudad  ?? ''

  const finalizado = partido?.estado === 'finalizado'
  const enVivo     = partido?.estado === 'en_vivo'
  const winner     = teamResult(partido)

  const teamA: TeamInfo | null = partido ? { nombre: partido.equipo_a, escudo: partido.escudo_a } : (teams.a ?? null)
  const teamB: TeamInfo | null = partido ? { nombre: partido.equipo_b, escudo: partido.escudo_b } : (teams.b ?? null)

  const borderStyle = isFinal
    ? 'rgba(212,175,55,0.55)'
    : finalizado ? 'rgba(74,222,128,0.35)' : 'rgba(212,175,55,0.18)'
  const bgStyle = isFinal ? 'rgba(212,175,55,0.07)' : '#0D1B2A'

  return (
    <div
      className="rounded-xl p-2 space-y-1"
      style={{ background: bgStyle, border: `1px solid ${borderStyle}`, minHeight: 82 }}
    >
      {/* Status row */}
      <div className="flex items-center justify-between gap-1">
        {enVivo ? (
          <span className="text-[9px] font-bold animate-pulse" style={{ color: '#EF4444' }}>● EN VIVO</span>
        ) : (
          <span className="text-[9px] leading-tight" style={{ color: finalizado ? '#4ADE80' : '#6B7280' }}>
            {finalizado ? 'FINALIZADO' : `${fmtDate} ${fmtTime}`}
          </span>
        )}
        <span className="text-[9px] shrink-0" style={{ color: '#374151' }}>M{jornada}</span>
      </div>

      {/* Team A */}
      <TeamRow
        team={teamA}
        goles={partido?.goles_a ?? null}
        showGoles={finalizado || enVivo}
        isWinner={winner === null ? undefined : winner === 'A'}
      />

      {/* Team B */}
      <TeamRow
        team={teamB}
        goles={partido?.goles_b ?? null}
        showGoles={finalizado || enVivo}
        isWinner={winner === null ? undefined : winner === 'B'}
      />

      {/* Penalty score */}
      {finalizado && partido?.penal_a != null && (
        <p className="text-[9px] text-center font-bold" style={{ color: '#D4AF37' }}>
          🥅 {partido.penal_a}–{partido.penal_b} pen
        </p>
      )}

      {/* Venue */}
      <p className="text-[9px] truncate leading-tight" style={{ color: '#374151' }}>
        {ciudad}{ciudad && lugar ? ' · ' : ''}{lugar}
      </p>
    </div>
  )
}

function TeamRow ({
  team, goles, showGoles, isWinner
}: {
  team: TeamInfo | null
  goles: number | null
  showGoles: boolean
  isWinner?: boolean
}) {
  if (!team) {
    return (
      <div className="flex items-center gap-1 opacity-35">
        <div className="w-4 h-4 rounded-full shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <span className="text-[10px] flex-1" style={{ color: '#4B5563' }}>Por definir</span>
      </div>
    )
  }

  const nameColor = isWinner === true ? '#FFFFFF' : isWinner === false ? '#4B5563' : '#D1D5DB'
  const golesColor = isWinner === true ? '#FFFFFF' : '#6B7280'

  return (
    <div className="flex items-center gap-1.5">
      {team.escudo ? (
        <img
          src={team.escudo}
          alt={team.nombre}
          className="w-4 h-4 object-contain shrink-0"
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
        />
      ) : (
        <div
          className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black shrink-0"
          style={{ background: 'rgba(255,255,255,0.08)', color: '#9CA3AF' }}
        >
          {team.nombre.charAt(0)}
        </div>
      )}
      <span className="text-[10px] font-semibold flex-1 truncate leading-tight" style={{ color: nameColor }}>
        {team.nombre}
      </span>
      {showGoles && goles !== null && (
        <span className="text-xs font-black" style={{ color: golesColor }}>{goles}</span>
      )}
    </div>
  )
}
