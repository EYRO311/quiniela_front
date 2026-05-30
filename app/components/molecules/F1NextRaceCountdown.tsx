'use client'

import { useEffect, useState } from 'react'

interface Carrera {
  round: number
  nombre_gp: string
  circuito: string
  pais: string
  fecha_carrera: string
  estado: string
}

interface Props { carrera: Carrera }

interface TimeLeft { dias: number; horas: number; minutos: number; segundos: number; terminado: boolean }

function calcular (fecha: string): TimeLeft {
  const diff = new Date(fecha).getTime() - Date.now()
  if (diff <= 0) return { dias: 0, horas: 0, minutos: 0, segundos: 0, terminado: true }
  return {
    dias: Math.floor(diff / 86400000),
    horas: Math.floor((diff % 86400000) / 3600000),
    minutos: Math.floor((diff % 3600000) / 60000),
    segundos: Math.floor((diff % 60000) / 1000),
    terminado: false
  }
}

function Bloque ({ valor, label, color }: { valor: number; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center font-black text-2xl sm:text-3xl tabular-nums"
        style={{ background: 'rgba(0,0,0,0.35)', color, border: `1px solid ${color}33` }}>
        {String(valor).padStart(2, '0')}
      </div>
      <span className="mt-1 text-xs font-medium uppercase tracking-wider" style={{ color: '#6B7280' }}>{label}</span>
    </div>
  )
}

export default function F1NextRaceCountdown ({ carrera }: Props) {
  const [tiempo, setTiempo] = useState<TimeLeft>(() => calcular(carrera.fecha_carrera))

  useEffect(() => {
    const id = setInterval(() => setTiempo(calcular(carrera.fecha_carrera)), 1000)
    return () => clearInterval(id)
  }, [carrera.fecha_carrera])

  const color = '#E8002D'

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#F87171' }}>
        🏎️ Próxima carrera F1
      </p>
      <p className="text-sm font-bold text-white">{carrera.nombre_gp}</p>
      <p className="text-xs" style={{ color: '#6B7280' }}>{carrera.circuito} · {carrera.pais}</p>

      {tiempo.terminado ? (
        <p className="text-base font-black" style={{ color }}>¡En curso! 🏁</p>
      ) : (
        <div className="flex items-end gap-2 sm:gap-3">
          <Bloque valor={tiempo.dias} label="días" color={color} />
          <span className="text-xl font-black pb-4" style={{ color }}>:</span>
          <Bloque valor={tiempo.horas} label="horas" color={color} />
          <span className="text-xl font-black pb-4" style={{ color }}>:</span>
          <Bloque valor={tiempo.minutos} label="min" color={color} />
          <span className="text-xl font-black pb-4" style={{ color }}>:</span>
          <Bloque valor={tiempo.segundos} label="seg" color={color} />
        </div>
      )}
    </div>
  )
}
