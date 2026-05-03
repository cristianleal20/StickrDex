import { useState } from 'react'
import { useInventory } from '@/hooks/useInventory'
import { buildTradeExport, toWhatsAppText, matchTrades } from '@/lib/trading'
import type { TradeMatch } from '@/types'

type Tab = 'my-list' | 'match'

export default function Trades() {
  const [tab, setTab] = useState<Tab>('my-list')
  const [friendJson, setFriendJson] = useState('')
  const [match, setMatch] = useState<TradeMatch | null>(null)
  const [matchError, setMatchError] = useState('')
  const [copied, setCopied] = useState(false)

  const { stickersWithStatus, stats } = useInventory()

  const duplicates = stickersWithStatus.filter(s => s.quantity > 1)
  const missing = stickersWithStatus.filter(s => s.quantity === 0)

  function handleCopyWhatsApp() {
    const text = toWhatsAppText(stickersWithStatus)
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleExportJson() {
    const data = buildTradeExport(stickersWithStatus)
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stickrdex-trade-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleMatch() {
    if (!friendJson.trim()) {
      setMatchError('Pega aquí el JSON de tu amigo')
      return
    }
    try {
      const result = matchTrades(stickersWithStatus, friendJson)
      setMatch(result)
      setMatchError('')
    } catch {
      setMatchError('JSON inválido. Asegúrate de que sea el archivo exportado desde StickrDex.')
    }
  }

  return (
    <div className="flex flex-col min-h-svh pb-nav">
      {/* Header */}
      <div className="bg-slate-950 pt-12 px-4 pb-4 border-b border-slate-800/50">
        <h1 className="text-xl font-bold text-white">Intercambios</h1>
        <p className="text-xs text-slate-500 mt-1">{duplicates.length} repetidos · {missing.length} faltantes</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-950 px-4 gap-2 py-3 border-b border-slate-800/50">
        {([['my-list', 'Mi lista'], ['match', 'Comparar']] as [Tab, string][]).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === id ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none">
        {/* MY LIST TAB */}
        {tab === 'my-list' && (
          <div className="px-4 py-4 space-y-4">
            {/* Export actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCopyWhatsApp}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center active:bg-slate-800 flex flex-col items-center gap-2"
              >
                <span className="text-2xl">{copied ? '✅' : '💬'}</span>
                <p className="text-xs font-semibold text-white">{copied ? '¡Copiado!' : 'Copiar WhatsApp'}</p>
              </button>
              <button
                onClick={handleExportJson}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center active:bg-slate-800 flex flex-col items-center gap-2"
              >
                <span className="text-2xl">📥</span>
                <p className="text-xs font-semibold text-white">Exportar JSON</p>
              </button>
            </div>

            {/* Duplicates */}
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">
                Me sobran ({duplicates.length})
              </p>
              {duplicates.length === 0 ? (
                <p className="text-sm text-slate-600 py-4 text-center">Sin repetidos aún</p>
              ) : (
                <div className="space-y-1.5">
                  {duplicates.map(s => (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 bg-slate-900 rounded-xl px-4 py-2.5 border border-amber-400/20"
                    >
                      <span>{s.flag}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.code}</p>
                      </div>
                      <span className="text-xs font-bold text-amber-400 bg-amber-400/10 rounded-full px-2 py-0.5">
                        ×{s.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Missing */}
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">
                Me faltan ({missing.length})
              </p>
              {missing.length === 0 ? (
                <p className="text-sm text-emerald-400 py-4 text-center font-semibold">¡Álbum completo! 🎉</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {missing.slice(0, 120).map(s => (
                    <span
                      key={s.id}
                      className="text-xs bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-300"
                    >
                      {s.number}
                    </span>
                  ))}
                  {missing.length > 120 && (
                    <span className="text-xs text-slate-500 px-2 py-1">
                      +{missing.length - 120} más
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MATCH TAB */}
        {tab === 'match' && (
          <div className="px-4 py-4 space-y-4">
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
              <p className="text-sm font-semibold text-white mb-1">JSON de tu amigo</p>
              <p className="text-xs text-slate-500 mb-3">
                Pide a tu amigo que exporte su lista desde StickrDex y pega el JSON aquí
              </p>
              <textarea
                value={friendJson}
                onChange={e => setFriendJson(e.target.value)}
                placeholder='{ "duplicates": [...], "missing": [...] }'
                rows={5}
                className="w-full bg-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:ring-1 focus:ring-emerald-500 resize-none font-mono"
              />
              {matchError && <p className="text-xs text-rose-400 mt-2">{matchError}</p>}
              <button
                onClick={handleMatch}
                className="mt-3 w-full bg-emerald-600 active:bg-emerald-500 rounded-xl py-3 text-sm font-bold text-white"
              >
                Comparar colecciones
              </button>
            </div>

            {match && (
              <>
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4">
                  <p className="text-sm font-bold text-emerald-400 mb-3">
                    Puedo darle ({match.iCanGive.length})
                  </p>
                  {match.iCanGive.length === 0 ? (
                    <p className="text-xs text-slate-500">Ningún cromo en común</p>
                  ) : (
                    <div className="space-y-1.5">
                      {match.iCanGive.map(s => (
                        <div key={s.id} className="flex items-center gap-2">
                          <span>{s.flag}</span>
                          <p className="text-sm text-white flex-1 truncate">{s.name}</p>
                          <span className="text-xs text-slate-400">#{s.number}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-sky-500/10 border border-sky-500/30 rounded-2xl p-4">
                  <p className="text-sm font-bold text-sky-400 mb-3">
                    Puedo recibir ({match.iCanReceive.length})
                  </p>
                  {match.iCanReceive.length === 0 ? (
                    <p className="text-xs text-slate-500">Ningún cromo en común</p>
                  ) : (
                    <div className="space-y-1.5">
                      {match.iCanReceive.map(s => (
                        <div key={s.id} className="flex items-center gap-2">
                          <span>{s.flag}</span>
                          <p className="text-sm text-white flex-1 truncate">{s.name}</p>
                          <span className="text-xs text-slate-400">#{s.number}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
