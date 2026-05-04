import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { CHECKLIST, getCollection, setStickerQuantity, type StickerWithQuantity } from '../db'
import { clsx } from 'clsx'

type Filter = 'all' | 'owned' | 'missing' | 'duplicates'

export function Album() {
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const collection = useLiveQuery(() => getCollection(), [])

  const filtered = (collection ?? []).filter(sticker => {
    if (filter === 'owned' && !sticker.owned) return false
    if (filter === 'missing' && sticker.owned) return false
    if (filter === 'duplicates' && sticker.duplicateCount === 0) return false

    const term = search.trim().toLowerCase()
    if (!term) return true

    return [sticker.id, sticker.country, sticker.name, sticker.prefix]
      .some(value => value.toLowerCase().includes(term))
  })

  const updateQuantity = async (sticker: StickerWithQuantity, delta: number) => {
    await setStickerQuantity(sticker.id, sticker.quantity + delta)
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-xl font-bold">Álbum</h2>
        <p className="text-xs text-gray-500">Checklist base: 980 cromos · Extras Coca-Cola incluidos aparte</p>
      </div>

      <input
        value={search}
        onChange={event => setSearch(event.target.value)}
        placeholder="Buscar MEX 13, Argentina, FWC..."
        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-blue-500"
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {([
          ['all', 'Todas'],
          ['owned', 'Tengo'],
          ['missing', 'Faltan'],
          ['duplicates', 'Repetidas']
        ] as [Filter, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={clsx(
              'px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              filter === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📒</p>
          <p className="text-sm">No hay resultados.</p>
          <p className="text-xs mt-1">Prueba con otro filtro o búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map(sticker => (
            <div
              key={sticker.id}
              className={clsx(
                'rounded-2xl border p-3 space-y-3',
                sticker.owned
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-gray-50 border-gray-200'
              )}
            >
              <div>
                <p className={clsx('text-sm font-bold', sticker.owned ? 'text-blue-700' : 'text-gray-500')}>
                  {sticker.id.replace('-', ' ')}
                </p>
                <p className="text-xs text-gray-500 truncate">{sticker.country}</p>
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => updateQuantity(sticker, -1)}
                  disabled={sticker.quantity === 0}
                  className="w-8 h-8 rounded-full bg-white border text-gray-700 disabled:opacity-40"
                >
                  −
                </button>
                <span className="text-sm font-bold text-gray-900">{sticker.quantity}</span>
                <button
                  onClick={() => updateQuantity(sticker, 1)}
                  className="w-8 h-8 rounded-full bg-blue-600 text-white"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[11px] text-gray-400 text-center">
        Total cargado en checklist: {CHECKLIST.length} registros incluyendo promos.
      </p>
    </div>
  )
}
