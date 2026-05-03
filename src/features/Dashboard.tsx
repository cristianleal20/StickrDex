import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'

export function Dashboard() {
  const stickers = useLiveQuery(() => db.stickers.toArray(), [])
  const owned = stickers?.filter(s => s.owned).length ?? 0
  const total = stickers?.length ?? 0
  const pct = total > 0 ? Math.round((owned / total) * 100) : 0

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">StickrDex</h1>
      <p className="text-gray-500 text-sm">Mundial 2026 · Álbum Panini</p>

      <div className="bg-blue-600 rounded-2xl p-6 text-white space-y-2">
        <p className="text-blue-100 text-sm">Progreso del álbum</p>
        <div className="flex items-end gap-2">
          <span className="text-5xl font-bold">{pct}%</span>
        </div>
        <div className="w-full bg-blue-500 rounded-full h-2 mt-2">
          <div
            className="bg-white rounded-full h-2 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-blue-100 text-xs">{owned} de {total} figuritas</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Tengo" value={owned} color="green" />
        <StatCard label="Faltan" value={total - owned} color="orange" />
        <StatCard label="Total" value={total} color="blue" />
        <StatCard label="Completado" value={`${pct}%`} color="purple" />
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  const colors: Record<string, string> = {
    green: 'bg-green-50 text-green-700',
    orange: 'bg-orange-50 text-orange-700',
    blue: 'bg-blue-50 text-blue-700',
    purple: 'bg-purple-50 text-purple-700',
  }
  return (
    <div className={`rounded-xl p-4 ${colors[color]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs mt-1 opacity-70">{label}</p>
    </div>
  )
}
