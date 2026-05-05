interface RankingListItemProps {
  posicion: number
  nombreQuiniela: string
  puntos: number
}

const medalColor: Record<number, string> = { 1: '#D4AF37', 2: '#94A3B8', 3: '#CD7F32' }

export default function RankingListItem ({ posicion, nombreQuiniela, puntos }: RankingListItemProps) {
  const color = medalColor[posicion] ?? '#60A5FA'

  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all hover:scale-[1.01]"
      style={{ background: '#0D1B2A', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
        style={{ background: `${color}1A`, color }}
      >
        {posicion <= 3 ? ['🥇', '🥈', '🥉'][posicion - 1] : `#${posicion}`}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{nombreQuiniela}</p>
      </div>

      <p className="text-sm font-black shrink-0" style={{ color }}>
        {puntos} <span className="text-[10px] font-normal" style={{ color: '#6B7280' }}>pts</span>
      </p>
    </div>
  )
}
