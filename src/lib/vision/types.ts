export type StickerType = 'base' | 'special' | 'foil' | 'logo' | 'extra' | 'other';

export interface StickerRecord {
  id: string;
  code: string;
  number?: number | string;
  name: string;
  country?: string;
  team?: string;
  category?: string;
  type: StickerType;
  rarity?: string;
  description?: string;
  imageUrl?: string;
  sourceUrl?: string;
  verified?: boolean;
}

export interface StickerReference extends StickerRecord {
  localImagePath?: string;
  perceptualHash?: string;
  colorSignature?: number[];
  embedding?: number[];
  searchableText: string;
}

export interface OCRToken {
  text: string;
  confidence: number;
  bbox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface StickerCrop {
  id: string;
  imageDataUrl: string;
  bbox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  ocrTokens: OCRToken[];
  rawText: string;
}

export interface MatchSignals {
  textScore: number;
  codeScore: number;
  embeddingScore: number;
  hashScore: number;
  colorScore: number;
}

export interface StickerCandidate {
  sticker: StickerRecord;
  score: number;
  confidenceLabel: 'high' | 'medium' | 'low';
  matchedBy: Array<'code' | 'text' | 'embedding' | 'hash' | 'color'>;
  signals: MatchSignals;
}

export interface EnrichedScanResult {
  crop: StickerCrop;
  bestCandidate?: StickerCandidate;
  candidates: StickerCandidate[];
  extracted: {
    possibleCodes: string[];
    possibleNames: string[];
    possibleCountries: string[];
    normalizedText: string;
  };
  status: 'auto_match' | 'needs_review' | 'unknown';
}
