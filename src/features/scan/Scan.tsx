import { useState, useRef, useCallback } from 'react'
import { runOcr } from '@/lib/ocr'
import { STICKER_MAP } from '@/data/stickers'
import { bulkMarkOwned, incrementSticker } from '@/db/database'
import type { Sticker } from '@/types'

type ScanStep = 'idle' | 'scanning' | 'review' | 'done'

export default function Scan() {
  const [step, setStep] = useState<ScanStep>('idle')
  const [progress, setProgress] = useState(0)
  const [detected, setDetected] = useState<Sticker[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [manualInput, setManualInput] = useState('')
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    setError('')
    setStep('scanning')
    setProgress(0)
    try {
      const result = await runOcr(file, setProgress)
      const stickers = result.detectedIds
        .map(id => STICKER_MAP.get(id))
        .filter(Boolean) as Sticker[]

      setDetected(stickers)
      setSelected(new Set(stickers.map(s => s.id)))
      setStep('review')
    } catch (err) {
      setError('Error al procesar la imagen. Intenta con otra foto más nítida.')
      setStep('idle')
    }
  }, [])

  function handleManualAdd() {
    const ids = manualInput
      .split(/[\s,;]+/)
      .map(t => t.trim().toUpperCase())
      .filter(Boolean)

    const stickers: Sticker[] = []
    for (const token of ids) {
      // Try by code (e.g. "ARG-3") or by number
      const byCode = STICKER_MAP.get(token)
      if (byCode) { stickers.push(byCode); continue }
      const num = parseInt(token)
      if (!isNaN(num)) {
        const byNum = [...STICKER_MAP.values()].find(s => s.number === num)
        if (byNum) stickers.push(byNum)
      }
    }

    if (stickers.length === 0) {
      setError('No se encontraron cromos válidos. Usa el código (ARG-3) o el número (330).')
      return
    }
    setDetected(stickers)
    setSelected(new Set(stickers.map(s => s.id)))
    setManualInput('')
    setError('')
    setStep('review')
  }

  async function handleConfirm() {
    const ids = [...selected]
    await bulkMarkOwned(ids)
    setStep('done')
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function reset() {
    setStep('idle')
    setDetected([])
    setSelected(new Set())
    setError('')
  }

  return (
    <div className="flex flex-col min-h-svh pb-nav">
      {/* Header */}
      <div className="bg-slate-950 pt-12 px-4 pb-4 border-b border-slate-800/50">
        <h1 className="text-xl font-bold text-white">Escanear cromos</h1>
        <p className="text-xs text-slate-500 mt-1">Foto del álbum o entrada manual</p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none px-4 py-4 space-y-4">
        {/* IDLE */}
        {step === 'idle' && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full bg-emerald-600 active:bg-emerald-500 rounded-2xl p-6 flex flex-col items-center gap-3 transition-colors"
            >
              <span className="text-5xl">📷</span>
              <p className="text-lg font-bold text-white">Tomar foto</p>
              <p className="text-sm text-emerald-200">Apunta al reverso de los cromos o a una página del álbum</p>
            </button>

            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-xs text-slate-600 uppercase">o</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            {/* Manual input */}
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
              <p className="text-sm font-semibold text-white mb-2">Entrada manual</p>
              <p className="text-xs text-slate-500 mb-3">Escribe los números o códigos separados por coma o espacio</p>
              <textarea
                value={manualInput}
                onChange={e => setManualInput(e.target.value)}
                placeholder="Ej: 330, 331, ARG-3, 145, 78..."
                rows={3}
                className="w-full bg-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
              />
              {error && <p className="text-xs text-rose-400 mt-2">{error}</p>}
              <button
                onClick={handleManualAdd}
                disabled={!manualInput.trim()}
                className="mt-3 w-full bg-sky-600 active:bg-sky-500 disabled:opacity-40 rounded-xl py-2.5 text-sm font-semibold text-white"
              >
                Añadir cromos
              </button>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/50">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Consejos para el escaneo</p>
              <ul className="text-xs text-slate-500 space-y-1">
                <li>• Fotografía el reverso de los cromos (muestra el número)</li>
                <li>• Buena iluminación, sin reflejos</li>
                <li>• Si el OCR falla, usa la entrada manual</li>
                <li>• Puedes introducir varios números a la vez</li>
              </ul>
            </div>
          </>
        )}

        {/* SCANNING */}
        {step === 'scanning' && (
          <div className="flex flex-col items-center justify-center py-20 gap-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
              <div
                className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"
              />
              <span className="absolute inset-0 flex items-center justify-center text-2xl">📷</span>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white">Analizando imagen...</p>
              <p className="text-sm text-slate-400 mt-1">{progress}% completado</p>
            </div>
            <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* REVIEW */}
        {step === 'review' && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">
                {detected.length} cromo{detected.length !== 1 ? 's' : ''} detectado{detected.length !== 1 ? 's' : ''}
              </p>
              <button onClick={reset} className="text-xs text-slate-400 active:text-white">
                Cancelar
              </button>
            </div>

            {detected.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <p className="text-4xl mb-3">🤷</p>
                <p className="font-medium">No se detectaron cromos</p>
                <p className="text-sm mt-1">Intenta con una foto más nítida o usa la entrada manual</p>
                <button onClick={reset} className="mt-4 text-sm text-emerald-400 font-semibold">
                  Intentar de nuevo
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-500">
                  Selecciona los cromos que realmente tienes y pulsa "Confirmar"
                </p>

                <div className="space-y-2">
                  {detected.map(s => {
                    const isSelected = selected.has(s.id)
                    return (
                      <button
                        key={s.id}
                        onClick={() => toggleSelect(s.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-emerald-500/60 bg-emerald-500/10'
                            : 'border-slate-700 bg-slate-900/50 opacity-50'
                        }`}
                      >
                        <span className="text-xl">{s.flag}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{s.name}</p>
                          <p className="text-xs text-slate-400">{s.code} · #{s.number}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${
                          isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600'
                        }`}>
                          {isSelected && <span className="text-xs text-white font-bold">✓</span>}
                        </div>
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={handleConfirm}
                  disabled={selected.size === 0}
                  className="w-full bg-emerald-600 active:bg-emerald-500 disabled:opacity-40 rounded-2xl py-4 text-base font-bold text-white"
                >
                  Confirmar {selected.size} cromo{selected.size !== 1 ? 's' : ''}
                </button>
              </>
            )}
          </>
        )}

        {/* DONE */}
        {step === 'done' && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <span className="text-6xl">🎉</span>
            <p className="text-2xl font-black text-white">¡Añadidos!</p>
            <p className="text-sm text-slate-400">{selected.size} cromo{selected.size !== 1 ? 's' : ''} marcado{selected.size !== 1 ? 's' : ''} como poseído{selected.size !== 1 ? 's' : ''}</p>
            <button
              onClick={reset}
              className="mt-4 bg-emerald-600 active:bg-emerald-500 rounded-2xl px-8 py-3 text-sm font-bold text-white"
            >
              Escanear más
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
