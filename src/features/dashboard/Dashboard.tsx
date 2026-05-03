import { useNavigate } from 'react-router-dom'
import { useInventory } from '@/hooks/useInventory'
import ProgressBar from '@/components/ui/ProgressBar'
import StatCard from '@/components/ui/StatCard'
import { TEAMS_INFO } from '@/data/stickers'

export default function Dashboard() {
  const { stats, stickersWithStatus } = useInventory()
  const navigate = useNavigate()

  // Confederation breakdown
  const confProgress = (['CONMEBOL', 'UEFA', 'CAF', 'AFC', 'CONCACAF', 'OFC'] as const).map(conf => {
    const teams = TEAMS_INFO.filter(t => t.confederation === conf)
    const teamCodes = new Set(teams.map(t => t.code))
    const confStickers = stickersWithStatus.filter(s => s.team !== 'INTRO' && s.team !== 'MUSEUM' && teamCodes.has(s.team))
    const ownedConf = confStickers.filter(s => s.quantity >= 1).length
    const pct = confStickers.length > 0 ? (ownedConf / confStickers.length) * 100 : 0
    return { conf, pct, owned: ownedConf, total: confStickers.length }
  })

  return (
    <div className="flex flex-col min-h-svh pb-nav overflow-y-auto scrollbar-none">
      {/* Header */}
      <div className="px-4 pt-12 pb-6 bg-gradient-to-b from-slate-900 to-slate-950">
        <p className="text-slate-400 text-sm font-medium">Copa Mundial FIFA 2026</p>
        <h1 className="text-3xl font-extrabold text-white mt-1">StickrDex</h1>
        <p className="text-slate-500 text-xs mt-1">Álbum Panini oficial</p>
      </div>

      {/* Main progress */}
      <div className="mx-4 -mt-2 bg-slate-900 rounded-2xl p-5 border border-slate-800">
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider font-medium">Progreso</p>
            <p className="text-4xl font-black text-white mt-0.5">
              {stats.percentage.toFixed(1)}
              <span className="text-xl text-slate-400 font-normal">%</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-slate-300 text-sm font-semibold">{stats.owned} / {stats.total}</p>
            <p className="text-slate-500 text-xs">cromos</p>
          </div>
        </div>
        <ProgressBar value={stats.percentage} />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mx-4 mt-4">
        <StatCard label="Tengo" value={stats.owned} color="green" />
        <StatCard label="Faltan" value={stats.missing} color="red" />
        <StatCard label="Repetidos" value={stats.duplicates} color="amber" />
      </div>

      {/* Quick actions */}
      <div className="mx-4 mt-4">
        <p className="text-xs text-slate-500 uppercase font-medium tracking-wider mb-3">Acceso rápido</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/album')}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-left active:bg-slate-800 transition-colors"
          >
            <span className="text-2xl">📚</span>
            <p className="text-sm font-semibold text-white mt-2">Ver álbum</p>
            <p className="text-xs text-slate-500">Buscar cromos</p>
          </button>
          <button
            onClick={() => navigate('/scan')}
            className="bg-emerald-600 rounded-2xl p-4 text-left active:bg-emerald-500 transition-colors"
          >
            <span className="text-2xl">📷</span>
            <p className="text-sm font-semibold text-white mt-2">Escanear</p>
            <p className="text-xs text-emerald-200">Añadir cromos</p>
          </button>
          <button
            onClick={() => navigate('/trades')}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-left active:bg-slate-800 transition-colors"
          >
            <span className="text-2xl">🔄</span>
            <p className="text-sm font-semibold text-white mt-2">Intercambios</p>
            <p className="text-xs text-slate-500">{stats.duplicates} repetidos</p>
          </button>
          <button
            onClick={() => navigate('/album?filter=missing')}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-left active:bg-slate-800 transition-colors"
          >
            <span className="text-2xl">❌</span>
            <p className="text-sm font-semibold text-white mt-2">Me faltan</p>
            <p className="text-xs text-slate-500">{stats.missing} cromos</p>
          </button>
        </div>
      </div>

      {/* Confederation breakdown */}
      <div className="mx-4 mt-6 mb-4">
        <p className="text-xs text-slate-500 uppercase font-medium tracking-wider mb-3">Por confederación</p>
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 space-y-4">
          {confProgress.map(({ conf, pct, owned, total }) => (
            <div key={conf}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-slate-300">{conf}</span>
                <span className="text-xs text-slate-500">{owned}/{total}</span>
              </div>
              <ProgressBar value={pct} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
