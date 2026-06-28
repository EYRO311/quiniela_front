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
  estado: string
  estadio: string | null
  ciudad: string | null
}

const RONDAS: { fase: string; label: string; slots: number }[] = [
  { fase: 'dieciseisavos', label: 'Dieciseisavos', slots: 16 },
  { fase: 'octavos', label: 'Octavos de Final', slots: 8 },
  { fase: 'cuartos', label: 'Cuartos de Final', slots: 4 },
  { fase: 'semifinal', label: 'Semifinal', slots: 2 },
  { fase: 'final', label: 'Gran Final', slots: 1 }
]

const ROW_HEIGHT = 112

export default function LlavesDashboard () {
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
        setError(err instanceof Error ? err.message : 'Error al cargar las llaves')
        setLoading(false)
      })
  }, [])

  const tercerLugar = partidos.find(p => p.fase === 'tercer_lugar') ?? null
  const alturaTotal = RONDAS[0].slots * ROW_HEIGHT

  return (
    <div className="flex min-h-screen" style={{ background: '#060E1E' }}>
      <AppSidebar />

      <main className="flex-1 px-4 pt-20 pb-6 md:py-6 sm:px-6 lg:px-8 overflow-auto">
        <div className="mx-auto max-w-7xl space-y-6">

          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Llaves del Mundial</h1>
              <p className="text-sm mt-1" style={{ color: '#D4AF37' }}>
                Dieciseisavos &middot; Octavos &middot; Cuartos &middot; Final
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
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-6 min-w-max" style={{ height: alturaTotal }}>
                  {RONDAS.map(ronda => (
                    <RondaColumna
                      key={ronda.fase}
                      label={ronda.label}
                      partidos={partidos.filter(p => p.fase === ronda.fase)}
                      slots={ronda.slots}
                      alturaTotal={alturaTotal}
                    />
                  ))}
                </div>
              </div>

              {tercerLugar && (
                <div className="max-w-sm">
                  <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#D4AF37' }}>
                    Tercer Lugar
                  </p>
                  <LlaveCard partido={tercerLugar} />
                </div>
              )}
            </>
          )}

        </div>
      </main>
    </div>
  )
}

/* ── Sub-components ── */

function RondaColumna ({ label, partidos, slots, alturaTotal }: {
  label: string
  partidos: Partido[]
  slots: number
  alturaTotal: number
}) {
  const items: (Partido | null)[] = Array.from({ length: slots }, (_, i) => partidos[i] ?? null)

  return (
    <div className="flex flex-col w-64 shrink-0">
      <div className="rounded-xl px-4 py-2 mb-3 text-center" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)' }}>
        <h2 className="text-sm font-black tracking-wide" style={{ color: '#D4AF37' }}>{label}</h2>
      </div>
      <div className="flex-1 flex flex-col justify-around" style={{ height: alturaTotal }}>
        {items.map((p, i) => (
          <LlaveCard key={p?.id_partido ?? `${label}-${i}`} partido={p} />
        ))}
      </div>
    </div>
  )
}

function LlaveCard ({ partido }: { partido: Partido | null }) {
  if (!partido) {
    return (
      <div
        className="rounded-xl p-3 flex items-center justify-center text-xs font-medium"
        style={{ background: '#0D1B2A', border: '1px dashed rgba(255,255,255,0.12)', color: '#4B5563', minHeight: 84 }}
      >
        Por definir
      </div>
    )
  }

  const fecha = new Date(partido.fecha)
  const finalizado = partido.estado === 'finalizado'
  const enVivo = partido.estado === 'en_vivo'
  const fmtDate = fecha.toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit', month: 'short' })
  const fmtTime = fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="rounded-xl p-3 space-y-2" style={{ background: '#0D1B2A', border: '1px solid rgba(212,175,55,0.2)' }}>
      <div className="flex items-center justify-between text-[10px]">
        <span style={{ color: finalizado ? '#6B7280' : '#D4AF37' }}>
          {enVivo ? '' : finalizado ? 'FINAL' : `${fmtDate} ${fmtTime}`}
        </span>
        {enVivo && <span className="font-bold animate-pulse" style={{ color: '#EF4444' }}>EN VIVO</span>}
      </div>

      <EquipoFila nombre={partido.equipo_a} escudo={partido.escudo_a} goles={partido.goles_a} mostrarGoles={finalizado || enVivo} />
      <EquipoFila nombre={partido.equipo_b} escudo={partido.escudo_b} goles={partido.goles_b} mostrarGoles={finalizado || enVivo} />

      {(partido.estadio || partido.ciudad) && (
        <p className="text-[10px] truncate" style={{ color: '#6B7280' }}>
          📍 {partido.estadio ?? partido.ciudad}{partido.estadio && partido.ciudad ? ` · ${partido.ciudad}` : ''}
        </p>
      )}
    </div>
  )
}

function EquipoFila ({ nombre, escudo, goles, mostrarGoles }: {
  nombre: string
  escudo: string | null
  goles: number | null
  mostrarGoles: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      {escudo ? (
        <img src={escudo} alt={nombre} className="w-5 h-5 object-contain shrink-0" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
      ) : (
        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0" style={{ background: 'rgba(255,255,255,0.07)', color: '#9CA3AF' }}>
          {nombre.charAt(0)}
        </div>
      )}
      <span className="text-xs font-semibold text-white leading-tight flex-1 truncate">{nombre}</span>
      {mostrarGoles && goles !== null && (
        <span className="text-sm font-black text-white">{goles}</span>
      )}
    </div>
  )
}
