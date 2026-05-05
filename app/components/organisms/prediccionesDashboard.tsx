'use client'

import { useEffect, useState } from 'react'
import AppSidebar from '@/app/components/layout/appSidebar'
import PrediccionCard from '@/app/components/molecules/prediccionCard'
import { getUsuarioInfo } from '@/services/usuario.service'
import { getPartidos } from '@/services/partidos.service'
import { getPronosticos } from '@/services/pronosticos.service'

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
}

interface Pronostico {
  id_pronostico: string
  id_partido: string
  goles_a_pred: number
  goles_b_pred: number
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

const FASE_ORDER = ['grupos', 'dieciseisavos', 'octavos', 'cuartos', 'semifinal', 'tercer_lugar', 'final']
const FASE_LABEL: Record<string, string> = {
  grupos: 'Fase de Grupos',
  dieciseisavos: 'Dieciseisavos',
  octavos: 'Octavos de Final',
  cuartos: 'Cuartos de Final',
  semifinal: 'Semifinal',
  tercer_lugar: 'Tercer Lugar',
  final: 'Gran Final'
}

export default function PrediccionesDashboard ({ idUsuario }: { idUsuario: string }) {
  const [quinielas, setQuinielas] = useState<Quiniela[]>([])
  const [selectedQuiniela, setSelectedQuiniela] = useState<Quiniela | null>(null)
  const [partidos, setPartidos] = useState<Partido[]>([])
  const [pronosticos, setPronosticos] = useState<Record<string, Pronostico>>({})
  const [loadingQuinielas, setLoadingQuinielas] = useState(true)
  const [loadingPartidos, setLoadingPartidos] = useState(false)

  // Cargar quinielas del usuario
  useEffect(() => {
    getUsuarioInfo(idUsuario)
      .then((res: { quinielas: QuinielaUsuario[] }) => {
        const qs = (res.quinielas ?? [])
          .map(q => q.quinielas)
          .filter((q): q is Quiniela => q !== null && q.estado === 'abierta')
        setQuinielas(qs)
        if (qs.length > 0) setSelectedQuiniela(qs[0])
        setLoadingQuinielas(false)
      })
      .catch(() => setLoadingQuinielas(false))
  }, [idUsuario])

  // Cargar partidos + pronósticos cuando cambia la quiniela
  useEffect(() => {
    if (!selectedQuiniela) return
    setLoadingPartidos(true)

    Promise.all([
      getPartidos(),
      getPronosticos(idUsuario, selectedQuiniela.id_quiniela)
    ])
      .then(([pRes, prRes]: [
        { partidos: Partido[] },
        { pronosticos: Pronostico[] }
      ]) => {
        setPartidos(pRes.partidos ?? [])
        const map: Record<string, Pronostico> = {}
        for (const p of prRes.pronosticos ?? []) {
          map[p.id_partido] = p
        }
        setPronosticos(map)
        setLoadingPartidos(false)
      })
      .catch(() => setLoadingPartidos(false))
  }, [idUsuario, selectedQuiniela])

  // Agrupar partidos por fase → grupo
  const byFase = FASE_ORDER.reduce<Record<string, Partido[]>>((acc, fase) => {
    const list = partidos.filter(p => p.fase === fase)
    if (list.length > 0) acc[fase] = list
    return acc
  }, {})

  const totalPendientes = partidos.filter(p => p.estado === 'pendiente').length
  const totalPredichos = partidos.filter(p => pronosticos[p.id_partido]).length

  return (
    <div className="flex min-h-screen" style={{ background: '#060E1E' }}>
      <AppSidebar />

      <main className="flex-1 px-4 pt-20 pb-6 md:py-6 sm:px-6 lg:px-8 overflow-auto">
        <div className="mx-auto max-w-5xl space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Predicciones</h1>
              <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
                Ingresa tus pronósticos para cada partido
              </p>
            </div>
            <span className="text-4xl">🎯</span>
          </div>

          {/* Selector de quiniela */}
          {loadingQuinielas ? (
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 w-32 rounded-xl animate-pulse" style={{ background: '#0D1B2A' }} />
              ))}
            </div>
          ) : quinielas.length === 0 ? (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: '#0D1B2A', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <p className="text-4xl mb-3">🏆</p>
              <p className="font-semibold text-white">No tienes quinielas activas</p>
              <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
                Crea o únete a una quiniela desde la pantalla de inicio
              </p>
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

          {/* Progreso */}
          {selectedQuiniela && !loadingPartidos && partidos.length > 0 && (
            <div
              className="rounded-2xl p-5 grid grid-cols-3 gap-4"
              style={{ background: '#0D1B2A', border: '1px solid rgba(74,222,128,0.15)' }}
            >
              <div className="text-center">
                <p className="text-2xl font-black" style={{ color: '#4ADE80' }}>{totalPredichos}</p>
                <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>Predichos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black" style={{ color: '#60A5FA' }}>{totalPendientes}</p>
                <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>Disponibles</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black" style={{ color: '#F87171' }}>{partidos.length}</p>
                <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>Total partidos</p>
              </div>
            </div>
          )}

          {/* Loading partidos */}
          {loadingPartidos && (
            <div className="py-16 text-center">
              <p className="text-5xl animate-pulse mb-3">⚽</p>
              <p className="text-sm tracking-widest uppercase" style={{ color: '#4ADE80' }}>Cargando partidos...</p>
            </div>
          )}

          {/* Partidos por fase */}
          {!loadingPartidos && selectedQuiniela && Object.entries(byFase).map(([fase, listaFase]) => {
            const poreGrupo = fase === 'grupos'
              ? listaFase.reduce<Record<string, Partido[]>>((acc, p) => {
                  const g = p.grupo ?? 'SIN GRUPO'
                  if (!acc[g]) acc[g] = []
                  acc[g].push(p)
                  return acc
                }, {})
              : null

            return (
              <section key={fase} className="space-y-4">
                {/* Fase header */}
                <div
                  className="flex items-center gap-3 rounded-xl px-5 py-3"
                  style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)' }}
                >
                  <div className="w-2 h-6 rounded-full" style={{ background: '#4ADE80' }} />
                  <h2 className="text-base font-black text-white">{FASE_LABEL[fase] ?? fase}</h2>
                  <span className="ml-auto text-xs" style={{ color: '#4ADE80' }}>
                    {listaFase.length} partidos
                  </span>
                </div>

                {poreGrupo
                  ? Object.keys(poreGrupo).sort().map(grupo => (
                    <div key={grupo} className="space-y-3">
                      <p className="text-xs font-bold uppercase tracking-widest px-1" style={{ color: '#6B7280' }}>
                        Grupo {grupo}
                      </p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {poreGrupo[grupo].map(p => (
                          <PrediccionCard
                            key={p.id_partido}
                            idQuiniela={selectedQuiniela.id_quiniela}
                            idUsuario={idUsuario}
                            idPartido={p.id_partido}
                            equipoA={p.equipo_a}
                            equipoB={p.equipo_b}
                            escudoA={p.escudo_a}
                            escudoB={p.escudo_b}
                            fecha={p.fecha}
                            estadio={p.estadio}
                            ciudad={p.ciudad}
                            estado={p.estado}
                            grupo={p.grupo}
                            jornada={p.jornada}
                            predExistente={
                              pronosticos[p.id_partido]
                                ? { golesA: pronosticos[p.id_partido].goles_a_pred, golesB: pronosticos[p.id_partido].goles_b_pred }
                                : null
                            }
                            resultadoFinal={
                              p.goles_a !== null && p.goles_b !== null
                                ? { golesA: p.goles_a, golesB: p.goles_b }
                                : null
                            }
                          />
                        ))}
                      </div>
                    </div>
                  ))
                  : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {listaFase.map(p => (
                        <PrediccionCard
                          key={p.id_partido}
                          idQuiniela={selectedQuiniela.id_quiniela}
                          idUsuario={idUsuario}
                          idPartido={p.id_partido}
                          equipoA={p.equipo_a}
                          equipoB={p.equipo_b}
                          escudoA={p.escudo_a}
                          escudoB={p.escudo_b}
                          fecha={p.fecha}
                          estadio={p.estadio}
                          ciudad={p.ciudad}
                          estado={p.estado}
                          grupo={p.grupo}
                          jornada={p.jornada}
                          predExistente={
                            pronosticos[p.id_partido]
                              ? { golesA: pronosticos[p.id_partido].goles_a_pred, golesB: pronosticos[p.id_partido].goles_b_pred }
                              : null
                          }
                          resultadoFinal={
                            p.goles_a !== null && p.goles_b !== null
                              ? { golesA: p.goles_a, golesB: p.goles_b }
                              : null
                          }
                        />
                      ))}
                    </div>
                  )
                }
              </section>
            )
          })}
        </div>
      </main>
    </div>
  )
}
