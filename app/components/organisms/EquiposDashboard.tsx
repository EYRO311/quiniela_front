'use client'

import { useEffect, useState } from 'react'
import AppSidebar from '@/app/components/layout/appSidebar'
import { getEquipos, getJugadoresEquipo } from '@/services/equipos.service'

interface Equipo {
  id_equipo: string
  nombre_pais: string
  escudo_url: string | null
  bandera_url: string | null
  codigo_fifa: string | null
  grupo: string | null
}

interface Jugador {
  id_jugador: string
  numero: number
  nombre: string
  posicion: string
  goles: number
  asistencias: number
  tarjetas_amarillas: number
  tarjetas_rojas: number
  lesionado: boolean
  suspendido: boolean
}

const POSICION_ORDER = ['Portero', 'Defensa', 'Mediocampista', 'Delantero']

export default function EquiposDashboard () {
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [seleccionado, setSeleccionado] = useState<Equipo | null>(null)

  useEffect(() => {
    getEquipos()
      .then((res: { equipos: Equipo[] }) => setEquipos(res.equipos ?? []))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Error al cargar equipos'))
      .finally(() => setLoading(false))
  }, [])

  const porGrupo = equipos.reduce<Record<string, Equipo[]>>((acc, e) => {
    const g = e.grupo ?? 'SIN GRUPO'
    if (!acc[g]) acc[g] = []
    acc[g].push(e)
    return acc
  }, {})

  return (
    <div className="flex min-h-screen" style={{ background: '#060E1E' }}>
      <AppSidebar />

      <main className="flex-1 px-4 pt-20 pb-6 md:py-6 sm:px-6 lg:px-8 overflow-auto">
        <div className="mx-auto max-w-5xl space-y-6">

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Equipos</h1>
              <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
                Selecciona un equipo para ver su plantilla de jugadores
              </p>
            </div>
            <span className="text-4xl">🏳️</span>
          </div>

          {error && (
            <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {loading && (
            <div className="flex justify-center py-20">
              <div className="text-center space-y-3">
                <div className="text-5xl animate-pulse">⚽</div>
                <p className="text-sm tracking-widest uppercase" style={{ color: '#4ADE80' }}>Cargando equipos...</p>
              </div>
            </div>
          )}

          {!loading && Object.keys(porGrupo).sort().map(grupo => (
            <section key={grupo} className="space-y-3">
              <div
                className="flex items-center gap-3 rounded-xl px-5 py-3"
                style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)' }}
              >
                <div className="w-2 h-6 rounded-full" style={{ background: '#4ADE80' }} />
                <h2 className="text-base font-black text-white">Grupo {grupo}</h2>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {porGrupo[grupo].map(e => (
                  <button
                    key={e.id_equipo}
                    onClick={() => setSeleccionado(e)}
                    className="rounded-2xl p-4 flex flex-col items-center gap-2 text-center transition-all hover:scale-[1.03]"
                    style={{ background: '#0D1B2A', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <EscudoEquipo url={e.escudo_url} nombre={e.nombre_pais} />
                    <p className="text-sm font-semibold text-white leading-tight">{e.nombre_pais}</p>
                    {e.codigo_fifa && (
                      <span className="text-[10px] font-bold tracking-widest" style={{ color: '#6B7280' }}>{e.codigo_fifa}</span>
                    )}
                  </button>
                ))}
              </div>
            </section>
          ))}

        </div>
      </main>

      {seleccionado && (
        <PlantillaModal equipo={seleccionado} onClose={() => setSeleccionado(null)} />
      )}
    </div>
  )
}

function EscudoEquipo ({ url, nombre }: { url: string | null; nombre: string }) {
  if (url) {
    return (
      <img
        src={url}
        alt={nombre}
        className="w-12 h-12 object-contain rounded"
        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
      />
    )
  }
  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black"
      style={{ background: 'rgba(255,255,255,0.07)', color: '#9CA3AF' }}
    >
      {nombre.charAt(0)}
    </div>
  )
}

function PlantillaModal ({ equipo, onClose }: { equipo: Equipo; onClose: () => void }) {
  const [jugadores, setJugadores] = useState<Jugador[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getJugadoresEquipo(equipo.id_equipo)
      .then((res: { jugadores: Jugador[] }) => setJugadores(res.jugadores ?? []))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Error al cargar jugadores'))
      .finally(() => setLoading(false))
  }, [equipo.id_equipo])

  const porPosicion = POSICION_ORDER.reduce<Record<string, Jugador[]>>((acc, pos) => {
    const list = jugadores.filter(j => j.posicion === pos)
    if (list.length > 0) acc[pos] = list
    return acc
  }, {})

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(6,14,30,0.75)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl p-5 space-y-4"
        style={{ background: '#0D1B2A', border: '1px solid rgba(255,255,255,0.08)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <EscudoEquipo url={equipo.escudo_url} nombre={equipo.nombre_pais} />
            <div>
              <h3 className="text-lg font-black text-white">{equipo.nombre_pais}</h3>
              {equipo.grupo && <p className="text-xs" style={{ color: '#6B7280' }}>Grupo {equipo.grupo}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
          </button>
        </div>

        {error && <p className="text-sm text-center" style={{ color: '#F87171' }}>{error}</p>}

        {loading && (
          <div className="py-10 text-center">
            <p className="text-3xl animate-pulse mb-2">⚽</p>
            <p className="text-xs tracking-widest uppercase" style={{ color: '#4ADE80' }}>Cargando plantilla...</p>
          </div>
        )}

        {!loading && jugadores.length === 0 && !error && (
          <p className="text-sm text-center py-6" style={{ color: '#6B7280' }}>Aún no hay jugadores registrados para este equipo.</p>
        )}

        {!loading && POSICION_ORDER.map(pos => porPosicion[pos] && (
          <div key={pos} className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest px-1" style={{ color: '#D4AF37' }}>{pos}</p>
            <div className="space-y-1">
              {porPosicion[pos].map(j => (
                <div
                  key={j.id_jugador}
                  className="flex items-center gap-3 rounded-xl px-3 py-2"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                    style={{ background: 'rgba(74,222,128,0.1)', color: '#4ADE80' }}
                  >
                    {j.numero}
                  </span>
                  <span className="flex-1 text-sm font-semibold text-white truncate">{j.nombre}</span>
                  <div className="flex items-center gap-2 text-xs shrink-0" style={{ color: '#6B7280' }}>
                    {j.goles > 0 && <span>⚽ {j.goles}</span>}
                    {j.asistencias > 0 && <span>🎯 {j.asistencias}</span>}
                    {j.tarjetas_amarillas > 0 && <span style={{ color: '#FACC15' }}>🟨 {j.tarjetas_amarillas}</span>}
                    {j.tarjetas_rojas > 0 && <span style={{ color: '#F87171' }}>🟥 {j.tarjetas_rojas}</span>}
                    {j.lesionado && <span title="Lesionado">🩹</span>}
                    {j.suspendido && <span title="Suspendido">⛔</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
