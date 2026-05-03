import { StickerReference, EnrichedScanResult } from './types';
import { matchByText } from './textMatcher';

export function buildSearchableText(ref: StickerReference): string {
  return [
    ref.name,
    ref.country,
    ref.team,
    ref.category,
    ref.code,
    ref.description
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function enrichReferences(refs: StickerReference[]): StickerReference[] {
  return refs.map(r => ({
    ...r,
    searchableText: buildSearchableText(r)
  }));
}

export function matchStickerCrop(
  rawText: string,
  references: StickerReference[]
): EnrichedScanResult {
  const candidates = matchByText(rawText, references);

  const best = candidates[0];

  const status = !best
    ? 'unknown'
    : best.score > 0.88
    ? 'auto_match'
    : 'needs_review';

  return {
    crop: {
      id: crypto.randomUUID(),
      imageDataUrl: '',
      rawText,
      ocrTokens: []
    },
    bestCandidate: best,
    candidates,
    extracted: {
      possibleCodes: [],
      possibleNames: [],
      possibleCountries: [],
      normalizedText: rawText.toLowerCase()
    },
    status
  };
}
