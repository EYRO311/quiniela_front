'use client'

import { useEffect, useState } from 'react'
import AppSidebar from '@/app/components/layout/appSidebar'
import { getPartidos, getProximoPartido, setResultadoPartido, syncResultados } from '@/services/partidos.service'

interface Partido {
  id_partido: string
  equipo_a: string
  equipo_b: string
  escudo_a: string | null
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
  penal_a?: number | null
  penal_b?: number | null
}

export default function AdminResultadosDashboard ({ idUsuario }: { idUsuario: string }) {
  const [partidos, setPartidos] = useState<Partido[]>([])
  const [proximo, setProximo] = useState<Partido | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')

  const handleSync = async () => {
    setSyncing(true)
    setSyncMsg('')
    try {
      const res = await syncResultados(idUsuario)
      const partes: string[] = []
      if (res.finalizados?.length) partes.push(`${res.finalizados.length} finalizado(s)`)
      if (res.enVivo?.length) partes.push(`${res.enVivo.length} en vivo`)
      setSyncMsg(partes.length ? `Actualizado: ${partes.join(', ')}` : 'Sin cambios')
      cargar()
    } catch (err: unknown) {
      setSyncMsg(err instanceof Error ? err.message : 'Error al sincronizar')
    } finally {
      setSyncing(false)
    }
  }

  const cargar = () => {
    setLoading(true)
    Promise.all([getPartidos(), getProximoPartido()])
      .then(([pRes, prRes]: [{ partidos: Partido[] }, { partido: Partido | null }]) => {
        setPartidos(pRes.partidos ?? [])
        setProximo(prRes.partido ?? null)
        setLoading(false)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Error al cargar partidos')
        setLoading(false)
      })
  }

  useEffect(() => { cargar() }, [])

  const pendientes = [...partidos]
    .filter(p => p.estado === 'pendiente' || p.estado === 'en_vivo')
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

  const finalizados = [...partidos]
    .filter(p => p.estado === 'finalizado')
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

  return (
    <div className="flex min-h-screen" style={{ background: '#060E1E' }}>
      <AppSidebar />

      <main className="flex-1 px-4 pt-20 pb-6 md:py-6 sm:px-6 lg:px-8 overflow-auto">
        <div className="mx-auto max-w-4xl space-y-6">

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Resultados</h1>
              <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
                Captura el resultado final de cada partido para calcular los puntos
              </p>
            </div>
            <span className="text-4xl">⚙️</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-[1.01] w-fit"
              style={{
                background: syncing ? '#374151' : 'rgba(212,175,55,0.12)',
                color: '#D4AF37',
                border: '1px solid rgba(212,175,55,0.3)',
                cursor: syncing ? 'not-allowed' : 'pointer'
              }}
            >
              {syncing ? 'Sincronizando...' : '🔄 Sincronizar resultados'}
            </button>
            {syncMsg && (
              <p className="text-xs" style={{ color: '#9CA3AF' }}>{syncMsg}</p>
            )}
          </div>

          {proximo && (
            <ProximoPartidoBanner partido={proximo} />
          )}

          {error && (
            <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {loading && (
            <div className="flex justify-center py-20">
              <div className="text-center space-y-3">
                <div className="text-5xl animate-pulse">⚽</div>
                <p className="text-sm tracking-widest uppercase" style={{ color: '#D4AF37' }}>Cargando partidos...</p>
              </div>
            </div>
          )}

          {!loading && (
            <>
              <section className="space-y-3">
                <h2 className="text-lg font-black text-white">Partidos pendientes</h2>
                {pendientes.length === 0 && (
                  <p className="text-sm" style={{ color: '#6B7280' }}>No hay partidos pendientes.</p>
                )}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {pendientes.map(p => (
                    <ResultadoCard key={p.id_partido} partido={p} idUsuario={idUsuario} onGuardado={cargar} />
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-black text-white">Partidos finalizados</h2>
                {finalizados.length === 0 && (
                  <p className="text-sm" style={{ color: '#6B7280' }}>Aún no hay partidos finalizados.</p>
                )}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {finalizados.map(p => (
                    <ResultadoCard key={p.id_partido} partido={p} idUsuario={idUsuario} onGuardado={cargar} readOnly />
                  ))}
                </div>
              </section>
            </>
          )}

        </div>
      </main>
    </div>
  )
}

function ProximoPartidoBanner ({ partido }: { partido: Partido }) {
  const fecha = new Date(partido.fecha)
  const fmtDate = fecha.toLocaleDateString('es-MX', { weekday: 'long', day: '2-digit', month: 'short' })
  const fmtTime = fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })

  return (
    <div
      className="rounded-2xl p-5 flex items-center gap-4"
      style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.25)' }}
    >
      <span className="text-3xl">⏭️</span>
      <div className="flex-1">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#D4AF37' }}>Próximo partido</p>
        <p className="text-white font-black text-lg">{partido.equipo_a} vs {partido.equipo_b}</p>
        <p className="text-sm" style={{ color: '#9CA3AF' }}>
          {fmtDate} · {fmtTime}{partido.estadio ? ` · ${partido.estadio}` : ''}
        </p>
      </div>
    </div>
  )
}

function ResultadoCard ({
  partido, idUsuario, onGuardado, readOnly
}: {
  partido: Partido
  idUsuario: string
  onGuardado: () => void
  readOnly?: boolean
}) {
  const [golesA, setGolesA] = useState<number>(partido.goles_a ?? 0)
  const [golesB, setGolesB] = useState<number>(partido.goles_b ?? 0)
  const [penalA, setPenalA] = useState<number>(partido.penal_a ?? 0)
  const [penalB, setPenalB] = useState<number>(partido.penal_b ?? 0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fecha = new Date(partido.fecha)
  const fmtDate = fecha.toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit', month: 'short' })
  const fmtTime = fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  const noHaIniciado = fecha.getTime() > Date.now()
  const esEliminacion = partido.fase !== 'grupos'
  const requierePenales = esEliminacion && golesA === golesB

  const handleGuardar = async () => {
    setError('')
    if (requierePenales && penalA === penalB) {
      setError('La tanda de penales no puede terminar en empate')
      return
    }
    setSaving(true)
    try {
      await setResultadoPartido(partido.id_partido, {
        golesA,
        golesB,
        idUsuario,
        penalA: requierePenales ? penalA : null,
        penalB: requierePenales ? penalB : null
      })
      onGuardado()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar el resultado')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="rounded-2xl p-4 space-y-3"
      style={{ background: '#0D1B2A', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center justify-between text-xs" style={{ color: '#6B7280' }}>
        <span>{partido.estadio ?? partido.ciudad ?? '—'}</span>
        {partido.estado === 'en_vivo' ? (
          <span className="font-bold tracking-widest" style={{ color: '#F87171' }}>● EN VIVO</span>
        ) : (
          <span>{fmtDate} {fmtTime}</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="flex-1 text-sm font-semibold text-white text-center">{partido.equipo_a}</span>

        <div className="flex items-center gap-2 px-2 shrink-0">
          <ScoreInput value={golesA} onChange={setGolesA} color="#4ADE80" disabled={!!readOnly || saving || noHaIniciado} />
          <span className="text-gray-600 font-black">—</span>
          <ScoreInput value={golesB} onChange={setGolesB} color="#F87171" disabled={!!readOnly || saving || noHaIniciado} />
        </div>

        <span className="flex-1 text-sm font-semibold text-white text-center">{partido.equipo_b}</span>
      </div>

      {requierePenales && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-center uppercase tracking-widest" style={{ color: '#D4AF37' }}>
            Empate · Marcador en penales
          </p>
          <div className="flex items-center justify-center gap-2">
            <ScoreInput value={penalA} onChange={setPenalA} color="#D4AF37" disabled={!!readOnly || saving || noHaIniciado} />
            <span className="text-gray-600 font-black">—</span>
            <ScoreInput value={penalB} onChange={setPenalB} color="#D4AF37" disabled={!!readOnly || saving || noHaIniciado} />
          </div>
        </div>
      )}

      {!readOnly && (
        <>
          {error && <p className="text-xs text-center" style={{ color: '#F87171' }}>{error}</p>}
          {noHaIniciado ? (
            <p className="text-xs text-center" style={{ color: '#6B7280' }}>
              Disponible cuando inicie el partido ({fmtDate} {fmtTime})
            </p>
          ) : (
            <button
              onClick={handleGuardar}
              disabled={saving}
              className="w-full py-2 rounded-xl text-sm font-bold transition-all hover:scale-[1.01]"
              style={{
                background: saving ? '#374151' : 'linear-gradient(135deg, #006847, #16A34A)',
                color: 'white',
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              {saving ? 'Guardando...' : 'Guardar resultado'}
            </button>
          )}
        </>
      )}
    </div>
  )
}

function ScoreInput ({
  value, onChange, color, disabled
}: {
  value: number
  onChange: (v: number) => void
  color: string
  disabled: boolean
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      pattern="[0-9]*"
      min={0}
      max={20}
      value={value}
      onChange={e => onChange(Math.max(0, Math.min(20, Number(e.target.value))))}
      onFocus={e => e.target.select()}
      disabled={disabled}
      className="w-12 h-12 text-center text-xl font-black rounded-xl focus:outline-none"
      style={{
        background: `${color}15`,
        color,
        border: `2px solid ${color}44`,
        WebkitAppearance: 'none',
        MozAppearance: 'textfield'
      }}
    />
  )
}
