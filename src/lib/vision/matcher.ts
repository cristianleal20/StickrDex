import type { Sticker } from '@/types'
import type { StickerReference, StickerCandidate, EnrichedScanResult } from './types'
import { ALL_STICKERS, TOTAL_STICKERS } from '@/data/stickers'

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function scoreTextMatch(query: string, target: string): number {
  if (!query || !target) return 0
  if (target.includes(query)) return 1
  if (query.includes(target)) return 0.8

  const qTokens = query.split(' ')
  const tTokens = target.split(' ')
  let matches = 0
  qTokens.forEach(q => { if (tTokens.some(t => t.startsWith(q) && t.length > 1)) matches++ })
  return matches / Math.max(qTokens.length, 1)
}

function buildSearchableText(s: Sticker): string {
  return [s.name, s.country, s.team, s.code, s.group, s.confederation]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

const REFERENCES: StickerReference[] = ALL_STICKERS.map(s => ({
  ...s,
  searchableText: buildSearchableText(s),
}))

export function matchByText(rawText: string): StickerCandidate[] {
  const norm = normalize(rawText)

  // Extract numbers from OCR text for number-based matching
  const numbers = (rawText.match(/\b\d{1,3}\b/g) ?? []).map(Number).filter(n => n >= 1 && n <= TOTAL_STICKERS)
  // Extract potential codes like ARG-3
  const codeMatches: string[] = rawText.toUpperCase().match(/\b[A-Z]{2,3}-\d{1,2}\b/g) ?? []

  return REFERENCES.map(ref => {
    const textScore = scoreTextMatch(norm, ref.searchableText)
    const codeScore = codeMatches.includes(ref.id) ? 1 : codeMatches.some(c => c === ref.code.toUpperCase()) ? 1 : 0
    const numberScore = ref.number !== undefined && numbers.includes(ref.number) ? 1 : 0

    const score = Math.max(
      0.5 * textScore + 0.3 * codeScore + 0.2 * numberScore,
      codeScore,
      numberScore > 0 ? 0.9 : 0
    )

    const matchedBy: Array<'code' | 'text' | 'number'> = [
      ...(codeScore > 0 ? ['code' as const] : []),
      ...(textScore > 0.4 ? ['text' as const] : []),
      ...(numberScore > 0 ? ['number' as const] : []),
    ]

    return {
      sticker: ref,
      score,
      confidenceLabel: (score > 0.85 ? 'high' : score > 0.6 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
      matchedBy,
      signals: { textScore, codeScore, numberScore },
    }
  })
    .filter(c => c.score > 0.45)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
}

export function enrichScanResult(rawText: string): EnrichedScanResult {
  const candidates = matchByText(rawText)
  const best = candidates[0]
  const status = !best ? 'unknown' : best.score > 0.88 ? 'auto_match' : 'needs_review'
  return { rawText, bestCandidate: best, candidates, status }
}
