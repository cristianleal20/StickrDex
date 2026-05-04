import Dexie from 'dexie'

export interface Sticker {
  id: string
  prefix: string
  number: number
  displayNumber: string
  country: string
  section: 'intro' | 'team' | 'promo'
  name: string
}

export interface InventoryItem {
  stickerId: string
  quantity: number
  updatedAt: number
}

export interface StickerWithQuantity extends Sticker {
  quantity: number
  owned: boolean
  duplicateCount: number
}

export const TEAMS: Array<[string, string]> = [
  ['MEX','Mexico'], ['RSA','South Africa'], ['KOR','South Korea'], ['CZE','Czech Republic'],
  ['CAN','Canada'], ['BIH','Bosnia & Herz.'], ['QAT','Qatar'], ['SUI','Switzerland'],
  ['BRA','Brazil'], ['MAR','Morocco'], ['HAI','Haiti'], ['SCO','Scotland'],
  ['USA','United States'], ['PAR','Paraguay'], ['AUS','Australia'], ['TUR','Turkey'],
  ['GER','Germany'], ['CUW','Curacao'], ['CIV','Ivory Coast'], ['ECU','Ecuador'],
  ['NED','Netherlands'], ['JPN','Japan'], ['SWE','Sweden'], ['TUN','Tunisia'],
  ['BEL','Belgium'], ['EGY','Egypt'], ['IRN','Iran'], ['NZL','New Zealand'],
  ['ESP','Spain'], ['CPV','Cape Verde'], ['KSA','Saudi Arabia'], ['URU','Uruguay'],
  ['FRA','France'], ['SEN','Senegal'], ['IRQ','Iraq'], ['NOR','Norway'],
  ['ARG','Argentina'], ['ALG','Algeria'], ['AUT','Austria'], ['JOR','Jordan'],
  ['POR','Portugal'], ['COD','DR Congo'], ['UZB','Uzbekistan'], ['COL','Colombia'],
  ['ENG','England'], ['CRO','Croatia'], ['GHA','Ghana'], ['PAN','Panama']
]

// Base: FWC(20) + 48 teams × 20 = 980. Promos: CC-1..CC-12 = 12. Total = 992
export const CHECKLIST: Sticker[] = [
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `FWC-${i}`,
    prefix: 'FWC',
    number: i,
    displayNumber: String(i).padStart(2, '0'),
    country: 'FIFA World Cup',
    section: 'intro' as const,
    name: `FIFA World Cup #${i}`
  })),
  ...TEAMS.flatMap(([prefix, country]) =>
    Array.from({ length: 20 }, (_, idx) => {
      const number = idx + 1
      return {
        id: `${prefix}-${number}`,
        prefix,
        number,
        displayNumber: String(number),
        country,
        section: 'team' as const,
        name: `${country} #${number}`
      }
    })
  ),
  ...Array.from({ length: 12 }, (_, idx) => {
    const number = idx + 1
    return {
      id: `CC-${number}`,
      prefix: 'CC',
      number,
      displayNumber: `CC${number}`,
      country: 'Coca-Cola',
      section: 'promo' as const,
      name: `Coca-Cola CC${number}`
    }
  })
]

// Sanity exports for verification
export const CHECKLIST_BASE_COUNT = CHECKLIST.filter(s => s.section !== 'promo').length   // 980
export const CHECKLIST_TOTAL_COUNT = CHECKLIST.length                                       // 992

class DB extends Dexie {
  inventory!: Dexie.Table<InventoryItem, string>

  constructor() {
    super('StickrDexDB')
    this.version(2).stores({
      inventory: 'stickerId, quantity, updatedAt'
    })
  }
}

export const db = new DB()

export function getStickerById(id: string) {
  return CHECKLIST.find(sticker => sticker.id === id)
}

// Normalize a single code string like "RSA3", "RSA 3", "RSA-3", "rsa_3", "FWC0", "FWC 00", "CC1", "CC 1"
export function normalizeStickerId(input: string): string | null {
  // Step 1: uppercase and replace separators with a space
  const cleaned = input.trim().toUpperCase().replace(/[-_]/g, ' ').replace(/\s+/g, ' ')

  // Step 2: try "PREFIX NUM" (with or without space)
  // Handles: "ARG 17", "ARG17", "ARG-17" (already handled above)
  const match = cleaned.match(/^([A-Z]{2,3})\s?(\d{1,2})$/)
  if (!match) return null

  const prefix = match[1]
  const number = Number(match[2])

  if (prefix === 'FWC') return number >= 0 && number <= 19 ? `FWC-${number}` : null
  if (prefix === 'CC') return number >= 1 && number <= 12 ? `CC-${number}` : null
  return TEAMS.some(([code]) => code === prefix) && number >= 1 && number <= 20
    ? `${prefix}-${number}`
    : null
}

// Extract all valid sticker IDs from a block of OCR text.
// Strict enough to avoid false positives from random numbers.
export function normalizeStickerIdsFromText(text: string): string[] {
  const normalized = text
    .toUpperCase()
    .replace(/[-_]/g, ' ')
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const found = new Set<string>()

  // Pattern 1: letters then digits possibly separated by a single space
  // e.g. "ARG 17", "ARG17", "MEX 3"
  for (const m of normalized.matchAll(/\b([A-Z]{2,3})\s?(\d{1,2})\b/g)) {
    const id = normalizeStickerId(`${m[1]}-${m[2]}`)
    if (id) found.add(id)
  }

  return [...found].sort()
}

export async function getInventoryMap() {
  const inventory = await db.inventory.toArray()
  return new Map(inventory.map(item => [item.stickerId, item.quantity]))
}

export async function getCollection() {
  const inventoryMap = await getInventoryMap()
  return CHECKLIST.map(sticker => {
    const quantity = inventoryMap.get(sticker.id) ?? 0
    return {
      ...sticker,
      quantity,
      owned: quantity > 0,
      duplicateCount: Math.max(0, quantity - 1)
    }
  })
}

export async function setStickerQuantity(stickerId: string, quantity: number) {
  const normalizedId = normalizeStickerId(stickerId) ?? stickerId
  const safeQuantity = Math.max(0, Math.floor(quantity))
  await db.inventory.put({
    stickerId: normalizedId,
    quantity: safeQuantity,
    updatedAt: Date.now()
  })
}

export async function incrementSticker(stickerId: string, amount = 1) {
  const normalizedId = normalizeStickerId(stickerId) ?? stickerId
  const current = await db.inventory.get(normalizedId)
  await setStickerQuantity(normalizedId, (current?.quantity ?? 0) + amount)
}

export async function importInventory(items: InventoryItem[]) {
  const validItems = items
    .map(item => ({
      stickerId: normalizeStickerId(item.stickerId) ?? item.stickerId,
      quantity: Math.max(0, Math.floor(Number(item.quantity) || 0)),
      updatedAt: item.updatedAt || Date.now()
    }))
    .filter(item => Boolean(getStickerById(item.stickerId)))

  await db.inventory.bulkPut(validItems)
  return validItems.length
}
