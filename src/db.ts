import Dexie from 'dexie'

export interface InventoryItem {
  id?: number
  stickerId: string
  quantity: number
  updatedAt: number
}

class DB extends Dexie {
  inventory!: Dexie.Table<InventoryItem, number>

  constructor() {
    super('StickrDexDB')
    this.version(1).stores({
      inventory: '++id, stickerId, quantity, updatedAt'
    })
  }
}

export const db = new DB()
