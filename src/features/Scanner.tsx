import { useState, useRef } from 'react'
import { Camera, Image, Loader2, CheckCircle2, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
import { incrementSticker, normalizeStickerIdsFromText } from '../db'

type Status = 'idle' | 'scanning' | 'review' | 'saving' | 'done' | 'error'

export function Scanner() {
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const [rawOcrText, setRawOcrText] = useState('')
  const [pendingCodes, setPendingCodes] = useState<string[]>([])
  const [confirmedCodes, setConfirmedCodes] = useState<string[]>([])
  const [showRaw, setShowRaw] = useState(false)

  const cameraInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setStatus('scanning')
    setMessage('Procesando imagen con OCR...')
    setRawOcrText('')
    setPendingCodes([])
    setConfirmedCodes([])
    setShowRaw(false)

    try {
      const { createWorker } = await import('tesseract.js')
      const worker = await createWorker('eng')
      const { data: { text } } = await worker.recognize(file)
      await worker.terminate()

      setRawOcrText(text)
      const codes = normalizeStickerIdsFromText(text)

      if (codes.length === 0) {
        setStatus('error')
        setMessage('No se detectaron códigos tipo ARG 17, RSA 3 o MEX 12. Intenta con más luz y acercando la cámara al código impreso en el hueco del álbum.')
        return
      }

      setPendingCodes(codes)
      setStatus('review')
      setMessage(`Se detectaron ${codes.length} código(s). Revisa y confirma antes de agregar.`)
    } catch (error) {
      console.error(error)
      setStatus('error')
      setMessage('Error al procesar la imagen. Revisa que el navegador permita cargar el motor OCR.')
    }
  }

  const removeCode = (code: string) => {
    setPendingCodes(prev => prev.filter(c => c !== code))
  }

  const handleConfirm = async () => {
    if (pendingCodes.length === 0) {
      setStatus('idle')
      return
    }
    setStatus('saving')
    setMessage('Guardando en inventario...')
    try {
      for (const code of pendingCodes) {
        await incrementSticker(code, 1)
      }
      setConfirmedCodes(pendingCodes)
      setPendingCodes([])
      setStatus('done')
      setMessage(`✅ ${confirmedCodes.length || pendingCodes.length} cromo(s) agregado(s) al inventario.`)
    } catch (error) {
      console.error(error)
      setStatus('error')
      setMessage('Error al guardar en inventario.')
    }
  }

  const reset = () => {
    setStatus('idle')
    setMessage('')
    setRawOcrText('')
    setPendingCodes([])
    setConfirmedCodes([])
    setShowRaw(false)
  }

  const isBusy = status === 'scanning' || status === 'saving'

  return (
    <div className="p-4 space-y-5 pb-24">
      <div>
        <h2 className="text-xl font-bold">Escanear cromos</h2>
        <p className="text-sm text-gray-500 mt-1">
          Fotografía el código impreso en el hueco del álbum (ej. <b>RSA 3</b>, <b>PAR 10</b>). Revisa antes de confirmar.
        </p>
      </div>

      {/* Upload buttons */}
      {(status === 'idle' || status === 'done' || status === 'error') && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => { reset(); setTimeout(() => cameraInputRef.current?.click(), 50) }}
            className="bg-blue-600 text-white rounded-2xl p-6 flex flex-col items-center gap-2 active:scale-95 transition-transform"
          >
            <Camera size={30} />
            <span className="font-semibold text-sm">Tomar foto</span>
          </button>
          <button
            onClick={() => { reset(); setTimeout(() => fileInputRef.current?.click(), 50) }}
            className="bg-blue-100 text-blue-700 rounded-2xl p-6 flex flex-col items-center gap-2 active:scale-95 transition-transform"
          >
            <Image size={30} />
            <span className="font-semibold text-sm">Subir archivo</span>
          </button>
        </div>
      )}

      {/* Loading state */}
      {isBusy && (
        <div className="bg-blue-50 rounded-2xl p-8 flex flex-col items-center gap-3 text-blue-600">
          <Loader2 size={40} className="animate-spin" />
          <span className="font-semibold">{status === 'scanning' ? 'Escaneando...' : 'Guardando...'}</span>
        </div>
      )}

      {/* Review panel */}
      {status === 'review' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-orange-600">
            <AlertTriangle size={18} />
            <h3 className="font-semibold">Revisar antes de confirmar</h3>
          </div>

          <p className="text-sm text-gray-500">
            Toca <b>×</b> para eliminar códigos incorrectos antes de guardar.
          </p>

          <div className="flex flex-wrap gap-2">
            {pendingCodes.map(code => (
              <span
                key={code}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-sm font-medium text-orange-800"
              >
                {code.replace('-', ' ')}
                <button
                  onClick={() => removeCode(code)}
                  className="ml-1 text-orange-400 hover:text-orange-700 font-bold"
                  aria-label={`Eliminar ${code}`}
                >
                  ×
                </button>
              </span>
            ))}
            {pendingCodes.length === 0 && (
              <p className="text-sm text-gray-400">Todos los códigos eliminados.</p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              disabled={pendingCodes.length === 0}
              className="flex-1 bg-green-600 text-white rounded-xl py-3 font-semibold disabled:opacity-40 active:scale-95 transition-transform"
            >
              ✅ Confirmar ({pendingCodes.length})
            </button>
            <button
              onClick={reset}
              className="px-4 bg-gray-100 text-gray-700 rounded-xl py-3 font-medium active:scale-95 transition-transform"
            >
              Cancelar
            </button>
          </div>

          {/* Raw OCR debug panel */}
          {rawOcrText && (
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowRaw(r => !r)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs text-gray-500 bg-gray-50"
              >
                <span>Texto OCR bruto (debug)</span>
                {showRaw ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {showRaw && (
                <pre className="p-3 text-xs text-gray-600 bg-white overflow-x-auto whitespace-pre-wrap break-all max-h-40">
                  {rawOcrText}
                </pre>
              )}
            </div>
          )}
        </div>
      )}

      {/* Status message */}
      {message && !isBusy && status !== 'review' && (
        <div className={`rounded-xl p-4 text-sm ${status === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      {/* Confirmed codes summary */}
      {status === 'done' && confirmedCodes.length > 0 && (
        <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <CheckCircle2 size={18} className="text-green-600" />
            Agregados al inventario
          </div>
          <div className="flex flex-wrap gap-2">
            {confirmedCodes.map(code => (
              <span key={code} className="px-3 py-1 rounded-full bg-white border text-sm font-medium text-gray-700">
                {code.replace('-', ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={e => { if (e.target.files?.[0]) { handleFile(e.target.files[0]); e.target.value = '' } }}
      />
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={e => { if (e.target.files?.[0]) { handleFile(e.target.files[0]); e.target.value = '' } }}
      />
    </div>
  )
}
