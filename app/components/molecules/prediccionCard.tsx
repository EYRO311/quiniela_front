'use client'

import { useState } from 'react'
import { savePronostico } from '@/services/pronosticos.service'

interface PrediccionCardProps {
  idQuiniela: string
  idUsuario: string
  idPartido: string
  equipoA: string
  equipoB: string
  escudoA?: string | null
  escudoB?: string | null
  fecha: string
  estadio?: string | null
  ciudad?: string | null
  estado: string
  grupo?: string | null
  jornada?: number | null
  predExistente?: { golesA: number; golesB: number } | null
  resultadoFinal?: { golesA: number; golesB: number } | null
}

export default function PrediccionCard ({
  idQuiniela, idUsuario, idPartido,
  equipoA, equipoB, escudoA, escudoB,
  fecha, estadio, ciudad, estado, grupo, jornada,
  predExistente, resultadoFinal
}: PrediccionCardProps) {
  const [golesA, setGolesA] = useState<number>(predExistente?.golesA ?? 0)
  const [golesB, setGolesB] = useState<number>(predExistente?.golesB ?? 0)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const fechaObj = new Date(fecha)
  const fmtDate = fechaObj.toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit', month: 'short' })
  const fmtTime = fechaObj.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })

  const pendiente = estado === 'pendiente'
  const finalizado = estado === 'finalizado'
  const enVivo = estado === 'en_vivo'

  const estadoBadge = {
    pendiente: { label: 'Pendiente', color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' },
    en_vivo: { label: 'EN VIVO', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
    finalizado: { label: 'Final', color: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
    cancelado: { label: 'Cancelado', color: '#F87171', bg: 'rgba(248,113,113,0.12)' }
  }[estado] ?? { label: estado, color: '#6B7280', bg: 'rgba(107,114,128,0.12)' }

  const handleSave = async () => {
    setError('')
    setSaving(true)
    try {
      await savePronostico({ idQuiniela, idUsuario, idPartido, golesAPred: golesA, golesBPred: golesB })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all hover:scale-[1.01]"
      style={{
        background: '#0D1B2A',
        border: pendiente
          ? '1px solid rgba(96,165,250,0.2)'
          : finalizado
          ? '1px solid rgba(74,222,128,0.15)'
          : enVivo
          ? '1px solid rgba(239,68,68,0.3)'
          : '1px solid rgba(255,255,255,0.07)'
      }}
    >
      {/* Top bar */}
      <div
        className="px-4 py-2.5 flex items-center justify-between gap-2"
        style={{ background: 'rgba(0,0,0,0.25)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-2 text-xs min-w-0">
          {grupo && (
            <span className="shrink-0 font-bold" style={{ color: '#D4AF37' }}>Grupo {grupo}</span>
          )}
          {jornada && (
            <span style={{ color: '#4B5563' }}>· J{jornada}</span>
          )}
          <span className="truncate" style={{ color: '#6B7280' }}>
            {estadio ?? ciudad ?? ''} · {fmtDate} {fmtTime}
          </span>
        </div>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{ color: estadoBadge.color, background: estadoBadge.bg }}
        >
          {estadoBadge.label}
        </span>
      </div>

      {/* Match area */}
      <div className="px-4 py-5">
        <div className="flex items-center gap-2">

          {/* Team A */}
          <div className="flex-1 flex flex-col items-center gap-2 text-center">
            <TeamShield url={escudoA} name={equipoA} />
            <p className="text-xs font-semibold text-white leading-tight">{equipoA}</p>
          </div>

          {/* Score inputs */}
          <div className="flex items-center gap-2 px-2">
            {pendiente ? (
              <>
                <ScoreInput
                  value={golesA}
                  onChange={setGolesA}
                  color="#4ADE80"
                  disabled={saving}
                />
                <span className="text-gray-600 font-black text-lg">—</span>
                <ScoreInput
                  value={golesB}
                  onChange={setGolesB}
                  color="#F87171"
                  disabled={saving}
                />
              </>
            ) : (
              <div className="flex items-center gap-2 px-1">
                {predExistente ? (
                  <>
                    <span
                      className="text-2xl font-black rounded-xl px-3 py-1"
                      style={{ color: '#4ADE80', background: 'rgba(74,222,128,0.1)' }}
                    >
                      {predExistente.golesA}
                    </span>
                    <span className="text-gray-600 font-bold">—</span>
                    <span
                      className="text-2xl font-black rounded-xl px-3 py-1"
                      style={{ color: '#F87171', background: 'rgba(248,113,113,0.1)' }}
                    >
                      {predExistente.golesB}
                    </span>
                  </>
                ) : (
                  <span className="text-sm px-3 py-2 rounded-xl" style={{ color: '#4B5563', background: 'rgba(255,255,255,0.04)' }}>
                    Sin predicción
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Team B */}
          <div className="flex-1 flex flex-col items-center gap-2 text-center">
            <TeamShield url={escudoB} name={equipoB} />
            <p className="text-xs font-semibold text-white leading-tight">{equipoB}</p>
          </div>
        </div>

        {/* Resultado final (si está finalizado) */}
        {finalizado && resultadoFinal && (
          <div
            className="mt-3 flex items-center justify-center gap-3 rounded-xl py-2"
            style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)' }}
          >
            <span className="text-xs" style={{ color: '#6B7280' }}>Resultado final:</span>
            <span className="text-sm font-black text-white">
              {resultadoFinal.golesA} — {resultadoFinal.golesB}
            </span>
          </div>
        )}
      </div>

      {/* Save button (solo si pendiente) */}
      {pendiente && (
        <div className="px-4 pb-4 space-y-2">
          {error && (
            <p className="text-xs text-center" style={{ color: '#F87171' }}>{error}</p>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.01]"
            style={{
              background: saved
                ? 'rgba(74,222,128,0.15)'
                : saving
                ? '#374151'
                : 'linear-gradient(135deg, #006847, #16A34A)',
              color: saved ? '#4ADE80' : 'white',
              cursor: saving ? 'not-allowed' : 'pointer',
              border: saved ? '1px solid rgba(74,222,128,0.3)' : 'none'
            }}
          >
            {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar predicción'}
          </button>
        </div>
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
      min={0}
      max={20}
      value={value}
      onChange={e => onChange(Math.max(0, Math.min(20, Number(e.target.value))))}
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

function TeamShield ({ url, name }: { url?: string | null; name: string }) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className="w-10 h-10 object-contain"
        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
      />
    )
  }
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black"
      style={{ background: 'rgba(255,255,255,0.07)', color: '#9CA3AF' }}
    >
      {name.charAt(0)}
    </div>
  )
}
