import type { Sticker } from '@/types'

export interface StickerReference extends Sticker {
  searchableText: string
}

export interface OCRToken {
  text: string
  confidence: number
  bbox?: { x: number; y: number; width: number; height: number }
}

export interface MatchSignals {
  textScore: number
  codeScore: number
  numberScore: number
}

export interface StickerCandidate {
  sticker: StickerReference
  score: number
  confidenceLabel: 'high' | 'medium' | 'low'
  matchedBy: Array<'code' | 'text' | 'number'>
  signals: MatchSignals
}

export interface EnrichedScanResult {
  rawText: string
  bestCandidate?: StickerCandidate
  candidates: StickerCandidate[]
  status: 'auto_match' | 'needs_review' | 'unknown'
}
