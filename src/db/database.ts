import Dexie, { type Table } from 'dexie'
import type { InventoryItem, TradeProfile } from '@/types'

class StickrDexDB extends Dexie {
  inventory!: Table<InventoryItem, string>
  tradeProfiles!: Table<TradeProfile, number>

  constructor() {
    super('StickrDex')
    this.version(1).stores({
      inventory: 'stickerId, quantity, updatedAt',
      tradeProfiles: '++id, ownerName, createdAt',
    })
  }
}

export const db = new StickrDexDB()

export async function setQuantity(stickerId: string, quantity: number): Promise<void> {
  if (quantity <= 0) {
    await db.inventory.delete(stickerId)
  } else {
    await db.inventory.put({ stickerId, quantity, updatedAt: new Date() })
  }
}

export async function incrementSticker(stickerId: string): Promise<void> {
  const existing = await db.inventory.get(stickerId)
  const newQty = (existing?.quantity ?? 0) + 1
  await db.inventory.put({ stickerId, quantity: newQty, updatedAt: new Date() })
}

export async function decrementSticker(stickerId: string): Promise<void> {
  const existing = await db.inventory.get(stickerId)
  if (!existing) return
  const newQty = existing.quantity - 1
  if (newQty <= 0) {
    await db.inventory.delete(stickerId)
  } else {
    await db.inventory.put({ stickerId, quantity: newQty, updatedAt: new Date() })
  }
}

export async function bulkMarkOwned(stickerIds: string[]): Promise<void> {
  const existing = await db.inventory.bulkGet(stickerIds)
  const items: InventoryItem[] = stickerIds.map((id, i) => ({
    stickerId: id,
    quantity: Math.max(existing[i]?.quantity ?? 0, 1),
    updatedAt: new Date(),
  }))
  await db.inventory.bulkPut(items)
}

export async function resetCollection(): Promise<void> {
  await db.inventory.clear()
}

export async function exportData(): Promise<string> {
  const items = await db.inventory.toArray()
  return JSON.stringify({ version: 1, inventory: items }, null, 2)
}

export async function importData(json: string): Promise<void> {
  const data = JSON.parse(json)
  if (!data.inventory) throw new Error('Formato inválido')
  await db.inventory.clear()
  await db.inventory.bulkPut(data.inventory)
}
