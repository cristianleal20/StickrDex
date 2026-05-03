# StickrDex ⚽

**Tracker de cromos Panini Copa Mundial FIFA 2026**

PWA local-first para gestionar tu álbum Panini. Sin backend, funciona offline, optimizado para móvil.

---

## Características

- 📊 **Dashboard** — progreso visual del álbum y estadísticas por confederación
- 📚 **Álbum** — búsqueda y filtrado de los 980 cromos, marcado con +1/-1
- 📷 **Escanear** — OCR via Tesseract.js o entrada manual de números/códigos
- 🔄 **Intercambios** — lista de repetidos/faltantes, exportar WhatsApp o JSON, comparar con amigos
- ⚙️ **Ajustes** — backup/restore JSON, resetear colección

---

## Setup

### Requisitos

- Node.js 18+
- npm o pnpm

### Instalación

```bash
npm install
npm run dev
```

La app abre en `http://localhost:5173`

### Build para producción

```bash
npm run build
npm run preview
```

La carpeta `dist/` contiene la PWA lista para desplegar en cualquier hosting estático (Netlify, Vercel, GitHub Pages, etc.).

---

## Estructura del proyecto

```
src/
├── app/           # Router
├── components/    # Componentes compartidos (BottomNav, StickerCard, FilterChips)
│   └── ui/        # Primitivos de UI (ProgressBar, StatCard)
├── db/            # Dexie.js (IndexedDB)
├── data/          # Los 980 cromos (generados programáticamente)
├── features/      # Pantallas de la app
│   ├── dashboard/
│   ├── album/
│   ├── scan/
│   ├── trades/
│   └── more/
├── hooks/         # useInventory (live query + stats)
├── lib/           # ocr.ts, trading.ts
├── styles/        # Tailwind CSS
└── types/         # TypeScript interfaces
```

---

## Notas sobre los datos

Los datos de cromos (grupos, equipos, números de cromo) son **aproximados** y se basan en la estructura conocida del álbum Panini FIFA World Cup 2026:

- 980 cromos totales
- 9 cromos de Introducción
- 48 selecciones × 20 cromos (escudo + foto + 18 jugadores)
- 11 cromos FIFA Museum

> **Verifica los números exactos con tu álbum físico.** Los nombres de jugadores son placeholders — se actualizarán cuando se publique el checklist oficial.

### Actualizar datos oficiales

Una vez tengas el checklist oficial de Panini:
1. Modifica `src/data/stickers.ts`
2. Actualiza `GROUPS` con los grupos reales
3. Rellena los nombres de jugadores en el generador

---

## Roadmap

### Fase 1 — MVP (actual)
- [x] Dashboard con estadísticas
- [x] Vista de álbum con filtros y búsqueda
- [x] Marcado de cromos (+1/-1)
- [x] Escaneo OCR básico + entrada manual
- [x] Lista de intercambios con exportación WhatsApp/JSON
- [x] Comparación de colecciones entre amigos
- [x] Backup/restore completo
- [x] PWA instalable y offline

### Fase 2 — Trading tools
- [ ] Perfil de contacto para intercambios (nombre, WhatsApp)
- [ ] Historial de intercambios
- [ ] QR code con lista de disponibles/faltantes

### Fase 3 — OCR mejorado
- [ ] Detección automática de región de números en la imagen
- [ ] Preprocesamiento adaptativo (contraste, rotación)
- [ ] Modo cámara en vivo (sin tener que tomar foto)

### Fase 4 — Checklist oficial
- [ ] Importar CSV/PDF oficial de Panini
- [ ] Nombres reales de jugadores
- [ ] Grupos y numeración verificada
- [ ] Fotos de cromos (si Panini las publica)

### Fase 5 — UX polish
- [ ] Animaciones de sticker al marcarlo
- [ ] Modo oscuro / claro
- [ ] Notificaciones de hitos (50%, 75%, ¡completo!)
- [ ] Widget de progreso para pantalla de inicio (iOS/Android)
- [ ] Compartir progreso como imagen

---

## Tech stack

| Tecnología | Uso |
|---|---|
| React 18 + TypeScript | UI |
| Vite | Build tool |
| Tailwind CSS | Estilos |
| Dexie.js | IndexedDB (persistencia local) |
| dexie-react-hooks | Reactvidad en tiempo real |
| Tesseract.js | OCR para escaneo de cromos |
| react-router-dom v6 | Navegación |
| vite-plugin-pwa | Service worker + manifest |

---

## Licencia

MIT — úsalo, mejóralo, compártelo.
