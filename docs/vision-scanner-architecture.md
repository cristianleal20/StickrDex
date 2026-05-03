# StickrDex Vision Scanner Architecture

## Product requirement

The scanner must be intelligent enough to identify stickers from either:

1. A full album page photo.
2. A batch of loose stickers.
3. A single sticker photo.

The core experience should be:

```text
Take photo → detect sticker regions → identify visual matches → review confidence → add to inventory
```

OCR is not the primary matching mechanism. OCR is only a fallback signal.

---

## Why OCR-only is not enough

OCR can help when codes or numbers are visible, but it fails when:

- The sticker code is not visible.
- The album page is angled.
- There is glare or foil reflection.
- The image is blurry.
- The sticker front has only player/logo visuals.
- The user scans a whole page instead of individual stickers.

StickrDex needs visual recognition.

---

## Recommended recognition pipeline

### 1. Reference database

Each official sticker needs a reference record:

```ts
export interface StickerReference {
  stickerId: string;
  code: string;
  name: string;
  country?: string;
  team?: string;
  type: 'base' | 'special' | 'foil' | 'logo' | 'extra';
  imageUrl?: string;
  localImagePath?: string;
  embedding?: number[];
  perceptualHash?: string;
  colorSignature?: number[];
  sourceUrl?: string;
  verified: boolean;
}
```

The database should be updateable because the official Panini World Cup 2026 checklist may evolve or be published in phases.

---

### 2. Image preprocessing

For every uploaded/taken photo:

1. Normalize orientation.
2. Resize to a processing-friendly resolution.
3. Improve contrast.
4. Remove excessive shadows/glare as much as possible.
5. Detect rectangular sticker regions.

For a full page scan:

```text
image → edge detection → contour detection → candidate sticker crops → rank crops by rectangle confidence
```

For a single sticker:

```text
image → crop main object → normalize → classify/match
```

---

### 3. Candidate matching

Use multiple visual signals:

#### A. Perceptual hash

Fast first-pass matching.

Good for:
- same image or very similar image
- quick candidate narrowing

Weakness:
- lighting changes
- sticker rotations
- page perspective

#### B. Color/layout signature

Useful for narrowing by team colors, flag, logo, and visual composition.

#### C. Image embeddings

Main recognition method.

Options:

1. Browser-local embeddings with Transformers.js / ONNX / MobileNet-like model.
2. Precomputed reference embeddings shipped as JSON.
3. User image embedding computed on-device.
4. Cosine similarity search against reference embeddings.

This keeps the app local-first while still doing real image recognition.

---

### 4. Confidence scoring

Final score should combine:

```text
finalScore =
  0.65 * embeddingSimilarity +
  0.20 * perceptualHashScore +
  0.10 * colorSignatureScore +
  0.05 * ocrSignalScore
```

Suggested thresholds:

```text
>= 0.88 → auto-selected, high confidence
0.72 - 0.87 → needs user confirmation
< 0.72 → uncertain, manual search required
```

---

### 5. Human confirmation UX

The app should never silently add low-confidence matches.

Each detected crop should show:

- Cropped sticker image.
- Best match.
- Confidence percentage.
- Top 3 alternatives.
- Confirm / Change / Ignore buttons.

---

## MVP implementation strategy

### Phase 1: visual scanner foundation

- Add scanner UI from GeminiStickerApp shell.
- Replace Gemini API with local recognition service.
- Add manual image upload and preview.
- Add sticker crop detection placeholder.
- Add review UI.

### Phase 2: reference image support

- Add `StickerReference` model.
- Allow importing reference images/JSON.
- Store reference metadata locally in IndexedDB.
- Support sample reference images during development.

### Phase 3: perceptual hash matcher

- Compute dHash/pHash for uploaded crops.
- Compare against reference hashes.
- Return top candidates.

### Phase 4: embedding matcher

- Add on-device image embedding model.
- Precompute/store reference embeddings.
- Compute cosine similarity.
- Combine scores.

### Phase 5: full album page detection

- Detect multiple stickers from one photo.
- Crop each candidate.
- Match each crop independently.
- Bulk review and confirm.

---

## Important product decision

StickrDex should not depend on Gemini, OpenAI, or any remote API for core scanning.

The scanner must work as:

```text
Local image → local model/signature → local database → local inventory
```

Cloud recognition can be an optional future enhancement, but not a requirement.

---

## Data source strategy

The official checklist/source should be tracked separately from the visual recognition engine.

Required data layers:

1. `stickers`: official metadata.
2. `referenceImages`: official or user-verified visual references.
3. `inventory`: user-owned counts.
4. `scanSessions`: scan history and review status.

Reference images must include source and verification status.

---

## Success criteria

The scanner is considered useful when it can:

- Recognize a single sticker with high confidence.
- Detect and crop multiple stickers from a page photo.
- Show top alternatives when unsure.
- Update inventory only after user confirmation.
- Work offline after reference data/model is installed.
