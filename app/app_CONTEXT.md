# Smart Hotel Slideshow — App Overview

Multi-tenant hotel digital signage SaaS. Hotels display customizable slideshows (weather, lifts, slopes, webcams) on lobby/room TVs via a simple URL with a device token.

## Stack

- **Framework**: SvelteKit 2 + Svelte 5 (runes)
- **Language**: TypeScript (strict mode)
- **Database**: Supabase Postgres via Drizzle ORM
- **Auth**: Supabase Auth via `@supabase/ssr`
- **Deployment**: Vercel (`@sveltejs/adapter-vercel`)
- **Data Source**: Holidayinfo XML API (pluggable provider system)

## Key URLs

| URL | Purpose |
|-----|---------|
| `/` | Original ski resort dashboard (standalone demo) |
| `/display/[token]` | TV-facing fullscreen slideshow |
| `/admin` | Hotel admin panel (auth required) |
| `/admin/login` | Admin login |
| `/api/resort-data` | Public resort data API |

## Environment Variables

```env
# Holidayinfo API
ACCOUNT=...          # or DC=... (download code)

# Supabase - public (browser-safe, PUBLIC_ prefix for SvelteKit)
PUBLIC_SUPABASE_URL=https://xxx.supabase.co
PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...

# Supabase - server only
SUPABASE_SECRET_KEY=sb_secret_...   # not used yet, reserved for future admin ops

# Drizzle - direct Postgres (transaction pooler, port 6543)
DATABASE_URL=postgresql://postgres.xxx:password@pooler.supabase.com:6543/postgres
```

Note: Supabase has moved from `anon`/`service_role` key naming to `publishable`/`secret`. We use the new naming.

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build for Vercel |
| `npm run check` | TypeScript + Svelte type checking |
| `npm run db:generate` | Generate Drizzle migration SQL |
| `npm run db:migrate` | Run migrations against Supabase |
| `npm run db:seed` | Seed test hotel, settings, device token |

Seed supports `USER_ID=<uuid> npm run db:seed` to link a Supabase auth user as hotel admin.

## Project Structure

```
app/
  drizzle/                  # Generated migration SQL files
  drizzle.config.ts         # Drizzle Kit config
  scripts/
    seed.ts                 # Database seed script (idempotent)
  src/
    app.d.ts                # Global types (App.Locals)
    app.html                # HTML shell
    hooks.server.ts         # Supabase session middleware
    lib/                    # Shared library code
      types.ts              # Canonical data types (provider ↔ display contract)
      parse-xml.ts          # Holidayinfo XML parser
      server/               # Server-only (DB, providers, cache, auth)
      display/              # TV display (modules, themes, slideshow engine)
    routes/                 # SvelteKit routes (pages + API)
      admin/                # Admin panel (auth-guarded)
      api/                  # REST API endpoints
      display/[token]/      # TV-facing display route
      auth/callback/        # Supabase auth callback
```

## Database Tables

- **`hotels`** — Hotel identity (name, slug).
- **`hotel_settings`** — Display config per hotel (theme, speed, modules, provider, aliases).
- **`devices`** — TV devices with tokens, binding state, heartbeat tracking.
- **`hotel_users`** — Links Supabase auth users to hotels with roles.

## Architecture Highlights

- **Provider abstraction** — Data sources are pluggable. The `DataProvider` interface in `server/providers/` means adding a new resort API (e.g., Bergfex, OpenWeather) requires zero changes to display code.
- **Module system** — Display modules are self-contained Svelte components. Adding a new module (events, trail map, custom message) means creating a component + registering it.
- **Device auth** — Tokens are short (`XXXX-XXXX`, typeable on TV remotes). Devices self-register via localStorage UUID. Admin can unlink/rebind.
- **Config propagation** — Devices detect settings changes via `configVersion` in heartbeat responses (60s polling). No WebSocket dependency.

## Context Documentation

Each major subfolder has a `*_CONTEXT.md` file explaining its files, design decisions, and subfolders:
- `app/app_CONTEXT.md` — This file (project overview)
- `src/lib/lib_CONTEXT.md` — Core types and XML parser
- `src/lib/server/server_CONTEXT.md` — Database, providers, cache, auth
- `src/lib/display/display_CONTEXT.md` — Display modules, themes, slideshow
- `src/routes/routes_CONTEXT.md` — All routes, API endpoints, auth flow
