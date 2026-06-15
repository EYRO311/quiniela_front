'use client'

import { useState } from 'react'
import { savePrediccionFinal } from '@/services/prediccionFinal.service'

interface Equipo {
  id_equipo: string
  nombre_pais: string
  escudo_url: string | null
}

interface PrediccionFinalCardProps {
  idQuiniela: string
  idUsuario: string
  equipos: Equipo[]
  prediccionExistente: {
    id_equipo_campeon: string
    id_equipo_subcampeon: string
    puntos_obtenidos: number
  } | null
  cerrado: boolean
  fechaLimite: string
}

export default function PrediccionFinalCard ({
  idQuiniela, idUsuario, equipos, prediccionExistente, cerrado, fechaLimite
}: PrediccionFinalCardProps) {
  const [campeon, setCampeon] = useState(prediccionExistente?.id_equipo_campeon ?? '')
  const [subcampeon, setSubcampeon] = useState(prediccionExistente?.id_equipo_subcampeon ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const fmtFechaLimite = new Date(fechaLimite).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })

  const handleSave = async () => {
    setError('')
    if (!campeon || !subcampeon) {
      setError('Selecciona el campeón y el subcampeón')
      return
    }
    setSaving(true)
    try {
      await savePrediccionFinal({ idQuiniela, idUsuario, idCampeon: campeon, idSubcampeon: subcampeon })
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
      className="rounded-2xl p-5 space-y-4"
      style={{ background: '#0D1B2A', border: '1px solid rgba(212,175,55,0.25)' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            🏆 Predicción final
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{ color: '#D4AF37', background: 'rgba(212,175,55,0.12)' }}
            >
              +5 pts
            </span>
          </h2>
          <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
            ¿Qué equipos llegan a la final y quién es el campeón del mundo?
            {cerrado
              ? ' Las predicciones están cerradas.'
              : ` Puedes cambiarla hasta el ${fmtFechaLimite}.`}
          </p>
        </div>
        {prediccionExistente && prediccionExistente.puntos_obtenidos > 0 && (
          <span
            className="shrink-0 rounded-full px-3 py-1 text-xs font-bold"
            style={{ color: '#4ADE80', background: 'rgba(74,222,128,0.12)' }}
          >
            +{prediccionExistente.puntos_obtenidos} pts
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <EquipoSelect
          label="Campeón 🏆"
          value={campeon}
          onChange={setCampeon}
          equipos={equipos}
          excluir={subcampeon}
          disabled={cerrado || saving}
        />
        <EquipoSelect
          label="Subcampeón 🥈"
          value={subcampeon}
          onChange={setSubcampeon}
          equipos={equipos}
          excluir={campeon}
          disabled={cerrado || saving}
        />
      </div>

      {!cerrado && (
        <>
          {error && <p className="text-xs text-center" style={{ color: '#F87171' }}>{error}</p>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.01]"
            style={{
              background: saved
                ? 'rgba(74,222,128,0.15)'
                : saving
                ? '#374151'
                : 'linear-gradient(135deg, #D4AF37, #B8860B)',
              color: saved ? '#4ADE80' : 'white',
              cursor: saving ? 'not-allowed' : 'pointer',
              border: saved ? '1px solid rgba(74,222,128,0.3)' : 'none'
            }}
          >
            {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar predicción final'}
          </button>
        </>
      )}
    </div>
  )
}

function EquipoSelect ({
  label, value, onChange, equipos, excluir, disabled
}: {
  label: string
  value: string
  onChange: (v: string) => void
  equipos: Equipo[]
  excluir: string
  disabled: boolean
}) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-widest" style={{ color: '#6B7280' }}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className="mt-1 w-full rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none"
        style={{ background: 'rgba(212,175,55,0.06)', color: 'white', border: '1px solid rgba(212,175,55,0.25)' }}
      >
        <option value="" style={{ background: '#0D1B2A', color: 'white' }}>Selecciona un equipo</option>
        {equipos.filter(e => e.id_equipo !== excluir).map(e => (
          <option key={e.id_equipo} value={e.id_equipo} style={{ background: '#0D1B2A', color: 'white' }}>{e.nombre_pais}</option>
        ))}
      </select>
    </div>
  )
}
