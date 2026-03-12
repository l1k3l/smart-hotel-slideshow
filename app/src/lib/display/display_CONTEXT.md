# Display Library (`src/lib/display/`)

Client-side display system for the TV-facing slideshow. Everything here is designed for fullscreen, unattended operation on hotel lobby TVs and in-room screens.

## Files

### `types.ts`
- **`ModuleName`** — Union type: `'weather' | 'lifts' | 'slopes' | 'webcams'`. Extend this when adding new modules.
- **`DisplayConfig`** — The complete payload a display device receives: hotel name, theme, speed, enabled modules, resort data, and `configVersion` (unix timestamp of last settings change, used for change detection during heartbeats).

### `helpers.ts`
Extracted from the original `+page.svelte`. Pure functions for UI rendering:
- `weatherIcon(code)` — Maps Holidayinfo weather codes (1-10) to emoji.
- `statusColor(status)` — Maps open/closed/other to CSS custom property colors.
- `difficultyColor(code)` — Maps slope difficulty codes (1=blue, 2=red, 3=black).

### `themes.ts`
CSS custom property maps for 4 themes: `dark`, `light`, `alpine`, `luxury`. Each theme defines 10 CSS variables (--bg, --surface, --text, etc.). The `themeToStyle()` helper converts a theme to an inline style string for the shell wrapper.

### `DisplayShell.svelte`
Fullscreen wrapper component. Applies theme via inline CSS custom properties, renders a header (hotel name + clock), the slideshow engine, and a footer with data timestamp. Sets `cursor: none` for kiosk mode.

### `SlideShowEngine.svelte`
Cycles through enabled modules with fade transitions. Uses `setInterval` at the configured speed. The transition works by toggling a `visible` class (opacity 0/1 with CSS transition), swapping the component during the invisible phase.

## Subfolder

### `modules/`
Self-contained Svelte components, one per data type. Each module:
- Accepts a single typed prop (e.g., `weather: WeatherData[]`)
- Contains its own styles (no global CSS dependencies beyond CSS custom properties)
- Has no knowledge of the data provider — it only knows the canonical types from `$lib/types.ts`

Files:
- **`WeatherModule.svelte`** — Weather cards grid with temperature, snow, conditions.
- **`LiftsModule.svelte`** — Lift status table.
- **`SlopesModule.svelte`** — Slope status table with difficulty indicators.
- **`WebcamsModule.svelte`** — Webcam image grid with altitude/temperature metadata.
- **`index.ts`** — Module registry. Maps `ModuleName` to component + prop extraction function. To add a new module: create the `.svelte` file, add to `ModuleName` union, register here.

## Design Decisions

- **Modules are pluggable** — Adding `EventsModule` or `TrailMapModule` requires only: (1) create component, (2) add to `ModuleName`, (3) register in `index.ts`. No changes to the engine or shell.
- **CSS custom properties for theming** — Themes are applied as inline styles on the shell div, and all modules reference `var(--surface)`, `var(--text)`, etc. This avoids CSS class proliferation and makes runtime theme switching instant.
- **No framework transition library** — The fade is a simple CSS opacity transition. TV browsers (often older WebKit/Chromium) handle CSS transitions reliably; JS animation libraries are unnecessary risk.
