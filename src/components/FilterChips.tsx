import type { FilterType } from '@/types'

interface FilterChipsProps {
  active: FilterType
  onChange: (f: FilterType) => void
  counts: Record<FilterType, number>
}

const CHIPS: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'owned', label: 'Tengo' },
  { id: 'missing', label: 'Faltan' },
  { id: 'duplicates', label: 'Repetidos' },
  { id: 'specials', label: 'Especiales' },
]

export default function FilterChips({ active, onChange, counts }: FilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none px-4 py-2">
      {CHIPS.map(chip => (
        <button
          key={chip.id}
          onClick={() => onChange(chip.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
            active === chip.id
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-800 text-slate-300 active:bg-slate-700'
          }`}
        >
          {chip.label}
          <span
            className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
              active === chip.id ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-400'
            }`}
          >
            {counts[chip.id]}
          </span>
        </button>
      ))}
    </div>
  )
}
