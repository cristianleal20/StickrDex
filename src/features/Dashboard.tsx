import { useLiveQuery } from 'dexie-react-hooks'
import { db, getCollection } from '../db'

export function Dashboard() {
  const collection = useLiveQuery(() => getCollection(), [db.inventory])
  const owned = collection?.filter(s => s.owned).length ?? 0
  const duplicates = collection?.reduce((sum, s) => sum + s.duplicateCount, 0) ?? 0
  const total = collection?.filter(s => s.section !== 'promo').length ?? 980
  const ownedBase = collection?.filter(s => s.section !== 'promo' && s.owned).length ?? 0
  const pct = total > 0 ? Math.round((ownedBase / total) * 100) : 0

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">StickrDex</h1>
      <p className="text-gray-500 text-sm">Mundial 2026 · Álbum Panini</p>

      <div className="bg-blue-600 rounded-2xl p-6 text-white space-y-2">
        <p className="text-blue-100 text-sm">Progreso del álbum base</p>
        <div className="flex items-end gap-2">
          <span className="text-5xl font-bold">{pct}%</span>
        </div>
        <div className="w-full bg-blue-500 rounded-full h-2 mt-2">
          <div
            className="bg-white rounded-full h-2 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-blue-100 text-xs">{ownedBase} de {total} cromos base</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Tengo" value={ownedBase} color="green" />
        <StatCard label="Faltan" value={total - ownedBase} color="orange" />
        <StatCard label="Total base" value={total} color="blue" />
        <StatCard label="Repetidos" value={duplicates} color="purple" />
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
