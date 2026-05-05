'use client'

import { useEffect, useState } from 'react'
import { getUsuarioInfo } from '@/services/usuario.service'
import AppSidebar from '@/app/components/layout/appSidebar'
import QuinielaCard from '@/app/components/molecules/quinielaCard'
import RankingListItem from '@/app/components/molecules/rankingListItem'
import UserProfileCard from '@/app/components/molecules/userProfileCard'
import CreateQuinielaModal from '@/app/components/organisms/createQuinielaModal'
import JoinQuinielaModal from '@/app/components/organisms/joinQuinielaModal'
import ParticipantesModal from '@/app/components/organisms/participantesModal'

interface Usuario {
  id_random: string
  username: string
  nombre: string | null
  correo: string | null
  puntos_totales: number
}

interface QuinielaUsuario {
  id_quiniela_usuario: string
  puntos: number
  posicion: number | null
  quinielas: {
    id_quiniela: string
    nombre: string
    descripcion: string | null
    codigo_acceso: string | null
    estado: string
    esCreador: boolean
  } | null
}

interface RankingItem {
  id_ranking: string
  quiniela: string
  puntos: number
  posicion: number | null
}

interface SelectedQuiniela {
  id: string
  nombre: string
  codigoAcceso: string
}

interface Props { idUsuario: string }

