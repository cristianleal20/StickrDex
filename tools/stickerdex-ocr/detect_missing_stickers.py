from __future__ import annotations

import argparse
import csv
import json
import re
import time
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Sequence, Set, Tuple

VALID_TEAMS: Dict[str, str] = {
    'MEX':'Mexico', 'RSA':'South Africa', 'KOR':'South Korea', 'CZE':'Czech Republic',
    'CAN':'Canada', 'BIH':'Bosnia & Herz.', 'QAT':'Qatar', 'SUI':'Switzerland',
    'BRA':'Brazil', 'MAR':'Morocco', 'HAI':'Haiti', 'SCO':'Scotland',
    'USA':'United States', 'PAR':'Paraguay', 'AUS':'Australia', 'TUR':'Turkey',
    'GER':'Germany', 'CUW':'Curacao', 'CIV':'Ivory Coast', 'ECU':'Ecuador',
    'NED':'Netherlands', 'JPN':'Japan', 'SWE':'Sweden', 'TUN':'Tunisia',
    'BEL':'Belgium', 'EGY':'Egypt', 'IRN':'Iran', 'NZL':'New Zealand',
    'ESP':'Spain', 'CPV':'Cape Verde', 'KSA':'Saudi Arabia', 'URU':'Uruguay',
    'FRA':'France', 'SEN':'Senegal', 'IRQ':'Iraq', 'NOR':'Norway',
    'ARG':'Argentina', 'ALG':'Algeria', 'AUT':'Austria', 'JOR':'Jordan',
    'POR':'Portugal', 'COD':'DR Congo', 'UZB':'Uzbekistan', 'COL':'Colombia',
    'ENG':'England', 'CRO':'Croatia', 'GHA':'Ghana', 'PAN':'Panama'
}

VALID_PREFIXES = set(VALID_TEAMS) | {'FWC', 'CC'}
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tif', '.tiff'}

OCR_CORRECTIONS = {
    '0': 'O',
    '1': 'I',
    '5': 'S',
    '$': 'S',
}

PREFIX_ALIASES = {
    'MFX': 'MEX',
    'MEXI': 'MEX',
    'RSAI': 'RSA',
    'K0R': 'KOR',
    'K0RE': 'KOR',
    'C2E': 'CZE',
    'CZF': 'CZE',
    'CANADA': 'CAN',
    'OAT': 'QAT',
    'QAI': 'QAT',
    'SUII': 'SUI',
    'BR4': 'BRA',
    '8RA': 'BRA',
    'M4R': 'MAR',
    'US4': 'USA',
    'PARA': 'PAR',
    '6ER': 'GER',
    'CUN': 'CUW',
    'NFD': 'NED',
    'JPNN': 'JPN',
    'TUNN': 'TUN',
    'EGV': 'EGY',
    'N2L': 'NZL',
    'K5A': 'KSA',
    'URV': 'URU',
    'FR4': 'FRA',
    'SFW': 'SEN',
    'N0R': 'NOR',
    'AR6': 'ARG',
    'AL6': 'ALG',
    'A1G': 'ALG',
    'AUI': 'AUT',
    'J0R': 'JOR',
    'P0R': 'POR',
    'C0D': 'COD',
    'U2B': 'UZB',
    'C0L': 'COL',
    'CR0': 'CRO',
}


def make_checklist(include_promo: bool = True) -> Set[str]:
    codes = {f'FWC-{i}' for i in range(20)}
    for prefix in VALID_TEAMS:
        codes.update(f'{prefix}-{n}' for n in range(1, 21))
    if include_promo:
        codes.update(f'CC-{n}' for n in range(1, 13))
    return codes


def normalize_prefix(raw: str) -> Optional[str]:
    cleaned = raw.upper().strip()
    cleaned = ''.join(OCR_CORRECTIONS.get(ch, ch) for ch in cleaned)
    cleaned = re.sub(r'[^A-Z]', '', cleaned)
    if cleaned in PREFIX_ALIASES:
        cleaned = PREFIX_ALIASES[cleaned]
    if cleaned in VALID_PREFIXES:
        return cleaned
    return None


