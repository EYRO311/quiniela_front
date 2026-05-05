interface RankingQuinielaCardProps {
  quiniela: string
  posicion: number | null
  puntos: number
  aciertosExactos: number
  aciertosResultado: number
  onVerRanking?: () => void
}

const posColor = (pos: number | null) => {
  if (pos === 1) return '#D4AF37'
  if (pos === 2) return '#94A3B8'
  if (pos === 3) return '#CD7F32'
  return '#60A5FA'
}

export default function RankingQuinielaCard ({
  quiniela, posicion, puntos, aciertosExactos, aciertosResultado, onVerRanking
}: RankingQuinielaCardProps) {
  const color = posColor(posicion)

  return (
    <div
      className="rounded-2xl p-5 space-y-4 transition-all hover:scale-[1.01]"
      style={{ background: '#0D1B2A', border: `1px solid ${color}33` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-black shrink-0"
            style={{ background: `${color}1A`, color, border: `2px solid ${color}55` }}
          >
            {posicion ? (posicion <= 3 ? ['🥇', '🥈', '🥉'][posicion - 1] : `#${posicion}`) : '—'}
          </div>
          <div>
            <h3 className="font-bold text-white text-sm leading-tight">{quiniela}</h3>
            <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
              {posicion ? `Posición #${posicion}` : 'Sin posición aún'}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-black" style={{ color }}>{puntos}</p>
          <p className="text-[10px]" style={{ color: '#4B5563' }}>pts</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-2">
        <div
          className="rounded-xl py-2 px-3 text-center"
          style={{ background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.15)' }}
        >
          <p className="text-lg font-black" style={{ color: '#4ADE80' }}>{aciertosExactos}</p>
          <p className="text-[10px] font-medium" style={{ color: '#6B7280' }}>Marcador exacto</p>
        </div>
        <div
          className="rounded-xl py-2 px-3 text-center"
          style={{ background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.15)' }}
        >
          <p className="text-lg font-black" style={{ color: '#F87171' }}>{aciertosResultado}</p>
          <p className="text-[10px] font-medium" style={{ color: '#6B7280' }}>Resultado correcto</p>
        </div>
      </div>

      {/* Ver ranking completo */}
      {onVerRanking && (
        <button
          onClick={onVerRanking}
          className="w-full py-2 rounded-xl text-xs font-bold transition-all hover:scale-[1.01]"
          style={{ background: `${color}15`, color, border: `1px solid ${color}33` }}
        >
          Ver ranking completo →
        </button>
      )}
    </div>
  )
}
