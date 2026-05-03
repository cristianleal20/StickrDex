interface StatCardProps {
  label: string
  value: number | string
  sub?: string
  color?: 'green' | 'red' | 'amber' | 'blue' | 'slate'
}

const COLOR_MAP = {
  green: 'text-emerald-400',
  red: 'text-rose-400',
  amber: 'text-amber-400',
  blue: 'text-sky-400',
  slate: 'text-slate-300',
}

export default function StatCard({ label, value, sub, color = 'slate' }: StatCardProps) {
  return (
    <div className="bg-slate-900 rounded-2xl p-4 flex flex-col gap-1">
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold ${COLOR_MAP[color]}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  )
}