def normalize_code(prefix: str, raw_number: str, include_promo: bool = True) -> Optional[str]:
    norm_prefix = normalize_prefix(prefix)
    if not norm_prefix:
        return None
    number_match = re.search(r'\d{1,2}', raw_number)
    if not number_match:
        return None
    number = int(number_match.group())
    if norm_prefix == 'FWC':
        return f'FWC-{number}' if 0 <= number <= 19 else None
    if norm_prefix == 'CC':
        return f'CC-{number}' if include_promo and 1 <= number <= 12 else None
    return f'{norm_prefix}-{number}' if 1 <= number <= 20 else None


def extract_codes_from_text(text: str, include_promo: bool = True) -> List[str]:
    text = text.upper()
    text = text.replace('-', ' ').replace('_', ' ')
    text = re.sub(r'[^A-Z0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()

    candidates: List[str] = []
    # Strict pattern: ABC 12
    for prefix, number in re.findall(r'\b([A-Z0-9]{2,6})\s*(\d{1,2})\b', text):
        code = normalize_code(prefix, number, include_promo=include_promo)
        if code:
            candidates.append(code)

    # Joined pattern: ABC12
    for token in text.split():
        match = re.match(r'^([A-Z0-9]{2,6})(\d{1,2})$', token)
        if not match:
            continue
        code = normalize_code(match.group(1), match.group(2), include_promo=include_promo)
        if code:
            candidates.append(code)

    return sorted(set(candidates))


def preprocess_for_ocr(image: Any) -> List[Any]:
    import cv2

    variants = []
    variants.append(image)
    scale = 1.6
    resized = cv2.resize(image, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
    variants.append(resized)

    gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
    variants.append(gray)

    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)
    variants.append(enhanced)

    _, thresh = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    variants.append(thresh)

    return variants


def run_easyocr(image_variants: Sequence[Any]) -> List[Tuple[str, float, str]]:
    import easyocr

    reader = easyocr.Reader(['en'], gpu=False)
    output: List[Tuple[str, float, str]] = []
    for idx, variant in enumerate(image_variants):
        try:
            results = reader.readtext(variant, detail=1, paragraph=False)
        except Exception:
            continue
        for _, text, conf in results:
            output.append((str(text), float(conf), f'easyocr:v{idx}'))
    return output


def run_tesseract(image_variants: Sequence[Any]) -> List[Tuple[str, float, str]]:
    import pytesseract
    from pytesseract import Output

    output: List[Tuple[str, float, str]] = []
    config = '--psm 6 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789- '
    for idx, variant in enumerate(image_variants):
        try:
            data = pytesseract.image_to_data(variant, output_type=Output.DICT, config=config)
        except Exception:
            continue
        for text, conf in zip(data.get('text', []), data.get('conf', [])):
            text = str(text).strip()
            if not text:
                continue
            try:
                score = max(0.0, min(1.0, float(conf) / 100.0))
            except Exception:
                score = 0.0
            output.append((text, score, f'tesseract:v{idx}'))
    return output


def ocr_image(image_path: Path, engine: str) -> List[Tuple[str, float, str]]:
    import cv2

    image = cv2.imread(str(image_path))
    if image is None:
        raise ValueError(f'Could not read image: {image_path}')
    variants = preprocess_for_ocr(image)

    if engine == 'easyocr':
        return run_easyocr(variants)
    if engine == 'tesseract':
        return run_tesseract(variants)

    # auto
    try:
        return run_easyocr(variants)
    except Exception:
        return run_tesseract(variants)


def analyze_image(image_path: Path, engine: str, min_confidence: float, include_promo: bool) -> List[Dict[str, Any]]:
    raw_ocr = ocr_image(image_path, engine)
    detected: Dict[str, Dict[str, Any]] = {}

    for raw_text, confidence, source in raw_ocr:
        if confidence < min_confidence:
            continue
        for code in extract_codes_from_text(raw_text, include_promo=include_promo):
            current = detected.get(code)
            if not current or confidence > current['confidence']:
                prefix, number = code.split('-')
                detected[code] = {
                    'image': image_path.name,
                    'raw_text': raw_text,
                    'sticker_id': code,
                    'prefix': prefix,
                    'number': int(number),
                    'confidence': round(confidence, 4),
                    'source': source,
                }

    return sorted(detected.values(), key=lambda row: (row['prefix'], row['number']))


def write_csv(path: Path, rows: List[Dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fields = ['image', 'raw_text', 'sticker_id', 'prefix', 'number', 'confidence', 'source']
    with path.open('w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def build_inventory_import(missing_codes: Set[str], include_promo: bool, mark_all_others_owned: bool) -> List[Dict[str, Any]]:
    now = int(time.time() * 1000)
    checklist = make_checklist(include_promo=include_promo)
    inventory = []
    if mark_all_others_owned:
        for code in sorted(checklist):
            inventory.append({'stickerId': code, 'quantity': 0 if code in missing_codes else 1, 'updatedAt': now})
    else:
        for code in sorted(missing_codes):
            inventory.append({'stickerId': code, 'quantity': 0, 'updatedAt': now})
    return inventory


def main() -> None:
    parser = argparse.ArgumentParser(description='Detect visible missing sticker codes from scanned StickrDex album pages.')
    parser.add_argument('--images_dir', type=Path, required=True)
    parser.add_argument('--output_json', type=Path, default=Path('outputs/detected_missing_by_image.json'))
    parser.add_argument('--output_csv', type=Path, default=Path('outputs/detected_missing_by_image.csv'))
    parser.add_argument('--inventory_json', type=Path, default=Path('outputs/inventory_import.json'))
    parser.add_argument('--engine', choices=['auto', 'easyocr', 'tesseract'], default='auto')
    parser.add_argument('--min_confidence', type=float, default=0.35)
    parser.add_argument('--include_promo', action='store_true')
    parser.add_argument('--mark_all_others_owned', action='store_true')
    args = parser.parse_args()

    if not args.images_dir.exists():
        raise SystemExit(f'Images dir does not exist: {args.images_dir}')

    image_files = sorted([p for p in args.images_dir.iterdir() if p.suffix.lower() in IMAGE_EXTENSIONS])
    all_rows: List[Dict[str, Any]] = []
    by_image: Dict[str, List[Dict[str, Any]]] = {}

    print(f'Processing {len(image_files)} images...')
    for image_path in image_files:
        print(f'→ {image_path.name}')
        rows = analyze_image(image_path, args.engine, args.min_confidence, include_promo=args.include_promo)
        by_image[image_path.name] = rows
        all_rows.extend(rows)

    unique_missing = sorted({row['sticker_id'] for row in all_rows})
    result = {
        'summary': {
            'total_images': len(image_files),
            'total_detected_rows': len(all_rows),
            'total_unique_missing_codes': len(unique_missing),
            'unique_missing_codes': unique_missing,
            'engine': args.engine,
            'min_confidence': args.min_confidence,
        },
        'by_image': by_image,
    }

    args.output_json.parent.mkdir(parents=True, exist_ok=True)
    args.output_json.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    write_csv(args.output_csv, all_rows)

    inventory = build_inventory_import(set(unique_missing), include_promo=args.include_promo, mark_all_others_owned=args.mark_all_others_owned)
    args.inventory_json.parent.mkdir(parents=True, exist_ok=True)
    args.inventory_json.write_text(json.dumps(inventory, ensure_ascii=False, indent=2), encoding='utf-8')

    print('\nDone.')
    print(f'JSON: {args.output_json}')
    print(f'CSV: {args.output_csv}')
    print(f'Inventory import: {args.inventory_json}')
    print('\nUnique detected missing codes:')
    print(', '.join(unique_missing) if unique_missing else 'None')


if __name__ == '__main__':
    main()
