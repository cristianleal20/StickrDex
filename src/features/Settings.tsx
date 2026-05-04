import { useRef, useState } from 'react'
import { CHECKLIST, db, importInventory, type InventoryItem } from '../db'

export function Settings() {
  const [confirming, setConfirming] = useState(false)
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const resetAlbum = async () => {
    await db.inventory.clear()
    setConfirming(false)
    setMessage('Álbum reiniciado.')
  }

  const exportInventory = async () => {
    const inventory = await db.inventory.toArray()
    const blob = new Blob([JSON.stringify(inventory, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'stickrdex-inventory.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const importInventoryFile = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as InventoryItem[]
      if (!Array.isArray(parsed)) throw new Error('El archivo no contiene una lista JSON.')
      const imported = await importInventory(parsed)
      setMessage(`Inventario importado: ${imported} registros válidos.`)
    } catch (error) {
      console.error(error)
      setMessage('No se pudo importar el inventario. Revisa el formato JSON.')
    }
  }

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold">Configuración</h2>

      <div className="space-y-3">
        <Section title="Acerca de">
          <InfoRow label="App" value="StickrDex" />
          <InfoRow label="Álbum" value="Panini · Mundial 2026" />
          <InfoRow label="Base" value="980 cromos" />
          <InfoRow label="Con promos" value={`${CHECKLIST.length} registros`} />
        </Section>

        <Section title="Datos">
          <button
            onClick={exportInventory}
            className="w-full text-left px-4 py-3 text-blue-600 text-sm font-medium hover:bg-blue-50 rounded-xl transition-colors"
          >
            Exportar inventario JSON
          </button>

          <button
            onClick={() => inputRef.current?.click()}
            className="w-full text-left px-4 py-3 text-gray-700 text-sm font-medium hover:bg-gray-100 rounded-xl transition-colors"
          >
            Importar inventario JSON del módulo OCR
          </button>

          <input
            ref={inputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={event => event.target.files?.[0] && importInventoryFile(event.target.files[0])}
          />

          {!confirming ? (
            <button
              onClick={() => setConfirming(true)}
              className="w-full text-left px-4 py-3 text-red-600 text-sm font-medium hover:bg-red-50 rounded-xl transition-colors"
            >
              Reiniciar álbum
            </button>
          ) : (
            <div className="px-4 py-3 space-y-3">
              <p className="text-sm text-red-700">¿Seguro? Se borrará todo tu progreso.</p>
              <div className="flex gap-2">
                <button
                  onClick={resetAlbum}
                  className="flex-1 bg-red-600 text-white text-sm py-2 rounded-xl font-medium"
                >
                  Sí, borrar
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="flex-1 bg-gray-100 text-gray-700 text-sm py-2 rounded-xl font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </Section>

        <Section title="OCR local">
          <div className="px-4 py-3 text-sm text-gray-600 space-y-2">
            <p>El módulo local vive en:</p>
            <code className="block bg-white border rounded-xl p-2 text-xs text-gray-700">tools/stickerdex-ocr</code>
            <p>Corre el script en tu computadora y después importa aquí el archivo <b>inventory_import.json</b>.</p>
          </div>
        </Section>
      </div>

      {message && (
        <div className="rounded-xl p-4 text-sm bg-blue-50 text-blue-700">
          {message}
        </div>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 rounded-2xl overflow-hidden">
      <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">{title}</p>
      {children}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center px-4 py-2 text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="text-gray-900 font-medium">{value}</span>
    </div>
  )
}
