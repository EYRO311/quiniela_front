'use client'

import { useEffect, useState } from 'react'
import AppSidebar from '@/app/components/layout/appSidebar'
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
  estado: string
}

interface Pronostico {
  id_pronostico: string
  id_partido: string
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

interface PartidoConPred {
  partido: Partido
  pronostico: Pronostico
}

function puntosColor (pts: number | null) {
  if (pts === 3) return { color: '#D4AF37', bg: 'rgba(212,175,55,0.15)', border: 'rgba(212,175,55,0.35)' }
  if (pts === 1) return { color: '#4ADE80', bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.3)' }
  return { color: '#6B7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.2)' }
}

function puntosLabel (pts: number | null) {
  if (pts === 3) return 'Exacto'
  if (pts === 1) return 'Correcto'
  if (pts === 0) return 'Fallado'
  return '—'
}

function TeamShield ({ url, name }: { url?: string | null; name: string }) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className="w-9 h-9 object-contain"
        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
      />
    )
  }
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black"
      style={{ background: 'rgba(255,255,255,0.07)', color: '#9CA3AF' }}
    >
      {name.charAt(0)}
    </div>
  )
}

function PartidoResultadoCard ({ partido, pronostico }: PartidoConPred) {
  const pts = pronostico.puntos_obtenidos
  const paleta = puntosColor(pts)
  const finalizado = partido.estado === 'finalizado'
  const enVivo = partido.estado === 'en_vivo'

  const fecha = new Date(partido.fecha)
  const fmtDate = fecha.toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit', month: 'short' })
  const fmtTime = fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#0D1B2A',
        border: finalizado
          ? `1px solid ${paleta.border}`
          : enVivo
          ? '1px solid rgba(239,68,68,0.3)'
          : '1px solid rgba(255,255,255,0.07)'
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-2 flex items-center justify-between gap-2"
        style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <span className="text-xs truncate" style={{ color: '#6B7280' }}>
          {partido.grupo ? `Grupo ${partido.grupo} · ` : ''}{fmtDate} {fmtTime}
        </span>
        {enVivo && (
          <span className="text-[10px] font-bold shrink-0" style={{ color: '#EF4444' }}>● EN VIVO</span>
        )}
        {finalizado && (
          <span
            className="text-[10px] font-bold shrink-0 rounded-full px-2 py-0.5"
            style={{ color: paleta.color, background: paleta.bg }}
          >
            {puntosLabel(pts)}
          </span>
        )}
      </div>

      {/* Contenido */}
      <div className="px-4 py-4 flex items-center gap-3">

        {/* Equipo A */}
        <div className="flex-1 flex flex-col items-center gap-1.5 text-center min-w-0">
          <TeamShield url={partido.escudo_a} name={partido.equipo_a} />
          <p className="text-xs font-semibold text-white leading-tight line-clamp-2">{partido.equipo_a}</p>
        </div>

        {/* Scores */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          {/* Tu predicción */}
          <div className="flex items-center gap-1.5">
            <span
              className="w-9 h-9 flex items-center justify-center text-lg font-black rounded-xl"
              style={{ color: '#60A5FA', background: 'rgba(96,165,250,0.1)' }}
            >
              {pronostico.goles_a_pred}
            </span>
            <span className="text-xs font-black" style={{ color: '#374151' }}>—</span>
            <span
              className="w-9 h-9 flex items-center justify-center text-lg font-black rounded-xl"
              style={{ color: '#60A5FA', background: 'rgba(96,165,250,0.1)' }}
            >
              {pronostico.goles_b_pred}
            </span>
          </div>
          <span className="text-[9px] uppercase tracking-widest" style={{ color: '#4B5563' }}>Tu pred.</span>

          {/* Resultado real */}
          {finalizado && partido.goles_a !== null && partido.goles_b !== null && (
            <>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-9 h-9 flex items-center justify-center text-lg font-black rounded-xl"
                  style={{ color: paleta.color, background: paleta.bg }}
                >
                  {partido.goles_a}
                </span>
                <span className="text-xs font-black" style={{ color: '#374151' }}>—</span>
                <span
                  className="w-9 h-9 flex items-center justify-center text-lg font-black rounded-xl"
                  style={{ color: paleta.color, background: paleta.bg }}
                >
                  {partido.goles_b}
                </span>
              </div>
              <span className="text-[9px] uppercase tracking-widest" style={{ color: '#4B5563' }}>Real</span>
            </>
          )}

          {enVivo && partido.goles_a !== null && partido.goles_b !== null && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-9 h-9 flex items-center justify-center text-lg font-black rounded-xl" style={{ color: '#EF4444', background: 'rgba(239,68,68,0.1)' }}>
                  {partido.goles_a}
                </span>
                <span className="text-xs font-black" style={{ color: '#374151' }}>—</span>
                <span className="w-9 h-9 flex items-center justify-center text-lg font-black rounded-xl" style={{ color: '#EF4444', background: 'rgba(239,68,68,0.1)' }}>
                  {partido.goles_b}
                </span>
              </div>
              <span className="text-[9px] uppercase tracking-widest animate-pulse" style={{ color: '#EF4444' }}>En vivo</span>
            </>
          )}

          {!finalizado && !enVivo && (
            <span className="text-[10px]" style={{ color: '#4B5563' }}>Pendiente</span>
          )}
        </div>

        {/* Equipo B */}
        <div className="flex-1 flex flex-col items-center gap-1.5 text-center min-w-0">
          <TeamShield url={partido.escudo_b} name={partido.equipo_b} />
          <p className="text-xs font-semibold text-white leading-tight line-clamp-2">{partido.equipo_b}</p>
        </div>

        {/* Badge de puntos (solo finalizados) */}
        {finalizado && (
          <div
            className="shrink-0 w-12 h-12 rounded-2xl flex flex-col items-center justify-center gap-0.5"
            style={{ background: paleta.bg, border: `1px solid ${paleta.border}` }}
          >
            <span className="text-xl font-black leading-none" style={{ color: paleta.color }}>
              {pts ?? 0}
            </span>
            <span className="text-[8px] font-bold uppercase tracking-wide" style={{ color: paleta.color }}>
              pts
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MisPuntosDashboard ({ idUsuario }: { idUsuario: string }) {
  const [quinielas, setQuinielas] = useState<Quiniela[]>([])
  const [selectedQuiniela, setSelectedQuiniela] = useState<Quiniela | null>(null)
  const [items, setItems] = useState<PartidoConPred[]>([])
  const [loadingQuinielas, setLoadingQuinielas] = useState(true)
  const [loadingPartidos, setLoadingPartidos] = useState(false)
  const [filtro, setFiltro] = useState<'finalizados' | 'todos'>('finalizados')

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
    setLoadingPartidos(true)

    Promise.all([
      getPartidos(),
      getPronosticos(idUsuario, selectedQuiniela.id_quiniela)
    ])
      .then(([pRes, prRes]: [
        { partidos: Partido[] },
        { pronosticos: Pronostico[] }
      ]) => {
        const pronMap = new Map<string, Pronostico>()
        for (const p of prRes.pronosticos ?? []) pronMap.set(p.id_partido, p)

        const combinados: PartidoConPred[] = (pRes.partidos ?? [])
          .filter(p => pronMap.has(p.id_partido))
          .map(p => ({ partido: p, pronostico: pronMap.get(p.id_partido)! }))
          .sort((a, b) => new Date(a.partido.fecha).getTime() - new Date(b.partido.fecha).getTime())

        setItems(combinados)
        setLoadingPartidos(false)
      })
      .catch(() => setLoadingPartidos(false))
  }, [idUsuario, selectedQuiniela])

  const finalizados = items.filter(i => i.partido.estado === 'finalizado')
  const pendientes = items.filter(i => i.partido.estado !== 'finalizado')
  const visibles = filtro === 'finalizados' ? finalizados : items

  const totalPts = finalizados.reduce((s, i) => s + (i.pronostico.puntos_obtenidos ?? 0), 0)
  const exactos = finalizados.filter(i => i.pronostico.puntos_obtenidos === 3).length
  const correctos = finalizados.filter(i => i.pronostico.puntos_obtenidos === 1).length
  const fallados = finalizados.filter(i => (i.pronostico.puntos_obtenidos ?? 0) === 0).length

  return (
    <div className="flex min-h-screen" style={{ background: '#060E1E' }}>
      <AppSidebar />

      <main className="flex-1 px-4 pt-20 pb-6 md:py-6 sm:px-6 lg:px-8 overflow-auto">
        <div className="mx-auto max-w-4xl space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Mis Puntos</h1>
              <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
                Tus predicciones y puntos por partido
              </p>
            </div>
            <span className="text-4xl">📊</span>
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

          {/* Resumen de puntos */}
          {!loadingPartidos && finalizados.length > 0 && (
            <div
              className="rounded-2xl p-5 grid grid-cols-4 gap-4"
              style={{ background: '#0D1B2A', border: '1px solid rgba(212,175,55,0.2)' }}
            >
              <div className="text-center">
                <p className="text-2xl font-black" style={{ color: '#D4AF37' }}>{totalPts}</p>
                <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>Total pts</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black" style={{ color: '#D4AF37' }}>{exactos}</p>
                <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>Exactos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black" style={{ color: '#4ADE80' }}>{correctos}</p>
                <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>Correctos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black" style={{ color: '#6B7280' }}>{fallados}</p>
                <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>Fallados</p>
              </div>
            </div>
          )}

          {/* Filtro */}
          {!loadingPartidos && items.length > 0 && (
            <div className="flex gap-2">
              {([
                { id: 'finalizados', label: `✅ Finalizados (${finalizados.length})` },
                { id: 'todos', label: `🗂️ Todos (${items.length})` }
              ] as { id: 'finalizados' | 'todos'; label: string }[]).map(opt => {
                const active = filtro === opt.id
                return (
                  <button
                    key={opt.id}
                    onClick={() => setFiltro(opt.id)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                    style={{
                      background: active ? 'linear-gradient(135deg, #006847, #16A34A)' : '#0D1B2A',
                      color: active ? 'white' : '#9CA3AF',
                      border: active ? 'none' : '1px solid rgba(255,255,255,0.08)'
                    }}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          )}

          {/* Loading */}
          {loadingPartidos && (
            <div className="py-16 text-center">
              <p className="text-5xl animate-pulse mb-3">📊</p>
              <p className="text-sm tracking-widest uppercase" style={{ color: '#D4AF37' }}>Cargando...</p>
            </div>
          )}

          {/* Sin predicciones */}
          {!loadingPartidos && items.length === 0 && selectedQuiniela && (
            <div className="rounded-2xl p-8 text-center" style={{ background: '#0D1B2A', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-4xl mb-3">🎯</p>
              <p className="font-semibold text-white">Aún no tienes predicciones</p>
              <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Ve a Predicciones para ingresar tus pronósticos</p>
            </div>
          )}

          {/* Sin finalizados */}
          {!loadingPartidos && filtro === 'finalizados' && finalizados.length === 0 && items.length > 0 && (
            <div className="rounded-2xl p-8 text-center" style={{ background: '#0D1B2A', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-4xl mb-3">⏳</p>
              <p className="font-semibold text-white">Ningún partido ha terminado aún</p>
              <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Los puntos aparecen cuando el partido finaliza</p>
            </div>
          )}

          {/* Lista de partidos */}
          {!loadingPartidos && visibles.length > 0 && (
            <>
              {/* Pendientes (solo en filtro "todos") */}
              {filtro === 'todos' && pendientes.length > 0 && (
                <section className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest px-1" style={{ color: '#6B7280' }}>
                    Pendientes · {pendientes.length}
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {pendientes.map(i => (
                      <PartidoResultadoCard key={i.partido.id_partido} partido={i.partido} pronostico={i.pronostico} />
                    ))}
                  </div>
                </section>
              )}

              {/* Finalizados */}
              {finalizados.length > 0 && (
                <section className="space-y-3">
                  {filtro === 'todos' && (
                    <p className="text-xs font-bold uppercase tracking-widest px-1" style={{ color: '#6B7280' }}>
                      Finalizados · {finalizados.length}
                    </p>
                  )}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {finalizados.map(i => (
                      <PartidoResultadoCard key={i.partido.id_partido} partido={i.partido} pronostico={i.pronostico} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

        </div>
      </main>
    </div>
  )
}
