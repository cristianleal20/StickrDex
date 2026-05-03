import { useState, useMemo, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useInventory } from '@/hooks/useInventory'
import FilterChips from '@/components/FilterChips'
import StickerCard from '@/components/StickerCard'
import type { FilterType } from '@/types'

const PAGE_SIZE = 40

export default function Album() {
  const [searchParams] = useSearchParams()
  const initialFilter = (searchParams.get('filter') as FilterType) ?? 'all'

  const [activeFilter, setActiveFilter] = useState<FilterType>(initialFilter)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const loaderRef = useRef<HTMLDivElement>(null)

  const { filter, counts } = useInventory()

  const filtered = useMemo(() => {
    const base = filter(activeFilter)
    if (!search.trim()) return base
    const q = search.toLowerCase()
    return base.filter(
      s =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        String(s.number).includes(q)
    )
  }, [filter, activeFilter, search])

  const visible = filtered.slice(0, page * PAGE_SIZE)
  const hasMore = visible.length < filtered.length

  // Reset page when filter/search changes
  useEffect(() => { setPage(1) }, [activeFilter, search])

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!loaderRef.current) return
    const obs = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting && hasMore) setPage(p => p + 1) },
      { threshold: 0.1 }
    )
    obs.observe(loaderRef.current)
    return () => obs.disconnect()
  }, [hasMore])

  return (
    <div className="flex flex-col min-h-svh">
      {/* Header */}
      <div className="bg-slate-950 pt-12 px-4 pb-2 sticky top-0 z-10 border-b border-slate-800/50">
        <h1 className="text-xl font-bold text-white mb-3">Álbum</h1>
        <input
          type="search"
          placeholder="Buscar por nombre, código o número..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-emerald-500 mb-1"
        />
      </div>

      <FilterChips active={activeFilter} onChange={setActiveFilter} counts={counts} />

      {/* Results count */}
      <div className="px-4 py-2">
        <p className="text-xs text-slate-500">{filtered.length} cromos</p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-none pb-nav">
        <div className="px-4 space-y-2">
          {visible.map(sticker => (
            <StickerCard key={sticker.id} sticker={sticker} />
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-medium">Sin resultados</p>
              <p className="text-sm mt-1">Prueba con otro término</p>
            </div>
          )}
        </div>
        {hasMore && <div ref={loaderRef} className="h-16 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>}
        {!hasMore && filtered.length > 0 && (
          <p className="text-center text-xs text-slate-600 py-6">Fin del álbum</p>
        )}
      </div>
    </div>
  )
}
