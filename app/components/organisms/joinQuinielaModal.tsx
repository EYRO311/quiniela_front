'use client'

import { useState } from 'react'
import { unirseQuiniela } from '@/services/quiniela.service'

interface Props {
  idUsuario: string
  onClose: () => void
  onJoined: () => void
}

export default function JoinQuinielaModal ({ idUsuario, onClose, onJoined }: Props) {
  const [codigo, setCodigo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleJoin = async () => {
    if (!codigo.trim()) return setError('Ingresa el código de acceso')
    setLoading(true)
    setError('')
    try {
      await unirseQuiniela({ codigoAcceso: codigo.trim(), idUsuario })
      onJoined()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al unirse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(6,14,30,0.85)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 shadow-2xl"
        style={{ background: '#0D1B2A', border: '1px solid rgba(29,78,216,0.4)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔑</span>
            <h2 className="text-xl font-bold text-white">Unirse a quiniela</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-xl leading-none">✕</button>
        </div>

        <p className="text-sm mb-6" style={{ color: '#9CA3AF' }}>
          Ingresa el código que te compartieron para unirte a una quiniela privada.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#60A5FA' }}>
              Código de acceso
            </label>
            <input
              type="text"
              value={codigo}
              onChange={e => setCodigo(e.target.value.toUpperCase())}
              placeholder="Ej. A1B2C3D4"
              maxLength={16}
              className="w-full rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-gray-500 focus:outline-none tracking-widest text-center uppercase transition-colors"
              style={{ background: '#152238', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          {error && (
            <p className="text-sm rounded-xl px-4 py-3" style={{ background: 'rgba(220,38,38,0.15)', color: '#FCA5A5', border: '1px solid rgba(220,38,38,0.3)' }}>
              {error}
            </p>
          )}

          <button
            onClick={handleJoin}
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-bold transition-opacity"
            style={{
              background: loading ? '#374151' : 'linear-gradient(135deg, #1D4ED8, #2563EB)',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Uniéndose...' : '⚽ Unirse'}
          </button>
        </div>
      </div>
    </div>
  )
}
