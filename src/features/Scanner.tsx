import { useState, useRef } from 'react'
import { Camera, Loader2, CheckCircle2 } from 'lucide-react'
import { incrementSticker, normalizeStickerIdsFromText } from '../db'

export function Scanner() {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [detectedCodes, setDetectedCodes] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setStatus('scanning')
    setDetectedCodes([])
    setMessage('Procesando imagen con OCR...')

    try {
      const { createWorker } = await import('tesseract.js')
      const worker = await createWorker('eng')
      const { data: { text } } = await worker.recognize(file)
      await worker.terminate()

      const codes = normalizeStickerIdsFromText(text)

      if (codes.length === 0) {
        setStatus('error')
        setMessage('No se detectaron códigos tipo ARG 17, RSA 3 o MEX 12. Intenta con más luz y acercando la cámara al hueco.')
        return
      }

      for (const code of codes) {
        await incrementSticker(code, 1)
      }

      setDetectedCodes(codes)
      setStatus('done')
      setMessage(`✅ ${codes.length} cromo(s) agregado(s): ${codes.join(', ')}`)
    } catch (error) {
      console.error(error)
      setStatus('error')
      setMessage('Error al procesar la imagen. Revisa que el navegador permita cargar OCR o intenta con otra foto.')
    }
  }

  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-xl font-bold">Escanear cromos</h2>
        <p className="text-sm text-gray-500 mt-1">
          Sube una foto de un cromo o de un hueco visible. El OCR buscará códigos como <b>RSA 3</b>, <b>PAR 10</b> o <b>MEX 13</b>.
        </p>
      </div>

      <button
        onClick={() => inputRef.current?.click()}
        disabled={status === 'scanning'}
        className="w-full bg-blue-600 text-white rounded-2xl p-8 flex flex-col items-center gap-3 active:scale-95 transition-transform disabled:opacity-60"
      >
        {status === 'scanning'
          ? <Loader2 size={40} className="animate-spin" />
          : <Camera size={40} />
        }
        <span className="font-semibold">
          {status === 'scanning' ? 'Escaneando...' : 'Tomar / Subir foto'}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {message && (
        <div className={`rounded-xl p-4 text-sm ${status === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      {detectedCodes.length > 0 && (
        <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <CheckCircle2 size={18} className="text-green-600" />
            Detectados
          </div>
          <div className="flex flex-wrap gap-2">
            {detectedCodes.map(code => (
              <span key={code} className="px-3 py-1 rounded-full bg-white border text-sm font-medium text-gray-700">
                {code.replace('-', ' ')}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
