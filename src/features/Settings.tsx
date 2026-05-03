import { useState } from 'react'
import { db } from '../db'

export function Settings() {
  const [confirming, setConfirming] = useState(false)

  const resetAlbum = async () => {
    await db.stickers.clear()
    setConfirming(false)
  }

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold">Configuración</h2>

      <div className="space-y-3">
        <Section title="Acerca de">
          <InfoRow label="App" value="StickrDex" />
          <InfoRow label="Álbum" value="Panini · Mundial 2026" />
          <InfoRow label="Total figuritas" value="670" />
        </Section>

        <Section title="Datos">
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
      </div>
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
