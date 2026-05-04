# stickerdex-ocr

Local Python OCR tool for scanning Panini FIFA World Cup 2026 album pages and detecting visible sticker codes.

## What it does

Reads scanned album page images and extracts printed sticker codes (e.g. `ARG 17`, `RSA 3`, `MEX 13`) using OCR (EasyOCR or Tesseract). It outputs:

- `outputs/detected_missing_by_image.json` — detected codes per image + summary
- `outputs/detected_missing_by_image.csv` — flat CSV for spreadsheet analysis
- `outputs/inventory_import.json` — ready to import into the StickrDex web app
- `outputs/raw_ocr_by_image.json` — full raw OCR output per image *(only with `--debug`)*
- `outputs/debug/<image>` — annotated images with detected codes *(only with `--debug`)*

> ⚠️ **Important:** the OCR only registers codes that are **visibly printed** in the empty sticker slots of the album. It does NOT infer missing stickers by absence of text.

---

## Installation

```bash
cd tools/stickerdex-ocr
pip install -r requirements.txt
```

### Optional: Tesseract binary

If you want to use Tesseract as the OCR engine, install the binary:

- **Windows:** https://github.com/UB-Mannheim/tesseract/wiki
- **macOS:** `brew install tesseract`
- **Linux:** `sudo apt install tesseract-ocr`

---

## Usage

```bash
python detect_missing_stickers.py --images_dir /path/to/album/photos
```

### Options

| Flag | Default | Description |
|---|---|---|
| `--images_dir` | *(required)* | Directory containing scanned album images |
| `--output_dir` | `outputs/` | Root output directory |
| `--engine` | `auto` | OCR engine: `auto`, `easyocr`, or `tesseract` |
| `--min_confidence` | `0.35` | Minimum confidence threshold (0.0–1.0) |
| `--include_promo` | off | Include Coca-Cola CC promo stickers |
| `--mark_all_others_owned` | off | Mark everything not in missing list as owned (qty=1) |
| `--debug` | off | Save raw OCR JSON and annotated debug images |

### Examples

**Basic scan:**
```bash
python detect_missing_stickers.py --images_dir ./mis_fotos
```

**Full debug run with tesseract:**
```bash
python detect_missing_stickers.py \
  --images_dir ./mis_fotos \
  --engine tesseract \
  --debug \
  --min_confidence 0.4
```

**Mark everything else as owned (full album import):**
```bash
python detect_missing_stickers.py \
  --images_dir ./mis_fotos \
  --mark_all_others_owned \
  --include_promo
```

---

## Importing results into StickrDex

1. Run the script to generate `outputs/inventory_import.json`
2. Open StickrDex in your browser
3. Go to **Más → Configuración**
4. Tap **"Importar inventario JSON del módulo OCR"**
5. Select the `inventory_import.json` file

---

## Opening StickrDex on your phone

### Same network (Wi-Fi)

```bash
cd /path/to/StickrDex
npm run dev
```

Then open on your phone:
```
http://192.168.0.248:5173
```

*(Check your actual local IP with `ipconfig` on Windows or `ifconfig` on Mac/Linux)*

### Different network (public URL)

**Option A — localtunnel (no install):**
```bash
npx localtunnel --port 5173
```

**Option B — cloudflared:**
```bash
cloudflared tunnel --url http://localhost:5173
```

**Option C — ngrok:**
```bash
ngrok http 5173
```

---

## Supported sticker code formats

| Input | Normalized |
|---|---|
| `ARG 17` | `ARG-17` |
| `ARG17` | `ARG-17` |
| `ARG-17` | `ARG-17` |
| `arg_17` | `ARG-17` |
| `FWC0` | `FWC-0` |
| `FWC 00` | `FWC-0` |
| `CC1` | `CC-1` |
| `CC 1` | `CC-1` |

---

## Output schema

See [`sample_output_schema.json`](./sample_output_schema.json) for the structure of `inventory_import.json`.
