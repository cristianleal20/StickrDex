import type { StickerWithStatus } from '@/types'
import { incrementSticker, decrementSticker } from '@/db/database'

interface StickerCardProps {
  sticker: StickerWithStatus
}

const STATUS_STYLES = {
  owned: 'border-emerald-500/40 bg-emerald-500/5',
  duplicate: 'border-amber-400/50 bg-amber-400/5',
  missing: 'border-slate-700/60 bg-slate-900/80',
}

const STATUS_BADGE = {
  owned: { label: '✓', cls: 'bg-emerald-500 text-white' },
  duplicate: { label: '×2+', cls: 'bg-amber-400 text-slate-900' },
  missing: { label: '—', cls: 'bg-slate-700 text-slate-400' },
}

const TYPE_BADGE: Record<string, string> = {
  foil: '✦',
  special: '★',
  badge: '🛡',
  photo: '📸',
}

export default function StickerCard({ sticker }: StickerCardProps) {
  const badge = STATUS_BADGE[sticker.status]
  const typeMark = TYPE_BADGE[sticker.type]

  async function handleIncrement(e: React.MouseEvent) {
    e.stopPropagation()
    await incrementSticker(sticker.id)
  }

  async function handleDecrement(e: React.MouseEvent) {
    e.stopPropagation()
    await decrementSticker(sticker.id)
  }

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${STATUS_STYLES[sticker.status]}`}
    >
      {/* Number + flag */}
      <div className="flex flex-col items-center min-w-[40px]">
        <span className="text-lg leading-none">{sticker.flag}</span>
        <span className="text-xs text-slate-500 font-mono mt-0.5">#{sticker.number}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-white truncate">{sticker.name}</p>
          {typeMark && (
            <span className="text-xs text-amber-400 shrink-0">{typeMark}</span>
          )}
        </div>
        <p className="text-xs text-slate-400 truncate">{sticker.code}</p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {sticker.quantity > 0 && (
          <button
            onPointerDown={handleDecrement}
            className="w-8 h-8 rounded-full bg-slate-800 active:bg-slate-700 flex items-center justify-center text-slate-300 text-lg leading-none font-bold select-none"
            aria-label="Quitar uno"
          >
            −
          </button>
        )}

        <div className={`min-w-[32px] h-8 rounded-full flex items-center justify-center text-xs font-bold px-2 ${badge.cls}`}>
          {sticker.quantity > 1 ? `×${sticker.quantity}` : badge.label}
        </div>

        <button
          onPointerDown={handleIncrement}
          className="w-8 h-8 rounded-full bg-emerald-600 active:bg-emerald-500 flex items-center justify-center text-white text-lg leading-none font-bold select-none"
          aria-label="Agregar uno"
        >
          +
        </button>
      </div>
    </div>
  )
}
