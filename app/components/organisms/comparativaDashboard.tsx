'use client'

import { useEffect, useState } from 'react'
import AppSidebar from '@/app/components/layout/appSidebar'
import { getUsuarioInfo } from '@/services/usuario.service'
import { getPartidos } from '@/services/partidos.service'
import { getPronosticosQuiniela } from '@/services/pronosticos.service'
import { getParticipantes } from '@/services/quiniela.service'

interface Partido {
  id_partido: string
  equipo_a: string
  equipo_b: string
  escudo_a: string | null
  escudo_b: string | null
  goles_a: number | null
  goles_b: number | null
  fecha: string
  grupo: string | null
  estado: string
}

interface PronosticoTodos {
  id_pronostico: string
  id_partido: string
  id_usuario: string
  goles_a_pred: number
  goles_b_pred: number
  puntos_obtenidos: number | null
}

interface Quiniela {
  id_quiniela: string
  nombre: string
  estado: string
}

interface QuinielaUsuario {
  id_quiniela_usuario: string
  quinielas: Quiniela | null
}

interface Participante {
  id_quiniela_usuario: string
  puntos: number
  usuarios: { id_random: string; username: string; nombre: string | null } | null
}

function puntosColor (pts: number | null) {
  if (pts === 3) return { color: '#D4AF37', bg: 'rgba(212,175,55,0.15)' }
  if (pts === 1) return { color: '#4ADE80', bg: 'rgba(74,222,128,0.12)' }
  return { color: '#6B7280', bg: 'rgba(107,114,128,0.08)' }
}

function TeamShield ({ url, name }: { url?: string | null; name: string }) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className="w-8 h-8 object-contain"
        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
      />
    )
  }
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
      style={{ background: 'rgba(255,255,255,0.07)', color: '#9CA3AF' }}
    >
      {name.charAt(0)}
    </div>
  )
}

