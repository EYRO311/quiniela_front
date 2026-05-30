'use client'

import { useEffect, useState } from 'react'
import AppSidebar from '@/app/components/layout/appSidebar'
import { getF1Carreras } from '@/services/f1.service'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface CarreraDB {
  id_carrera: number
  nombre_gp: string
  circuito: string | null
  pais: string | null
  ciudad: string | null
  fecha_carrera: string
  estado: 'pendiente' | 'en_vivo' | 'finalizada' | 'cancelada'
}

interface CarreraAPI {
  round: number
  nombre_gp: string
  circuito: string
  pais: string
  ciudad: string
  fecha_carrera: string
  fecha_clasificacion: string | null
  fecha_sprint: string | null
  estado: 'pendiente' | 'en_vivo' | 'finalizada' | 'cancelada'
}

interface SyncResult {
  inserted: number
  updated: number
  total: number
  errors: { nombre: string; error: string }[]
}

const ESTADO_CFG = {
  pendiente:  { label: 'Próxima',    color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' },
  en_vivo:    { label: 'En Vivo',    color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  finalizada: { label: 'Finalizada', color: '#4ADE80', bg: 'rgba(74,222,128,0.10)' },
  cancelada:  { label: 'Cancelada',  color: '#6B7280', bg: 'rgba(107,114,128,0.10)' }
}

function fmtFecha (iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

interface Props { idUsuario: string }

export default function F1SyncPage ({ idUsuario: _idUsuario }: Props) {
  const [carrerasDB, setCarrerasDB] = useState<CarreraDB[]>([])
  const [carrerasAPI, setCarrerasAPI] = useState<CarreraAPI[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<SyncResult | null>(null)
  const [error, setError] = useState('')

  const loadData = async () => {
    setLoading(true)
    try {
      const [rDB, rAPI] = await Promise.allSettled([
        getF1Carreras(),
        fetch(`${API_URL}/f1/calendario`).then(r => r.json())
      ])
      if (rDB.status === 'fulfilled') setCarrerasDB(rDB.value.carreras ?? [])
      if (rAPI.status === 'fulfilled') setCarrerasAPI(rAPI.value.carreras ?? [])
    } catch {
      setError('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleSync = async () => {
    setSyncing(true)
    setResult(null)
    setError('')
    try {
      const res = await fetch(`${API_URL}/f1/sync-carreras`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data)
      await loadData()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al sincronizar')
    } finally {
      setSyncing(false)
    }
  }

  const dbMap = Object.fromEntries(carrerasDB.map(c => [c.nombre_gp, c]))

  return (
    <div className="flex min-h-screen" style={{ background: '#15151E' }}>
      <AppSidebar />
      <main className="flex-1 px-4 pt-20 pb-10 md:py-6 sm:px-6 lg:px-8 overflow-auto">
        <div className="mx-auto max-w-5xl space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Sincronizar Calendario F1</h1>
              <p className="text-sm mt-1" style={{ color: '#E8002D' }}>
                Importa las carreras 2026 desde la API de Jolpica a la base de datos
              </p>
            </div>
            <button
              onClick={handleSync}
              disabled={syncing || loading}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-wider transition-all hover:scale-105"
              style={{
                background: syncing ? '#374151' : 'linear-gradient(135deg, #E8002D, #9B0018)',
                color: 'white',
                cursor: syncing || loading ? 'not-allowed' : 'pointer',
                boxShadow: syncing ? 'none' : '0 4px 20px rgba(232,0,45,0.3)'
              }}
            >
              {syncing ? (
                <><span className="animate-spin">⟳</span> Sincronizando...</>
              ) : (
                <><span>🔄</span> Sincronizar todo</>
              )}
            </button>
          </div>

          {/* Resultado de la sync */}
          {result && (
            <div
              className="rounded-2xl p-5 space-y-3"
              style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)' }}
            >
              <p className="font-bold text-white flex items-center gap-2">
                <span>✅</span> Sincronización completada
              </p>
              <div className="flex gap-6 text-sm">
                <span style={{ color: '#4ADE80' }}><strong>{result.inserted}</strong> insertadas</span>
                <span style={{ color: '#60A5FA' }}><strong>{result.updated}</strong> actualizadas</span>
                <span style={{ color: '#6B7280' }}><strong>{result.total}</strong> total en API</span>
              </div>
              {result.errors.length > 0 && (
                <div className="space-y-1">
                  {result.errors.map(e => (
                    <p key={e.nombre} className="text-xs" style={{ color: '#FCA5A5' }}>
                      ⚠️ {e.nombre}: {e.error}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="rounded-2xl px-5 py-3" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Stats */}
          {!loading && (
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'En API (Jolpica)', value: carrerasAPI.length, color: '#60A5FA' },
                { label: 'En base de datos', value: carrerasDB.length, color: '#4ADE80' },
                { label: 'Pendientes de sync', value: carrerasAPI.filter(a => !dbMap[a.nombre_gp]).length, color: '#F59E0B' }
              ].map(s => (
                <div key={s.label} className="rounded-2xl p-4 text-center"
                  style={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs mt-1" style={{ color: '#6B7280' }}>{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Tabla comparativa */}
          {loading ? (
            <div className="text-center py-16">
              <div className="text-5xl animate-pulse mb-3">🏎️</div>
              <p className="text-sm tracking-widest uppercase" style={{ color: '#E8002D' }}>Cargando...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
                style={{ color: '#4B5563' }}>
                <span className="w-8">Rnd</span>
                <span className="flex-1">Gran Premio</span>
                <span className="w-24 text-center hidden sm:block">Fecha</span>
                <span className="w-20 text-center">API</span>
                <span className="w-20 text-center">DB</span>
              </div>

              {carrerasAPI.map(c => {
                const enDB = dbMap[c.nombre_gp]
                const estadoCfg = ESTADO_CFG[c.estado] ?? ESTADO_CFG.pendiente

                return (
                  <div
                    key={c.round}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all"
                    style={{
                      background: '#1e1e2e',
                      border: enDB ? '1px solid rgba(74,222,128,0.12)' : '1px solid rgba(245,158,11,0.2)'
                    }}
                  >
                    {/* Round */}
                    <div className="w-8 text-center shrink-0">
                      <span className="text-sm font-black" style={{ color: estadoCfg.color }}>
                        {c.round}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm truncate">{c.nombre_gp}</p>
                      <p className="text-xs truncate" style={{ color: '#6B7280' }}>
                        {[c.circuito, c.ciudad, c.pais].filter(Boolean).join(' · ')}
                      </p>
                    </div>

                    {/* Fecha */}
                    <span className="text-xs shrink-0 hidden sm:block" style={{ color: '#6B7280' }}>
                      {fmtFecha(c.fecha_carrera)}
                    </span>

                    {/* Estado API */}
                    <div className="w-20 text-center shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: estadoCfg.bg, color: estadoCfg.color }}>
                        {estadoCfg.label}
                      </span>
                    </div>

                    {/* Estado DB */}
                    <div className="w-20 text-center shrink-0">
                      {enDB ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: ESTADO_CFG[enDB.estado]?.bg ?? ESTADO_CFG.pendiente.bg, color: ESTADO_CFG[enDB.estado]?.color ?? ESTADO_CFG.pendiente.color }}>
                          {ESTADO_CFG[enDB.estado]?.label ?? 'DB'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}>
                          Sin sync
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}

              {carrerasAPI.length === 0 && (
                <div className="rounded-2xl p-10 text-center" style={{ background: '#0D1B2A' }}>
                  <p className="text-4xl mb-3">📡</p>
                  <p className="text-white font-bold">No se pudo cargar el calendario desde la API</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