export default function UserInfoDashboard ({ idUsuario }: Props) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [quinielas, setQuinielas] = useState<QuinielaUsuario[]>([])
  const [rankings, setRankings] = useState<RankingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [selectedQuiniela, setSelectedQuiniela] = useState<SelectedQuiniela | null>(null)

  useEffect(() => {
    getUsuarioInfo(idUsuario)
      .then((res: { usuario: Usuario; quinielas: QuinielaUsuario[]; rankings: RankingItem[] }) => {
        setUsuario(res.usuario)
        setQuinielas(res.quinielas ?? [])
        setRankings(res.rankings ?? [])
        setLoading(false)
      })
      .catch((err: unknown) => {
        console.error(err)
        setLoading(false)
      })
  }, [idUsuario, refreshKey])

  const handleRefresh = () => {
    setLoading(true)
    setRefreshKey(k => k + 1)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#060E1E' }}>
        <div className="text-center space-y-3">
          <div className="text-5xl animate-pulse">⚽</div>
          <p className="text-sm font-medium tracking-widest uppercase" style={{ color: '#4ADE80' }}>Cargando...</p>
        </div>
      </div>
    )
  }

  if (!usuario) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#060E1E' }}>
        <p className="text-gray-400">No se encontró el usuario.</p>
      </div>
    )
  }

  const posicionGeneral = rankings?.[0]?.posicion ?? '—'

  return (
    <div className="flex min-h-screen" style={{ background: '#060E1E' }}>
      <AppSidebar />

      <main className="flex-1 px-4 pt-20 pb-6 md:py-6 sm:px-6 lg:px-8 overflow-auto">
        <div className="mx-auto max-w-6xl space-y-6">

          {/* Hero */}
          <div
            className="rounded-2xl p-6 sm:p-8 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #003d20 0%, #001f5c 50%, #8b0000 100%)',
              border: '1px solid rgba(74,222,128,0.2)'
            }}
          >
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-white" />
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-1.5" style={{ background: '#DC2626' }} />
            <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: '#16A34A' }} />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: '#86EFAC' }}>¡Bienvenido de nuevo!</p>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">@{usuario.username}</h1>
                {usuario.nombre && <p className="mt-1 text-sm" style={{ color: '#93C5FD' }}>{usuario.nombre}</p>}
              </div>
              <div className="grid grid-cols-3 gap-4 sm:gap-8">
                <StatBlock value={usuario.puntos_totales ?? 0} label="Puntos" color="#4ADE80" />
                <StatBlock value={posicionGeneral === '—' ? '—' : `#${posicionGeneral}`} label="Posición" color="#60A5FA" />
                <StatBlock value={quinielas.length} label="Quinielas" color="#F87171" />
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #006847, #16A34A)', color: 'white' }}
            >
              <span>🏆</span> Crear quiniela
            </button>
            <button
              onClick={() => setShowJoin(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all hover:scale-105"
              style={{ background: 'transparent', color: '#60A5FA', borderColor: 'rgba(96,165,250,0.4)' }}
            >
              <span>🔑</span> Unirme con código
            </button>
          </div>

          {/* Grid 3 columnas */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

            {/* Quinielas */}
            <section className="lg:col-span-2 space-y-4">
              <SectionTitle color="#4ADE80">Mis quinielas</SectionTitle>
              {quinielas.length === 0
                ? <EmptyCard icon="🏆" text="Aún no participas en ninguna quiniela." />
                : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {quinielas.map(item => {
                      const q = item.quinielas
                      return (
                        <QuinielaCard
                          key={item.id_quiniela_usuario}
                          idQuiniela={q?.id_quiniela ?? ''}
                          nombre={q?.nombre ?? ''}
                          codigoAcceso={q?.codigo_acceso ?? null}
                          estado={q?.estado ?? ''}
                          puntos={item.puntos}
                          posicion={item.posicion ?? null}
                          esCreador={q?.esCreador ?? false}
                          onVerParticipantes={
                            q?.esCreador && q.codigo_acceso
                              ? () => setSelectedQuiniela({
                                  id: q.id_quiniela,
                                  nombre: q.nombre,
                                  codigoAcceso: q.codigo_acceso!
                                })
                              : undefined
                          }
                        />
                      )
                    })}
                  </div>
                )}
            </section>

            {/* Perfil + Rankings */}
            <aside className="space-y-6">
              <div className="space-y-2">
                <SectionTitle color="#60A5FA">Mi perfil</SectionTitle>
                <UserProfileCard
                  usuario={usuario}
                  onUpdated={(updated) => {
                    setUsuario(prev => prev ? { ...prev, ...updated } : prev)
                    if (updated.username) localStorage.setItem('username', updated.username)
                  }}
                />
              </div>

              <div className="space-y-3">
                <SectionTitle color="#F87171">Mis rankings</SectionTitle>
                {rankings.length === 0
                  ? <EmptyCard icon="📊" text="Sin rankings disponibles aún." />
                  : rankings.map(r => (
                    <RankingListItem
                      key={r.id_ranking}
                      posicion={r.posicion ?? 0}
                      nombreQuiniela={r.quiniela}
                      puntos={r.puntos}
                    />
                  ))
                }
              </div>
            </aside>
          </div>
        </div>
      </main>

      {showCreate && (
        <CreateQuinielaModal
          idUsuario={idUsuario}
          onClose={() => setShowCreate(false)}
          onCreated={handleRefresh}
        />
      )}
      {showJoin && (
        <JoinQuinielaModal
          idUsuario={idUsuario}
          onClose={() => setShowJoin(false)}
          onJoined={handleRefresh}
        />
      )}
      {selectedQuiniela && (
        <ParticipantesModal
          idQuiniela={selectedQuiniela.id}
          nombreQuiniela={selectedQuiniela.nombre}
          codigoAcceso={selectedQuiniela.codigoAcceso}
          onClose={() => setSelectedQuiniela(null)}
        />
      )}
    </div>
  )
}

function StatBlock ({ value, label, color }: { value: string | number; label: string; color: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl sm:text-3xl font-black" style={{ color }}>{value}</p>
      <p className="text-xs mt-0.5 font-medium" style={{ color: '#6B7280' }}>{label}</p>
    </div>
  )
}

function SectionTitle ({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-1 h-5 rounded-full" style={{ background: color }} />
      <h2 className="text-base font-bold text-white">{children}</h2>
    </div>
  )
}

function EmptyCard ({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="rounded-2xl p-6 text-center" style={{ background: '#0D1B2A', border: '1px solid rgba(255,255,255,0.06)' }}>
      <p className="text-3xl mb-2">{icon}</p>
      <p className="text-sm" style={{ color: '#6B7280' }}>{text}</p>
    </div>
  )
}
