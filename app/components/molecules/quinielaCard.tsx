interface QuinielaCardProps {
  idQuiniela: string
  nombre: string
  codigoAcceso?: string | null
  puntos: number
  posicion?: number | null
  estado: string
  esCreador?: boolean
  onVerParticipantes?: () => void
}

const estadoConfig: Record<string, { label: string; color: string; bg: string }> = {
  abierta:    { label: 'Abierta',    color: '#4ADE80', bg: 'rgba(74,222,128,0.12)'  },
  cerrada:    { label: 'Cerrada',    color: '#FB923C', bg: 'rgba(251,146,60,0.12)'  },
  finalizada: { label: 'Finalizada', color: '#6B7280', bg: 'rgba(107,114,128,0.12)' }
}

export default function QuinielaCard ({
  nombre, codigoAcceso, puntos, posicion, estado, esCreador, onVerParticipantes
}: QuinielaCardProps) {
  const cfg = estadoConfig[estado] ?? estadoConfig.abierta

  return (
    <div
      className="rounded-2xl p-5 space-y-4 transition-all hover:scale-[1.02]"
      style={{ background: '#0D1B2A', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-sm leading-tight line-clamp-2">{nombre}</h3>
          {esCreador && (
            <span
              className="inline-block mt-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{ background: 'rgba(74,222,128,0.12)', color: '#4ADE80' }}
            >
              ★ Creador
            </span>
          )}
        </div>
        <span
          className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
          style={{ color: cfg.color, background: cfg.bg }}
        >
          {cfg.label}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-xl p-3 text-center"
          style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.15)' }}
        >
          <p className="text-xl font-black" style={{ color: '#4ADE80' }}>{puntos}</p>
          <p className="text-[11px] font-medium mt-0.5" style={{ color: '#6B7280' }}>Puntos</p>
        </div>
        <div
          className="rounded-xl p-3 text-center"
          style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.15)' }}
        >
          <p className="text-xl font-black" style={{ color: '#60A5FA' }}>
            {posicion ? `#${posicion}` : '—'}
          </p>
          <p className="text-[11px] font-medium mt-0.5" style={{ color: '#6B7280' }}>Posición</p>
        </div>
      </div>

      {/* Código + botón participantes (solo creador) */}
      {esCreador && codigoAcceso && (
        <button
          onClick={onVerParticipantes}
          className="w-full flex items-center justify-between rounded-xl px-4 py-2.5 transition-all hover:scale-[1.01]"
          style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)' }}
        >
          <div className="text-left">
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#4ADE80' }}>Código de acceso</p>
            <p className="text-sm font-black font-mono tracking-widest text-white">{codigoAcceso}</p>
          </div>
          <span className="text-xs font-semibold" style={{ color: '#4ADE80' }}>Ver →</span>
        </button>
      )}
    </div>
  )
}
