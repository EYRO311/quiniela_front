'use client'

import { useEffect, useState } from 'react'
import { getUsuarioInfo } from '@/services/usuario.service'
import { getQuinielaRanking } from '@/services/quiniela.service'
import AppSidebar from '@/app/components/layout/appSidebar'
import RankingQuinielaCard from '@/app/components/molecules/rankingQuinielaCard'

interface RankingItem {
  id_ranking: string
  id_quiniela: string
  quiniela: string
  puntos: number
  aciertos_exactos: number
  aciertos_resultado: number
  posicion: number | null
}

interface RankingRow {
  id_ranking: string
  id_usuario: string
  username: string
  nombre: string | null
  puntos: number
  aciertos_exactos: number
  aciertos_resultado: number
  posicion: number | null
}

interface SelectedRanking {
  idQuiniela: string
  nombreQuiniela: string
}

const medalColor: Record<number, string> = { 1: '#D4AF37', 2: '#94A3B8', 3: '#CD7F32' }

export default function RankingsDashboard ({ idUsuario }: { idUsuario: string }) {
  const [rankings, setRankings] = useState<RankingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<SelectedRanking | null>(null)
  const [rankingRows, setRankingRows] = useState<RankingRow[]>([])
  const [loadingModal, setLoadingModal] = useState(false)

  useEffect(() => {
    getUsuarioInfo(idUsuario)
      .then((res: { rankings: RankingItem[] }) => {
        setRankings(res.rankings ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [idUsuario])

  const handleVerRanking = (idQuiniela: string, nombreQuiniela: string) => {
    setSelected({ idQuiniela, nombreQuiniela })
    setLoadingModal(true)
    getQuinielaRanking(idQuiniela)
      .then((res: { ranking: RankingRow[] }) => {
        setRankingRows(res.ranking ?? [])
        setLoadingModal(false)
      })
      .catch(() => setLoadingModal(false))
  }

  const totalPuntos = rankings.reduce((s, r) => s + r.puntos, 0)
  const mejorPos = rankings.length
    ? Math.min(...rankings.map(r => r.posicion ?? Infinity))
    : null

  return (
    <div className="flex min-h-screen" style={{ background: '#060E1E' }}>
      <AppSidebar />

      <main className="flex-1 px-4 pt-20 pb-6 md:py-6 sm:px-6 lg:px-8 overflow-auto">
        <div className="mx-auto max-w-5xl space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Mis Rankings</h1>
              <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
                Tus posiciones en cada quiniela activa
              </p>
            </div>
            <span className="text-4xl">📊</span>
          </div>

          {/* Resumen global */}
          {rankings.length > 0 && (
            <div
              className="rounded-2xl p-6 grid grid-cols-3 gap-4"
              style={{
                background: 'linear-gradient(135deg, #003d20 0%, #001f5c 50%, #8b0000 100%)',
                border: '1px solid rgba(74,222,128,0.2)'
              }}
            >
              <div className="text-center">
                <p className="text-3xl font-black" style={{ color: '#4ADE80' }}>{totalPuntos}</p>
                <p className="text-xs mt-1" style={{ color: '#6B7280' }}>Puntos totales</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black" style={{ color: '#60A5FA' }}>
                  {mejorPos && mejorPos !== Infinity ? `#${mejorPos}` : '—'}
                </p>
                <p className="text-xs mt-1" style={{ color: '#6B7280' }}>Mejor posición</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black" style={{ color: '#F87171' }}>{rankings.length}</p>
                <p className="text-xs mt-1" style={{ color: '#6B7280' }}>Quinielas</p>
              </div>
            </div>
          )}

          {/* Lista de rankings */}
          {loading && (
            <div className="py-20 text-center">
              <p className="text-5xl animate-pulse mb-3">⚽</p>
              <p className="text-sm tracking-widest uppercase" style={{ color: '#4ADE80' }}>Cargando...</p>
            </div>
          )}

          {!loading && rankings.length === 0 && (
            <div
              className="rounded-2xl p-12 text-center"
              style={{ background: '#0D1B2A', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <p className="text-5xl mb-4">📊</p>
              <p className="font-semibold text-white">Sin rankings disponibles</p>
              <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Participa en quinielas para ver tu posición</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {rankings.map(r => (
              <RankingQuinielaCard
                key={r.id_ranking}
                quiniela={r.quiniela}
                posicion={r.posicion}
                puntos={r.puntos}
                aciertosExactos={r.aciertos_exactos}
                aciertosResultado={r.aciertos_resultado}
                onVerRanking={() => handleVerRanking(r.id_quiniela, r.quiniela)}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Modal ranking completo */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(6,14,30,0.9)' }}
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: '#0D1B2A', border: '1px solid rgba(96,165,250,0.2)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header modal */}
            <div
              className="px-6 py-5"
              style={{ background: 'linear-gradient(135deg, #001f5c, #003d20)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#60A5FA' }}>
                    Ranking completo
                  </p>
                  <h2 className="text-xl font-black text-white">{selected.nombreQuiniela}</h2>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white text-xl">✕</button>
              </div>
            </div>

            {/* Filas */}
            <div className="px-4 py-4 max-h-96 overflow-y-auto space-y-2">
              {loadingModal && (
                <div className="py-10 text-center">
                  <p className="text-3xl animate-pulse mb-2">⚽</p>
                  <p className="text-sm" style={{ color: '#6B7280' }}>Cargando ranking...</p>
                </div>
              )}

              {!loadingModal && rankingRows.map((row, idx) => {
                const pos = row.posicion ?? (idx + 1)
                const color = medalColor[pos] ?? '#60A5FA'
                const isSelf = row.id_usuario === idUsuario
                const nombre = row.nombre ?? row.username

                return (
                  <div
                    key={row.id_ranking}
                    className="flex items-center gap-3 rounded-xl px-4 py-3"
                    style={{
                      background: isSelf ? 'rgba(96,165,250,0.1)' : '#152238',
                      border: isSelf ? '1px solid rgba(96,165,250,0.35)' : `1px solid ${color}22`
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0"
                      style={{ background: `${color}1A`, color }}
                    >
                      {pos <= 3 ? ['🥇', '🥈', '🥉'][pos - 1] : pos}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {nombre}
                        {isSelf && <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(96,165,250,0.2)', color: '#60A5FA' }}>tú</span>}
                      </p>
                      <p className="text-[11px]" style={{ color: '#6B7280' }}>@{row.username}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-black" style={{ color }}>{row.puntos}</p>
                      <p className="text-[10px]" style={{ color: '#4B5563' }}>pts</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-xs text-center" style={{ color: '#4B5563' }}>
                {rankingRows.length} {rankingRows.length === 1 ? 'participante' : 'participantes'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
