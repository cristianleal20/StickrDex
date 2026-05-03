export type StickerCategory = 'intro' | 'team' | 'museum'
export type StickerType = 'base' | 'special' | 'foil' | 'badge' | 'photo'
export type StickerRarity = 'common' | 'rare' | 'ultra-rare'
export type StickerStatus = 'missing' | 'owned' | 'duplicate'
export type FilterType = 'all' | 'owned' | 'missing' | 'duplicates' | 'specials'
export type Confederation = 'CONCACAF' | 'CONMEBOL' | 'UEFA' | 'CAF' | 'AFC' | 'OFC'

export interface Sticker {
  id: string
  code: string
  number: number
  name: string
  country: string
  team: string
  flag: string
  group?: string
  confederation?: Confederation
  category: StickerCategory
  type: StickerType
  rarity: StickerRarity
  imageUrl?: string
}

export interface InventoryItem {
  stickerId: string
  quantity: number
  updatedAt: Date
  notes?: string
}

export interface StickerWithStatus extends Sticker {
  quantity: number
  status: StickerStatus
}

export interface TradeProfile {
  id?: number
  ownerName: string
  duplicates: Array<{ code: string; quantity: number }>
  missing: string[]
  createdAt: Date
}

export interface TradeMatch {
  iCanGive: StickerWithStatus[]
  iCanReceive: StickerWithStatus[]
}

export interface AlbumStats {
  total: number
  owned: number
  missing: number
  duplicates: number
  percentage: number
}

export interface TeamInfo {
  code: string
  name: string
  flag: string
  confederation: Confederation
  group: string
}
