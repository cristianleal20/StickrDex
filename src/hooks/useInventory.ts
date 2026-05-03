import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/database'
import { ALL_STICKERS, TOTAL_STICKERS } from '@/data/stickers'
import type { AlbumStats, FilterType, StickerWithStatus } from '@/types'

export function useInventory() {
  const inventoryMap = useLiveQuery(async () => {
    const items = await db.inventory.toArray()
    return new Map(items.map(i => [i.stickerId, i.quantity]))
  }, [], new Map<string, number>())

  const stickersWithStatus: StickerWithStatus[] = ALL_STICKERS.map(s => {
    const qty = inventoryMap.get(s.id) ?? 0
    return {
      ...s,
      quantity: qty,
      status: qty === 0 ? 'missing' : qty === 1 ? 'owned' : 'duplicate',
    }
  })

  const owned = stickersWithStatus.filter(s => s.quantity >= 1).length
  const missing = stickersWithStatus.filter(s => s.quantity === 0).length
  const duplicates = stickersWithStatus.filter(s => s.quantity > 1).length
  const specials = stickersWithStatus.filter(s => s.type === 'foil' || s.type === 'special').length

  const stats: AlbumStats = {
    total: TOTAL_STICKERS,
    owned,
    missing,
    duplicates,
    percentage: (owned / TOTAL_STICKERS) * 100,
  }

  function filter(type: FilterType): StickerWithStatus[] {
    switch (type) {
      case 'owned': return stickersWithStatus.filter(s => s.quantity >= 1)
      case 'missing': return stickersWithStatus.filter(s => s.quantity === 0)
      case 'duplicates': return stickersWithStatus.filter(s => s.quantity > 1)
      case 'specials': return stickersWithStatus.filter(s => s.type === 'foil' || s.type === 'special')
      default: return stickersWithStatus
    }
  }

  const counts: Record<FilterType, number> = {
    all: TOTAL_STICKERS,
    owned,
    missing,
    duplicates,
    specials,
  }

  return { stickersWithStatus, stats, filter, counts, inventoryMap }
}
