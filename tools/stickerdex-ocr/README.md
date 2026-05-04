# StickrDex OCR Tool

Herramienta local para procesar fotos/escaneos del álbum Panini FIFA World Cup 2026 y detectar códigos visibles en espacios vacíos, por ejemplo `RSA 3`, `PAR 10`, `MEX 13`.

## Qué hace

- Lee imágenes `.jpg`, `.jpeg`, `.png`, `.webp`, `.bmp`, `.tif` o `.tiff` desde una carpeta.
- Corre OCR sobre cada imagen.
- Extrae códigos compatibles con el checklist de StickrDex.
- Normaliza códigos a formato app: `RSA-3`, `MEX-13`, `FWC-0`, `CC-1`.
- Genera resultados por imagen en JSON/CSV.
- Puede generar un inventario importable por la app.

## Instalación

```bash
cd tools/stickerdex-ocr
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
```

EasyOCR suele ser suficiente. Si quieres usar Tesseract como fallback, instala también el binario del sistema operativo.

## Uso rápido

```bash
python detect_missing_stickers.py \
  --images_dir ./album_pages \
  --output_json ./outputs/detected_missing_by_image.json \
  --output_csv ./outputs/detected_missing_by_image.csv \
  --inventory_json ./outputs/inventory_import.json
```

Estructura sugerida:

```text
tools/stickerdex-ocr/
├─ album_pages/
│  ├─ Archivo_escaneado_20260503-1729-01.jpg
│  └─ ...
├─ outputs/
├─ detect_missing_stickers.py
└─ requirements.txt
```

## Notas importantes

Este OCR detecta principalmente el texto impreso en los huecos vacíos. No asume que un sticker falta si no puede leer un código. Eso reduce falsos positivos.

Para revisar resultados dudosos usa la columna `confidence`. Cualquier detección con baja confianza debe revisarse manualmente.

## Integración con StickrDex

El archivo `inventory_import.json` queda listo para importarse desde la app. Los códigos detectados como faltantes tendrán cantidad `0`; el resto del checklist puede marcarse como `1` si activas el modo de inventario completo.
