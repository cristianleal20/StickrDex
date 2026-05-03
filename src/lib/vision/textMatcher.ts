import { StickerReference, StickerCandidate } from './types';

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreTextMatch(query: string, target: string): number {
  if (!query || !target) return 0;
  if (target.includes(query)) return 1;
  if (query.includes(target)) return 0.8;

  const qTokens = query.split(' ');
  const tTokens = target.split(' ');

  let matches = 0;
  qTokens.forEach(q => {
    if (tTokens.some(t => t.startsWith(q))) matches++;
  });

  return matches / Math.max(qTokens.length, 1);
}

export function matchByText(
  rawText: string,
  references: StickerReference[]
): StickerCandidate[] {
  const norm = normalize(rawText);

  return references
    .map(ref => {
      const textScore = scoreTextMatch(norm, normalize(ref.searchableText));
      const codeScore = norm.includes(ref.code.toLowerCase()) ? 1 : 0;

      const score = 0.7 * textScore + 0.3 * codeScore;

      return {
        sticker: ref,
        score,
        confidenceLabel: score > 0.85 ? 'high' : score > 0.65 ? 'medium' : 'low',
        matchedBy: [
          ...(textScore > 0 ? ['text' as const] : []),
          ...(codeScore > 0 ? ['code' as const] : [])
        ],
        signals: {
          textScore,
          codeScore,
          embeddingScore: 0,
          hashScore: 0,
          colorScore: 0
        }
      };
    })
    .filter(c => c.score > 0.4)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}
