'use client'

import { useEffect, useState } from 'react'

const WORLD_CUP_START = new Date('2026-06-12T00:00:00Z')

interface ProximoPartido {
  fecha: string
  equipo_a?: string
  equipo_b?: string
  escudo_a?: string | null
  escudo_b?: string | null
  estadio?: string | null
  ciudad?: string | null
  grupo?: string | null
  fase?: string
  [key: string]: unknown
}

interface Props { proximoPartido?: ProximoPartido | null }

interface TimeLeft { dias: number; horas: number; minutos: number; segundos: number; terminado: boolean }

function calcular (target: Date): TimeLeft {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) return { dias: 0, horas: 0, minutos: 0, segundos: 0, terminado: true }
  return {
    dias: Math.floor(diff / 86400000),
    horas: Math.floor((diff % 86400000) / 3600000),
    minutos: Math.floor((diff % 3600000) / 60000),
    segundos: Math.floor((diff % 60000) / 1000),
    terminado: false
  }
}

function Bloque ({ valor, label }: { valor: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center font-black text-2xl sm:text-3xl tabular-nums"
        style={{ background: 'rgba(0,0,0,0.35)', color: '#4ADE80', border: '1px solid rgba(74,222,128,0.2)' }}>
        {String(valor).padStart(2, '0')}
      </div>
      <span className="mt-1 text-xs font-medium uppercase tracking-wider" style={{ color: '#6B7280' }}>{label}</span>
    </div>
  )
}

export default function WorldCupCountdown ({ proximoPartido }: Props) {
  const target = proximoPartido?.fecha ? new Date(proximoPartido.fecha) : WORLD_CUP_START
  const [tiempo, setTiempo] = useState<TimeLeft>(() => calcular(target))

  useEffect(() => {
    const id = setInterval(() => setTiempo(calcular(target)), 1000)
    return () => clearInterval(id)
  }, [target.toISOString()])

  const local = proximoPartido?.equipo_a
  const visitante = proximoPartido?.equipo_b
  const tienePartido = local && visitante

  if (tiempo.terminado && !tienePartido) {
    return (
      <div className="text-center py-2">
        <p className="text-lg font-black" style={{ color: '#4ADE80' }}>¡El Mundial ha comenzado! ⚽</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#86EFAC' }}>
        {tienePartido ? '⚽ Próximo partido' : 'Inicio del Mundial 2026'}
      </p>

      {tienePartido && (
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-3">
            <span className="text-sm font-black text-white">{local}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(74,222,128,0.15)', color: '#4ADE80' }}>VS</span>
            <span className="text-sm font-black text-white">{visitante}</span>
          </div>
          <p className="text-xs" style={{ color: '#6B7280' }}>
            {new Date(proximoPartido!.fecha).toLocaleDateString('es-MX', { weekday: 'long', day: '2-digit', month: 'short' })}
            {' · '}
            {new Date(proximoPartido!.fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            {proximoPartido?.estadio ? ` · ${proximoPartido.estadio}` : ''}
          </p>
        </div>
      )}

      {tiempo.terminado ? (
        <p className="text-base font-black" style={{ color: '#4ADE80' }}>¡En curso! ⚽</p>
      ) : (
        <div className="flex items-end gap-2 sm:gap-3">
          <Bloque valor={tiempo.dias} label="días" />
          <span className="text-xl font-black pb-4" style={{ color: '#4ADE80' }}>:</span>
          <Bloque valor={tiempo.horas} label="horas" />
          <span className="text-xl font-black pb-4" style={{ color: '#4ADE80' }}>:</span>
          <Bloque valor={tiempo.minutos} label="min" />
          <span className="text-xl font-black pb-4" style={{ color: '#4ADE80' }}>:</span>
          <Bloque valor={tiempo.segundos} label="seg" />
        </div>
      )}
    </div>
  )
}
