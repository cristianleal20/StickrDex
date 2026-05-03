import { createWorker } from 'tesseract.js'
import { TOTAL_STICKERS, ALL_STICKERS } from '@/data/stickers'

const STICKER_CODE_REGEX = /\b([A-Z]{2,3})-(\d{1,2})\b/g
const STICKER_NUM_REGEX = /\b(\d{1,3})\b/g

export interface OcrResult {
  rawText: string
  detectedIds: string[]
  confidence: number
}

export async function runOcr(
  imageSource: File | string,
  onProgress?: (pct: number) => void
): Promise<OcrResult> {
  const worker = await createWorker('eng', 1, {
    logger: m => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(m.progress * 100))
      }
    },
  })

  await worker.setParameters({
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789- \n',
  })

  const { data } = await worker.recognize(imageSource)
  await worker.terminate()

  const rawText = data.text.toUpperCase()
  const ids = extractStickerIds(rawText)

  return { rawText, detectedIds: ids, confidence: data.confidence }
}

function extractStickerIds(text: string): string[] {
  const found = new Set<string>()

  // Try to match team codes like "ARG-3", "USA-15", etc.
  let match: RegExpExecArray | null
  STICKER_CODE_REGEX.lastIndex = 0
  while ((match = STICKER_CODE_REGEX.exec(text)) !== null) {
    const candidate = `${match[1]}-${match[2]}`
    if (ALL_STICKERS.some(s => s.id === candidate)) {
      found.add(candidate)
    }
  }

  // Try to match raw numbers (sticker sequential number)
  STICKER_NUM_REGEX.lastIndex = 0
  while ((match = STICKER_NUM_REGEX.exec(text)) !== null) {
    const num = parseInt(match[1])
    if (num >= 1 && num <= TOTAL_STICKERS) {
      const sticker = ALL_STICKERS.find(s => s.number === num)
      if (sticker) found.add(sticker.id)
    }
  }

  return [...found]
}

export function extractNumbersFromText(text: string): string[] {
  const upper = text.toUpperCase()
  return extractStickerIds(upper)
}
