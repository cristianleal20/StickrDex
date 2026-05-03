import type { StickerWithStatus, TradeMatch } from '@/types'
import { ALL_STICKERS, STICKER_MAP } from '@/data/stickers'

export interface TradeExport {
  duplicates: Array<{ code: string; name: string; quantity: number }>
  missing: Array<{ code: string; name: string }>
  generatedAt: string
}

export function buildTradeExport(stickers: StickerWithStatus[]): TradeExport {
  return {
    duplicates: stickers
      .filter(s => s.quantity > 1)
      .map(s => ({ code: s.code, name: s.name, quantity: s.quantity - 1 })),
    missing: stickers
      .filter(s => s.quantity === 0)
      .map(s => ({ code: s.code, name: s.name })),
    generatedAt: new Date().toISOString(),
  }
}

export function toWhatsAppText(stickers: StickerWithStatus[]): string {
  const duplicates = stickers.filter(s => s.quantity > 1)
  const missing = stickers.filter(s => s.quantity === 0)

  const dupLine = duplicates.map(s => `${s.number}${s.quantity > 2 ? `(×${s.quantity - 1})` : ''}`).join(', ')
  const misLine = missing.map(s => s.number).join(', ')

  return [
    '🔄 *Intercambio de cromos Panini Mundial 2026*',
    '',
    `*Me sobran (${duplicates.length}):*`,
    dupLine || '—',
    '',
    `*Me faltan (${missing.length}):*`,
    misLine || '—',
    '',
    '_Generado con StickrDex_',
  ].join('\n')
}

export function matchTrades(
  myStickers: StickerWithStatus[],
  friendJson: string
): TradeMatch {
  let friendData: TradeExport
  try {
    friendData = JSON.parse(friendJson)
  } catch {
    return { iCanGive: [], iCanReceive: [] }
  }

  const friendMissingCodes = new Set(friendData.missing?.map((m: { code: string }) => m.code) ?? [])
  const friendDupCodes = new Set(friendData.duplicates?.map((d: { code: string }) => d.code) ?? [])

  const myDupMap = new Map(
    myStickers.filter(s => s.quantity > 1).map(s => [s.code, s])
  )
  const myMissingCodes = new Set(myStickers.filter(s => s.quantity === 0).map(s => s.code))

  const iCanGive = [...friendMissingCodes]
    .filter(code => myDupMap.has(code))
    .map(code => myDupMap.get(code)!)

  const iCanReceive = [...friendDupCodes]
    .filter(code => myMissingCodes.has(code))
    .map(code => {
      const sticker = ALL_STICKERS.find(s => s.code === code)
      return sticker ? { ...sticker, quantity: 0, status: 'missing' as const } : null
    })
    .filter(Boolean) as StickerWithStatus[]

  return { iCanGive, iCanReceive }
}
