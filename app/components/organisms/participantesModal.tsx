'use client'

import { useEffect, useState } from 'react'
import { getParticipantes } from '@/services/quiniela.service'

interface Participante {
  id_quiniela_usuario: string
  puntos: number
  posicion: number | null
  usuarios: {
    id_random: string
    username: string
    nombre: string | null
  } | null
}

interface Props {
  idQuiniela: string
  nombreQuiniela: string
  codigoAcceso: string
  onClose: () => void
}

const medalColors: Record<number, string> = { 1: '#D4AF37', 2: '#94A3B8', 3: '#CD7F32' }

export default function ParticipantesModal ({ idQuiniela, nombreQuiniela, codigoAcceso, onClose }: Props) {
  const [participantes, setParticipantes] = useState<Participante[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    getParticipantes(idQuiniela)
      .then((res: { participantes: Participante[] }) => {
        const sorted = [...(res.participantes ?? [])].sort((a, b) => b.puntos - a.puntos)
        setParticipantes(sorted)
        setLoading(false)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Error al cargar')
        setLoading(false)
      })
  }, [idQuiniela])

  const handleCopy = () => {
    navigator.clipboard.writeText(codigoAcceso).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(6,14,30,0.9)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: '#0D1B2A', border: '1px solid rgba(74,222,128,0.2)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-5"
          style={{ background: 'linear-gradient(135deg, #003d20, #001f5c)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#4ADE80' }}>Participantes</p>
              <h2 className="text-xl font-black text-white leading-tight">{nombreQuiniela}</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none mt-0.5">✕</button>
          </div>

          {/* Código de acceso */}
          <div
            className="flex items-center justify-between mt-4 rounded-xl px-4 py-2.5"
            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(74,222,128,0.2)' }}
          >
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#4ADE80' }}>Código de acceso</p>
              <p className="text-lg font-black tracking-widest text-white font-mono">{codigoAcceso}</p>
            </div>
            <button
              onClick={handleCopy}
              className="rounded-xl px-3 py-1.5 text-xs font-bold transition-all hover:scale-105"
              style={{
                background: copied ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.08)',
                color: copied ? '#4ADE80' : '#9CA3AF'
              }}
            >
              {copied ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>
        </div>

        {/* Lista */}
        <div className="px-4 py-4 max-h-80 overflow-y-auto space-y-2">
          {loading && (
            <div className="py-8 text-center">
              <p className="text-4xl animate-pulse mb-2">⚽</p>
              <p className="text-sm" style={{ color: '#6B7280' }}>Cargando participantes...</p>
            </div>
          )}

          {error && (
            <p className="text-sm text-center py-4" style={{ color: '#F87171' }}>{error}</p>
          )}

          {!loading && !error && participantes.length === 0 && (
            <p className="text-sm text-center py-6" style={{ color: '#6B7280' }}>Aún no hay participantes.</p>
          )}

          {participantes.map((p, idx) => {
            const pos = idx + 1
            const color = medalColors[pos] ?? '#60A5FA'
            const nombre = p.usuarios?.nombre ?? p.usuarios?.username ?? '—'
            const username = p.usuarios?.username ?? '—'
            const initials = nombre.slice(0, 2).toUpperCase()

            return (
              <div
                key={p.id_quiniela_usuario}
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: '#152238', border: `1px solid ${color}22` }}
              >
                {/* Posición */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0"
                  style={{ background: `${color}1A`, color }}
                >
                  {pos <= 3 ? ['🥇', '🥈', '🥉'][pos - 1] : pos}
                </div>

                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                  style={{ background: 'linear-gradient(135deg, #006847, #002868)', color: 'white' }}
                >
                  {initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{nombre}</p>
                  <p className="text-[11px]" style={{ color: '#6B7280' }}>@{username}</p>
                </div>

                {/* Puntos */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-black" style={{ color }}>{p.puntos}</p>
                  <p className="text-[10px]" style={{ color: '#4B5563' }}>pts</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-xs text-center" style={{ color: '#4B5563' }}>
            {participantes.length} {participantes.length === 1 ? 'participante' : 'participantes'}
          </p>
        </div>
      </div>
    </div>
  )
}
