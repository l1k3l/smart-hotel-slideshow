# Routes (`src/routes/`)

SvelteKit file-based routing. Three main areas: public pages, TV display, and admin panel.

## Root Layout

The root layout (`+layout.svelte`, `+layout.ts`, `+layout.server.ts`) sets up Supabase auth for the entire app:
- **Server**: Creates Supabase client from cookies, exposes `safeGetSession()` on `locals`.
- **Client**: Creates browser or server Supabase client depending on environment, passes `supabase`, `session`, `user` to all pages.
- **Auth listener**: `onAuthStateChange` invalidates the `supabase:auth` dependency when session changes, triggering data reloads.

## Files

### `+page.svelte`
Original ski resort dashboard. Fetches from `/api/resort-data` every 5 minutes. This page is unchanged from the initial build and serves as a standalone demo.

### `+error.svelte`
Global error boundary. Shows HTTP status code and error message with a link home.

## Subfolders

### `auth/callback/`
OAuth/email callback handler. Exchanges the auth `code` parameter for a session, then redirects to `/admin`.

### `display/[token]/`
TV-facing display route. The full device lifecycle:
1. `+page.ts` extracts the token from URL params.
2. `+page.svelte` on mount: loads cached config from localStorage (instant display), generates/retrieves a device UUID from localStorage, POSTs to `/api/display/[token]/bind`, fetches fresh config from `/api/display/[token]`, starts 60s heartbeat loop and 5min data refresh loop.
3. Offline resilience: if network fails but cache exists, keeps showing cached data.
4. Config change detection: heartbeat response includes `configVersion`; if it differs, refetches config.

### `admin/`
Protected admin panel. See below.

### `api/`
See below.

---

## Admin Panel (`admin/`)

### Auth Guard (`+layout.server.ts`)
Checks Supabase session and `hotel_users` table membership. Unauthenticated users redirect to `/admin/login`. The login page itself is exempted from the guard.

### Layout (`+layout.svelte`)
Sidebar navigation with links to Dashboard, Devices, Settings, Preview. Shows sign-out button. Login page renders without the sidebar.

### Pages
- **`+page.svelte`** (Dashboard) — Device stats: total, active, online (seen within 2min), bound.
- **`login/+page.svelte`** — Email/password login form using `supabase.auth.signInWithPassword()`.
- **`devices/+page.svelte`** — Device management: generate tokens, rename (double-click), enable/disable, unlink (clear device binding), delete. Inline status badges (online/offline/unbound/inactive).
- **`settings/+page.svelte`** — Hotel settings form: theme picker (4 themes), slide duration, language, module toggles, resort aliases. Uses `$effect` to sync form state from server data after save.
- **`preview/+page.svelte`** — Renders `DisplayShell` in a 1920x1080 frame scaled to 50%, giving a live preview of what the TV sees.

---

## API Endpoints (`api/`)

### Public
- **`GET /api/resort-data`** — Parametrized resort data. Query params: `aliases` (comma-separated, default: medvedin,svpetr), `provider`, `lang`. Goes through the cache layer.

### Display (device-facing, no auth)
- **`GET /api/display/[token]`** — Returns full `DisplayConfig` (settings + resort data) for a device token.
- **`POST /api/display/[token]/bind`** — Binds a device UUID to a token. First-come-first-served; rejects if already bound to a different device.
- **`POST /api/display/[token]/heartbeat`** — Updates `last_seen_at`, returns `configVersion` for change detection.

### Admin (requires Supabase auth + hotel_users membership)
All admin endpoints check `safeGetSession()` and look up `hotel_users` to get the user's hotel.

- **`GET /api/admin/devices`** — List all devices for the user's hotel.
- **`PATCH /api/admin/devices/[id]`** — Update device name or active status.
- **`DELETE /api/admin/devices/[id]`** — Delete a device and its token.
- **`POST /api/admin/devices/[id]/unlink`** — Clear device UUID binding (allows rebinding to a new TV).
- **`GET /api/admin/settings`** — Get hotel settings.
- **`PUT /api/admin/settings`** — Update hotel settings. Sets `updatedAt` to trigger config version change for display devices.
- **`POST /api/admin/tokens/generate`** — Generate a new `XXXX-XXXX` token with uniqueness retry.

## Design Decisions

- **No SSR for display route** — The display page is entirely client-rendered. It needs `localStorage` for device UUID and config caching, which isn't available during SSR.
- **Heartbeat polling, not WebSockets** — 60s polling is simple and works on all TV browsers. Supabase Realtime can be added later as an enhancement.
- **Admin auth uses hotel_users, not Supabase RLS** — Since we use Drizzle (direct Postgres), RLS doesn't apply. Authorization is enforced per-endpoint by querying `hotel_users`.
