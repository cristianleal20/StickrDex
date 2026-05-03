import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { clsx } from 'clsx'

export function Album() {
  const [filter, setFilter] = useState<'all' | 'owned' | 'missing'>('all')
  const stickers = useLiveQuery(() => db.stickers.toArray(), [])

  const filtered = stickers?.filter(s => {
    if (filter === 'owned') return s.owned
    if (filter === 'missing') return !s.owned
    return true
  }) ?? []

  const toggle = async (id: number, owned: boolean) => {
    await db.stickers.update(id, { owned: !owned })
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Álbum</h2>

      <div className="flex gap-2">
        {(['all', 'owned', 'missing'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'px-3 py-1 rounded-full text-sm font-medium transition-colors',
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {f === 'all' ? 'Todas' : f === 'owned' ? 'Tengo' : 'Faltan'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📒</p>
          <p className="text-sm">No hay figuritas aún.</p>
          <p className="text-xs mt-1">Usa el escáner para agregar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {filtered.map(s => (
            <button
              key={s.id}
              onClick={() => toggle(s.id!, s.owned)}
              className={clsx(
                'aspect-square rounded-xl flex items-center justify-center text-sm font-bold border-2 transition-all',
                s.owned
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-gray-100 border-gray-200 text-gray-400'
              )}
            >
              {s.number}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
