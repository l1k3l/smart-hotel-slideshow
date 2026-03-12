# Core Library (`src/lib/`)

Shared code importable via the `$lib` alias.

## Files

### `types.ts`
Canonical data types that serve as the **contract between providers and display modules**:
- `WeatherData` — Temperature, snow conditions, operation status, weather codes.
- `Lift` — Lift name, type, status, capacity.
- `Slope` — Difficulty, status, length, elevation, snowmaking/night skiing flags.
- `Webcam` — Camera image/video URLs, altitude, temperature, panoramic support.
- `ResortData` — Container wrapping arrays of all four + `fetchedAt` timestamp.

These types are intentionally provider-agnostic. A new data source must map its data into these shapes.

### `parse-xml.ts`
Holidayinfo XML response parser. Uses `fast-xml-parser` to navigate the nested `export > country > region > location` structure. Extracts weather, lifts, slopes, and webcams with deduplication (webcams can appear under multiple locations).

Helper functions `asArray()`, `num()`, `str()` handle the XML parser's inconsistent output (single values vs arrays, missing fields).

### `index.ts`
Empty barrel file. SvelteKit convention.

## Subfolders

- **`server/`** — Server-only code (DB, providers, auth, caching). See `server/server_CONTEXT.md`.
- **`display/`** — TV display components (modules, themes, slideshow engine). See `display/display_CONTEXT.md`.
- **`assets/`** — Static assets imported by components (favicon.svg).
