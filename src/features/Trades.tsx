import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'

export function Trades() {
  const stickers = useLiveQuery(() => db.stickers.toArray(), [])
  const duplicates = stickers?.filter(s => s.owned && (s.quantity ?? 1) > 1) ?? []

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Cambios</h2>
      <p className="text-sm text-gray-500">Figuritas disponibles para cambiar.</p>

      {duplicates.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔄</p>
          <p className="text-sm">No tienes figuritas repetidas aún.</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {duplicates.map(s => (
            <div
              key={s.id}
              className="aspect-square rounded-xl bg-yellow-100 border-2 border-yellow-300 flex flex-col items-center justify-center text-sm font-bold text-yellow-700"
            >
              <span>{s.number}</span>
              {(s.quantity ?? 1) > 1 && (
                <span className="text-xs opacity-70">×{s.quantity}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
