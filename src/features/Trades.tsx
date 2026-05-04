import { useLiveQuery } from 'dexie-react-hooks'
import { getCollection } from '../db'

export function Trades() {
  const collection = useLiveQuery(() => getCollection(), [])
  const duplicates = collection?.filter(sticker => sticker.duplicateCount > 0) ?? []
  const missing = collection?.filter(sticker => sticker.section !== 'promo' && !sticker.owned) ?? []

  const duplicateText = duplicates.map(sticker => `${sticker.id.replace('-', ' ')} x${sticker.duplicateCount}`).join('\n')
  const missingText = missing.map(sticker => sticker.id.replace('-', ' ')).join('\n')

  return (
    <div className="p-4 space-y-5">
      <div>
        <h2 className="text-xl font-bold">Cambios</h2>
        <p className="text-sm text-gray-500">Listas listas para copiar y mandar por WhatsApp.</p>
      </div>

      <TradeSection
        title={`Repetidas (${duplicates.length})`}
        empty="No tienes cromos repetidos aún."
        value={duplicateText}
      />

      <TradeSection
        title={`Faltantes base (${missing.length})`}
        empty="No tienes faltantes detectados."
        value={missingText}
      />
    </div>
  )
}

function TradeSection({ title, value, empty }: { title: string; value: string; empty: string }) {
  const copy = async () => {
    if (!value) return
    await navigator.clipboard.writeText(value)
  }

  return (
    <section className="bg-gray-50 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <button
          onClick={copy}
          disabled={!value}
          className="text-xs px-3 py-1 rounded-full bg-white border text-gray-600 disabled:opacity-40"
        >
          Copiar
        </button>
      </div>
      {value ? (
        <textarea
          value={value}
          readOnly
          rows={Math.min(10, Math.max(4, value.split('\n').length))}
          className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm font-mono text-gray-700"
        />
      ) : (
        <p className="text-sm text-gray-400 py-8 text-center">{empty}</p>
      )}
    </section>
  )
}
