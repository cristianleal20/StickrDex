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

const TEAMS: Array<[string, string]> = [
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

export function normalizeStickerId(input: string) {
  const cleaned = input.trim().toUpperCase().replace(/\s+/g, '')
  const match = cleaned.match(/^([A-Z]{2,3})[-_ ]?(\d{1,2})$/)
  if (!match) return null
  const [, prefix, rawNumber] = match
  const number = Number(rawNumber)
  if (prefix === 'FWC') return number >= 0 && number <= 19 ? `FWC-${number}` : null
  if (prefix === 'CC') return number >= 1 && number <= 12 ? `CC-${number}` : null
  return TEAMS.some(([code]) => code === prefix) && number >= 1 && number <= 20 ? `${prefix}-${number}` : null
}
