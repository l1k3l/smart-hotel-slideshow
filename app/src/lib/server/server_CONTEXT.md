# Server Library (`src/lib/server/`)

Server-only code. SvelteKit enforces that files under `server/` are never bundled into client code.

## Files

### `supabase.ts`
Factory for creating a Supabase server client from SvelteKit cookies. Used in `hooks.server.ts` to attach a client to `event.locals`. Uses `PUBLIC_` env vars (publishable key), not the secret key — auth works via cookies, not service role.

### `resort-cache.ts`
In-memory cache layer over the provider system. Keyed by `{provider}:{sorted-aliases}` so hotels sharing the same resort data share cache entries. TTL is 3 minutes.

### `token.ts`
Generates `XXXX-XXXX` format device tokens using a charset that excludes ambiguous characters (0/O, 1/I). This format was chosen because hotel staff may need to type tokens on TV remotes.

## Subfolders

### `db/`
Drizzle ORM setup.

- **`schema.ts`** — Table definitions for `hotels`, `hotel_settings`, `devices`, `hotel_users`. Uses a local `timestamptz` helper that wraps `timestamp({ withTimezone: true })` for cleaner column definitions. The `hotel_settings.provider_config` and `custom_branding` columns are JSONB — schema-less by design so different providers can store arbitrary config.
- **`index.ts`** — Singleton Drizzle client. Uses `prepare: false` because Supabase's transaction pooler (port 6543) doesn't support prepared statements.

### `providers/`
Data provider abstraction layer. The key design decision: display modules consume canonical types (`WeatherData[]`, `Lift[]`, etc. from `$lib/types.ts`) regardless of data source. Adding a new resort API means implementing `DataProvider` and registering it — no display code changes.

- **`types.ts`** — `DataProvider` interface (fetchWeather/Lifts/Slopes/Webcams) and `ProviderConfig`.
- **`holidayinfo.ts`** — Implementation for the Holidayinfo XML API. Has both the per-method `DataProvider` interface and a convenience `fetchHolidayinfoResortData()` that fetches everything in one XML call (avoids 4 separate HTTP requests).
- **`registry.ts`** — Maps provider name strings to implementations. Currently only `'holidayinfo'`.
- **`index.ts`** — `fetchResortData()` dispatcher. Special-cases `'holidayinfo'` to use the optimized single-call path; all other providers use the generic 4-parallel-fetch path.

## Design Decisions

- **Drizzle for data, Supabase JS only for auth** — Drizzle gives type-safe queries and migration control. Supabase JS handles session cookies and auth flows (which would be painful to reimplement).
- **Cache is in-memory, not Redis** — Acceptable for now since resort data changes infrequently and we're running on serverless (Vercel). Each cold start gets a fresh cache; warm instances share it across requests.
- **No RLS** — Drizzle connects directly to Postgres (bypassing PostgREST/RLS). Authorization is enforced in API route handlers by checking `hotel_users` membership.