function PartidoComparativaCard ({
  partido, participantes, pronosticosPartido
}: {
  partido: Partido
  participantes: Participante[]
  pronosticosPartido: Map<string, PronosticoTodos>
}) {
  const fecha = new Date(partido.fecha)
  const fmtDate = fecha.toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit', month: 'short' })

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: '#0D1B2A', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Header: partido + resultado real */}
      <div
        className="px-4 py-3 flex items-center gap-3"
        style={{ background: 'rgba(0,0,0,0.25)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <TeamShield url={partido.escudo_a} name={partido.equipo_a} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{partido.equipo_a} vs {partido.equipo_b}</p>
          <p className="text-[11px]" style={{ color: '#6B7280' }}>
            {partido.grupo ? `Grupo ${partido.grupo} · ` : ''}{fmtDate}
          </p>
        </div>
        <TeamShield url={partido.escudo_b} name={partido.equipo_b} />
        <div
          className="shrink-0 rounded-xl px-3 py-1.5 text-center"
          style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)' }}
        >
          <p className="text-[9px] uppercase tracking-widest" style={{ color: '#4ADE80' }}>Final</p>
          <p className="text-sm font-black text-white">{partido.goles_a} — {partido.goles_b}</p>
        </div>
      </div>

      {/* Predicciones de cada jugador */}
      <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        {participantes.map(p => {
          const usuario = p.usuarios
          if (!usuario) return null
          const pron = pronosticosPartido.get(usuario.id_random)
          const paleta = puntosColor(pron?.puntos_obtenidos ?? null)

          return (
            <div key={p.id_quiniela_usuario} className="px-4 py-2.5 flex items-center gap-3">
              <span className="flex-1 text-sm font-semibold truncate" style={{ color: '#D1D5DB' }}>
                {usuario.username}
              </span>

              {pron ? (
                <>
                  <span className="text-sm font-bold" style={{ color: '#60A5FA' }}>
                    {pron.goles_a_pred} — {pron.goles_b_pred}
                  </span>
                  <span
                    className="shrink-0 w-9 text-center rounded-lg px-2 py-0.5 text-xs font-black"
                    style={{ color: paleta.color, background: paleta.bg }}
                  >
                    {pron.puntos_obtenidos ?? 0}
                  </span>
                </>
              ) : (
                <span className="text-xs" style={{ color: '#4B5563' }}>Sin predicción</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function ComparativaDashboard ({ idUsuario }: { idUsuario: string }) {
  const [quinielas, setQuinielas] = useState<Quiniela[]>([])
  const [selectedQuiniela, setSelectedQuiniela] = useState<Quiniela | null>(null)
  const [partidos, setPartidos] = useState<Partido[]>([])
  const [participantes, setParticipantes] = useState<Participante[]>([])
  const [pronosticos, setPronosticos] = useState<PronosticoTodos[]>([])
  const [loadingQuinielas, setLoadingQuinielas] = useState(true)
  const [loadingDatos, setLoadingDatos] = useState(false)

  useEffect(() => {
    getUsuarioInfo(idUsuario)
      .then((res: { quinielas: QuinielaUsuario[] }) => {
        const qs = (res.quinielas ?? [])
          .map(q => q.quinielas)
          .filter((q): q is Quiniela => q !== null)
        setQuinielas(qs)
        if (qs.length > 0) setSelectedQuiniela(qs[0])
        setLoadingQuinielas(false)
      })
      .catch(() => setLoadingQuinielas(false))
  }, [idUsuario])

  useEffect(() => {
    if (!selectedQuiniela) return
    setLoadingDatos(true)

    Promise.all([
      getPartidos(),
      getParticipantes(selectedQuiniela.id_quiniela),
      getPronosticosQuiniela(selectedQuiniela.id_quiniela)
    ])
      .then(([pRes, partRes, pronRes]: [
        { partidos: Partido[] },
        { participantes: Participante[] },
        { pronosticos: PronosticoTodos[] }
      ]) => {
        setPartidos(pRes.partidos ?? [])
        setParticipantes(partRes.participantes ?? [])
        setPronosticos(pronRes.pronosticos ?? [])
        setLoadingDatos(false)
      })
      .catch(() => setLoadingDatos(false))
  }, [selectedQuiniela])

  const finalizados = partidos
    .filter(p => p.estado === 'finalizado')
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

  const pronosticosPorPartido = new Map<string, Map<string, PronosticoTodos>>()
  for (const pron of pronosticos) {
    if (!pronosticosPorPartido.has(pron.id_partido)) {
      pronosticosPorPartido.set(pron.id_partido, new Map())
    }
    pronosticosPorPartido.get(pron.id_partido)!.set(pron.id_usuario, pron)
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#060E1E' }}>
      <AppSidebar />

      <main className="flex-1 px-4 pt-20 pb-6 md:py-6 sm:px-6 lg:px-8 overflow-auto">
        <div className="mx-auto max-w-3xl space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Comparativa</h1>
              <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
                Predicciones de todos los jugadores y puntos obtenidos
              </p>
            </div>
            <span className="text-4xl">👥</span>
          </div>

          {/* Selector quiniela */}
          {loadingQuinielas ? (
            <div className="flex gap-2">
              {[1, 2].map(i => (
                <div key={i} className="h-10 w-32 rounded-xl animate-pulse" style={{ background: '#0D1B2A' }} />
              ))}
            </div>
          ) : quinielas.length === 0 ? (
            <div className="rounded-2xl p-8 text-center" style={{ background: '#0D1B2A', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-4xl mb-3">🏆</p>
              <p className="font-semibold text-white">No tienes quinielas</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {quinielas.map(q => {
                const active = selectedQuiniela?.id_quiniela === q.id_quiniela
                return (
                  <button
                    key={q.id_quiniela}
                    onClick={() => setSelectedQuiniela(q)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                    style={{
                      background: active ? 'linear-gradient(135deg, #006847, #16A34A)' : '#0D1B2A',
                      color: active ? 'white' : '#9CA3AF',
                      border: active ? 'none' : '1px solid rgba(255,255,255,0.08)'
                    }}
                  >
                    {q.nombre}
                  </button>
                )
              })}
            </div>
          )}

          {/* Loading */}
          {loadingDatos && (
            <div className="py-16 text-center">
              <p className="text-5xl animate-pulse mb-3">👥</p>
              <p className="text-sm tracking-widest uppercase" style={{ color: '#D4AF37' }}>Cargando...</p>
            </div>
          )}

          {/* Sin partidos finalizados */}
          {!loadingDatos && selectedQuiniela && finalizados.length === 0 && (
            <div className="rounded-2xl p-8 text-center" style={{ background: '#0D1B2A', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-4xl mb-3">⏳</p>
              <p className="font-semibold text-white">Aún no hay partidos finalizados</p>
              <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
                Aquí verás las predicciones de todos los jugadores cuando los partidos terminen
              </p>
            </div>
          )}

          {/* Lista de partidos finalizados con comparativa */}
          {!loadingDatos && finalizados.length > 0 && (
            <div className="space-y-3">
              {finalizados.map(p => (
                <PartidoComparativaCard
                  key={p.id_partido}
                  partido={p}
                  participantes={participantes}
                  pronosticosPartido={pronosticosPorPartido.get(p.id_partido) ?? new Map()}
                />
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
