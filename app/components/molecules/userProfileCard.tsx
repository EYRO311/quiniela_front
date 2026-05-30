'use client'

import { useState } from 'react'
import { updateUsuario } from '@/services/usuario.service'

interface Usuario {
  id_random: string
  username: string
  nombre: string | null
  correo: string | null
  puntos_totales: number
  telefono: string | null
  tipo_user: string | null
  futbol_f1: 'futbol' | 'f1' | 'ambos' | null
  created_at: string | null
  last_sign_in_at: string | null
}

interface Props {
  usuario: Usuario
  onUpdated: (u: Partial<Usuario>) => void
}

function formatDate (iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function UserProfileCard ({ usuario, onUpdated }: Props) {
  const [editing, setEditing] = useState(false)
  const [nombre, setNombre] = useState(usuario.nombre ?? '')
  const [correo, setCorreo] = useState(usuario.correo ?? '')
  const [username, setUsername] = useState(usuario.username)
  const [telefono, setTelefono] = useState(usuario.telefono ?? '')
  const [futbolF1, setFutbolF1] = useState<'futbol' | 'f1' | 'ambos'>(usuario.futbol_f1 ?? 'ambos')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const initials = (usuario.nombre ?? usuario.username).slice(0, 2).toUpperCase()
  const esAdmin = usuario.tipo_user === 'admin'

  const handleSave = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await updateUsuario(usuario.id_random, { nombre, correo, username, telefono, futbol_f1: futbolF1 })
      localStorage.setItem('futbol_f1', futbolF1)
      window.dispatchEvent(new Event('futbol_f1_changed'))
      onUpdated(res.user)
      setEditing(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setNombre(usuario.nombre ?? '')
    setCorreo(usuario.correo ?? '')
    setUsername(usuario.username)
    setTelefono(usuario.telefono ?? '')
    setFutbolF1(usuario.futbol_f1 ?? 'ambos')
    setError('')
    setEditing(false)
  }

  return (
    <div
      className="rounded-2xl p-5 space-y-5"
      style={{ background: '#0D1B2A', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Avatar + header */}
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-black shrink-0"
          style={{ background: 'linear-gradient(135deg, #006847, #002868)', color: 'white' }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-black text-white text-lg leading-tight truncate">
              {usuario.nombre ?? usuario.username}
            </p>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
              style={esAdmin
                ? { background: 'rgba(251,191,36,0.15)', color: '#FCD34D', border: '1px solid rgba(251,191,36,0.3)' }
                : { background: 'rgba(74,222,128,0.1)', color: '#4ADE80', border: '1px solid rgba(74,222,128,0.2)' }
              }
            >
              {esAdmin ? '★ Admin' : 'Jugador'}
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>@{usuario.username}</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all hover:scale-105"
            style={{ background: 'rgba(0,104,71,0.2)', color: '#4ADE80', border: '1px solid rgba(0,104,71,0.4)' }}
          >
            Editar
          </button>
        )}
      </div>

      {/* Campos editables */}
      <div className="space-y-4">
        <Field label="Nombre completo" value={editing ? nombre : (usuario.nombre ?? '')}
          editing={editing} placeholder="Tu nombre" onChange={setNombre} accentColor="#4ADE80" />
        <Field label="Usuario" value={editing ? username : usuario.username}
          editing={editing} placeholder="username" onChange={setUsername} accentColor="#60A5FA" />
        <Field label="Correo" value={editing ? correo : (usuario.correo ?? '')}
          editing={editing} placeholder="email@ejemplo.com" onChange={setCorreo} accentColor="#F87171" />
        <Field label="Teléfono" value={editing ? telefono : (usuario.telefono ?? '')}
          editing={editing} placeholder="+52 55 0000 0000" onChange={setTelefono} accentColor="#C084FC" />

        {/* Preferencia Fútbol / F1 */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#F59E0B' }}>
            Intereses
          </p>
          {editing ? (
            <select
              value={futbolF1}
              onChange={e => setFutbolF1(e.target.value as 'futbol' | 'f1' | 'ambos')}
              className="w-full bg-transparent text-sm text-white pb-1 focus:outline-none"
              style={{ borderBottom: '1px solid rgba(245,158,11,0.4)', appearance: 'none' }}
            >
              <option value="ambos" style={{ background: '#0D1B2A' }}>⚽🏎️ Fútbol + F1</option>
              <option value="futbol" style={{ background: '#0D1B2A' }}>⚽ Solo Fútbol</option>
              <option value="f1" style={{ background: '#0D1B2A' }}>🏎️ Solo F1</option>
            </select>
          ) : (
            <p className="text-sm text-white">
              {usuario.futbol_f1 === 'futbol' ? '⚽ Solo Fútbol' : usuario.futbol_f1 === 'f1' ? '🏎️ Solo F1' : '⚽🏎️ Fútbol + F1'}
            </p>
          )}
        </div>
      </div>

      {/* Campos de solo lectura */}
      {!editing && (
        <div className="grid grid-cols-2 gap-3 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <ReadonlyField label="Miembro desde" value={formatDate(usuario.created_at)} />
          <ReadonlyField label="Último acceso" value={formatDate(usuario.last_sign_in_at)} />
        </div>
      )}

      {error && (
        <p
          className="text-xs rounded-xl px-3 py-2"
          style={{ background: 'rgba(220,38,38,0.1)', color: '#FCA5A5', border: '1px solid rgba(220,38,38,0.25)' }}
        >
          {error}
        </p>
      )}

      {editing && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
            style={{
              background: loading ? '#374151' : 'linear-gradient(135deg, #006847, #16A34A)',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 py-2 rounded-xl text-xs font-bold border transition-all"
            style={{ color: '#9CA3AF', borderColor: 'rgba(156,163,175,0.2)', background: 'transparent' }}
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}

function Field ({ label, value, editing, placeholder, onChange, accentColor }: {
  label: string; value: string; editing: boolean
  placeholder: string; onChange: (v: string) => void; accentColor: string
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: accentColor }}>
        {label}
      </p>
      {editing ? (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-white pb-1 focus:outline-none placeholder-gray-600"
          style={{ borderBottom: `1px solid ${accentColor}55` }}
        />
      ) : (
        <p className="text-sm text-white truncate">{value || '—'}</p>
      )}
    </div>
  )
}

function ReadonlyField ({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#4B5563' }}>
        {label}
      </p>
      <p className="text-xs text-white">{value}</p>
    </div>
  )
}
