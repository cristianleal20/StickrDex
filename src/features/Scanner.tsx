import { useState, useRef } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { db } from '../db'

export function Scanner() {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setStatus('scanning')
    setMessage('Procesando imagen...')
    try {
      const { createWorker } = await import('tesseract.js')
      const worker = await createWorker('spa')
      const { data: { text } } = await worker.recognize(file)
      await worker.terminate()

      const numbers = [...text.matchAll(/\b(\d{1,4})\b/g)].map(m => parseInt(m[1]))
      const unique = [...new Set(numbers)].filter(n => n >= 1 && n <= 670)

      if (unique.length === 0) {
        setStatus('error')
        setMessage('No se detectaron números de figuritas.')
        return
      }

      for (const n of unique) {
        const exists = await db.stickers.where('number').equals(n).first()
        if (!exists) {
          await db.stickers.add({ number: n, owned: true, createdAt: new Date() })
        } else {
          await db.stickers.where('number').equals(n).modify({ owned: true })
        }
      }

      setStatus('done')
      setMessage(`✅ ${unique.length} figurita(s) detectada(s): ${unique.slice(0, 10).join(', ')}${unique.length > 10 ? '...' : ''}`)
    } catch {
      setStatus('error')
      setMessage('Error al procesar la imagen.')
    }
  }

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold">Escanear figuritas</h2>
      <p className="text-sm text-gray-500">Fotografía tus figuritas y detectaremos los números automáticamente.</p>

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
    </div>
  )
}
