'use client'

import { useState } from 'react'
import { crearQuiniela } from '@/services/quiniela.service'

interface Props {
  idUsuario: string
  onClose: () => void
  onCreated: () => void
}

export default function CreateQuinielaModal ({ idUsuario, onClose, onCreated }: Props) {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [tipo, setTipo] = useState<'privada' | 'publica'>('privada')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async () => {
    if (!nombre.trim()) return setError('El nombre es requerido')
    setLoading(true)
    setError('')
    try {
      await crearQuiniela({ nombre: nombre.trim(), descripcion, tipo, idUsuario })
      onCreated()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear')
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
        className="w-full max-w-md rounded-2xl p-8 shadow-2xl"
        style={{ background: '#0D1B2A', border: '1px solid rgba(212,175,55,0.3)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <h2 className="text-xl font-bold text-white">Crear quiniela</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-xl leading-none">✕</button>
        </div>

        <div className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#D4AF37' }}>
              Nombre
            </label>
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej. Quiniela del trabajo"
              className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
              style={{ background: '#152238', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#D4AF37' }}>
              Descripción <span className="text-gray-500 normal-case">(opcional)</span>
            </label>
            <textarea
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              placeholder="Describe tu quiniela..."
              rows={2}
              className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none resize-none transition-colors"
              style={{ background: '#152238', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#D4AF37' }}>
              Tipo
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['privada', 'publica'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTipo(t)}
                  className="py-3 rounded-xl text-sm font-semibold transition-all capitalize"
                  style={{
                    background: tipo === t ? '#D4AF37' : '#152238',
                    color: tipo === t ? '#060E1E' : '#9CA3AF',
                    border: `1px solid ${tipo === t ? '#D4AF37' : 'rgba(255,255,255,0.1)'}`
                  }}
                >
                  {t === 'privada' ? '🔒 Privada' : '🌐 Pública'}
                </button>
              ))}
            </div>
            {tipo === 'privada' && (
              <p className="mt-2 text-xs" style={{ color: '#6B7280' }}>
                Se generará un código de acceso automáticamente.
              </p>
            )}
          </div>

          {error && (
            <p className="text-sm rounded-xl px-4 py-3" style={{ background: 'rgba(220,38,38,0.15)', color: '#FCA5A5', border: '1px solid rgba(220,38,38,0.3)' }}>
              {error}
            </p>
          )}

          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-bold transition-opacity"
            style={{
              background: loading ? '#374151' : 'linear-gradient(135deg, #D4AF37, #F0C040)',
              color: '#060E1E',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creando...' : '✦ Crear quiniela'}
          </button>
        </div>
      </div>
    </div>
  )
}
