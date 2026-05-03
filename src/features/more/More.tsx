import { useState } from 'react'
import { useInventory } from '@/hooks/useInventory'
import { exportData, importData, resetCollection } from '@/db/database'

export default function More() {
  const { stats } = useInventory()
  const [confirmReset, setConfirmReset] = useState(false)
  const [msg, setMsg] = useState('')

  async function handleExport() {
    const json = await exportData()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stickrdex-backup-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    showMsg('✅ Copia de seguridad exportada')
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      await importData(text)
      showMsg('✅ Colección importada correctamente')
    } catch {
      showMsg('❌ Error al importar. Verifica el archivo.')
    }
    e.target.value = ''
  }

  async function handleReset() {
    await resetCollection()
    setConfirmReset(false)
    showMsg('✅ Colección reiniciada')
  }

  function showMsg(text: string) {
    setMsg(text)
    setTimeout(() => setMsg(''), 3000)
  }

  return (
    <div className="flex flex-col min-h-svh pb-nav overflow-y-auto scrollbar-none">
      {/* Header */}
      <div className="bg-slate-950 pt-12 px-4 pb-6 border-b border-slate-800/50">
        <h1 className="text-xl font-bold text-white">Ajustes</h1>
      </div>

      {/* Stats summary */}
      <div className="mx-4 mt-5 bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">Resumen</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-2xl font-black text-emerald-400">{stats.owned}</p>
            <p className="text-xs text-slate-500">Tengo</p>
          </div>
          <div>
            <p className="text-2xl font-black text-rose-400">{stats.missing}</p>
            <p className="text-xs text-slate-500">Faltan</p>
          </div>
          <div>
            <p className="text-2xl font-black text-amber-400">{stats.duplicates}</p>
            <p className="text-xs text-slate-500">Repetidos</p>
          </div>
        </div>
        <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.percentage}%` }} />
        </div>
        <p className="text-right text-xs text-slate-400 mt-1">{stats.percentage.toFixed(1)}% completado</p>
      </div>

      {/* Data management */}
      <div className="mx-4 mt-4">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">Gestión de datos</p>
        <div className="space-y-2">
          <button
            onClick={handleExport}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3.5 flex items-center gap-3 active:bg-slate-800 text-left"
          >
            <span className="text-xl">📤</span>
            <div>
              <p className="text-sm font-semibold text-white">Exportar copia de seguridad</p>
              <p className="text-xs text-slate-500">Guarda tu progreso en un archivo JSON</p>
            </div>
          </button>

          <label className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3.5 flex items-center gap-3 active:bg-slate-800 cursor-pointer">
            <span className="text-xl">📥</span>
            <div>
              <p className="text-sm font-semibold text-white">Importar copia de seguridad</p>
              <p className="text-xs text-slate-500">Restaura desde un archivo JSON previo</p>
            </div>
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
        </div>
      </div>

      {/* Danger zone */}
      <div className="mx-4 mt-6">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">Zona de peligro</p>
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="w-full bg-slate-900 border border-rose-500/30 rounded-xl px-4 py-3.5 flex items-center gap-3 active:bg-rose-500/10 text-left"
          >
            <span className="text-xl">🗑</span>
            <div>
              <p className="text-sm font-semibold text-rose-400">Reiniciar colección</p>
              <p className="text-xs text-slate-500">Borra todo el progreso (irreversible)</p>
            </div>
          </button>
        ) : (
          <div className="bg-slate-900 border border-rose-500/50 rounded-xl p-4">
            <p className="text-sm font-semibold text-white mb-1">¿Estás seguro?</p>
            <p className="text-xs text-slate-400 mb-4">Esta acción borrará todos tus cromos marcados. No se puede deshacer.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmReset(false)}
                className="flex-1 bg-slate-800 rounded-xl py-2.5 text-sm font-semibold text-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleReset}
                className="flex-1 bg-rose-600 active:bg-rose-500 rounded-xl py-2.5 text-sm font-bold text-white"
              >
                Sí, reiniciar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* App info */}
      <div className="mx-4 mt-6 mb-4">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">Acerca de</p>
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">⚽</span>
            <div>
              <p className="font-bold text-white">StickrDex</p>
              <p className="text-xs text-slate-500">Panini Copa Mundial 2026</p>
            </div>
          </div>
          <div className="space-y-1.5 text-xs text-slate-500">
            <p>📦 {stats.total} cromos en total</p>
            <p>💾 Datos guardados localmente en tu dispositivo</p>
            <p>📡 Funciona sin conexión (PWA)</p>
            <p className="pt-1 text-slate-600">v1.0.0 · Datos aproximados, verificar con álbum oficial</p>
          </div>
        </div>
      </div>

      {/* Toast */}
      {msg && (
        <div className="fixed bottom-24 left-4 right-4 bg-slate-800 text-white text-sm font-medium py-3 px-4 rounded-xl shadow-2xl text-center z-50 border border-slate-700">
          {msg}
        </div>
      )}
    </div>
  )
}
