# Smart Hotel Slideshow

Multi-tenant hotel digital signage SaaS built with SvelteKit, Supabase, and Drizzle ORM.

## Working Directory

The SvelteKit app lives in `app/`. Always run npm commands from there.

## Quick Reference

```bash
cd app
npm run dev          # Start dev server
npm run check        # Type-check (must pass before committing)
npm run build        # Production build
npm run db:generate  # Generate migration after schema changes
npm run db:migrate   # Run migrations
npm run db:seed      # Seed test data (USER_ID=<uuid> to link admin)
```

## Architecture

- **Svelte 5** with runes (`$state`, `$derived`, `$effect`, `$props`)
- **Drizzle ORM** for all database queries (not Supabase JS client for data)
- **Supabase JS** only for authentication (session cookies via `@supabase/ssr`)
- **Provider abstraction** in `src/lib/server/providers/` — data sources are pluggable
- **No RLS** — authorization is enforced in API route handlers via `hotel_users` table lookup

## Conventions

- When writing SQL, always use lowercase and try to avoid very short aliases
- TypeScript strict mode — no `any` without justification
- Svelte components use CSS custom properties for theming (defined in `src/lib/display/themes.ts`)
- Server-only code goes under `src/lib/server/` (SvelteKit enforces this boundary)
- Canonical data types in `src/lib/types.ts` are the contract between providers and display modules — don't put provider-specific types there

## Git Workflow

### Commit Messages

**ALWAYS use Gitmoji** for commit messages in this repository. Examples:
- 🎨 `:art:` - Improve structure/format of the code
- ✨ `:sparkles:` - Introduce new features
- 🐛 `:bug:` - Fix a bug
- 📝 `:memo:` - Add or update documentation
- ♻️ `:recycle:` - Refactor code
- ✅ `:white_check_mark:` - Add or update tests
- 🔧 `:wrench:` - Add or update configuration files / small general changes
- 🛠️ `:wrench:` - Larger general changes
- 🚀 `:rocket:` - Deploy stuff
- 🧹 `:broom:` - Clean up code

## Context Documentation

The codebase has `*_CONTEXT.md` files in key subfolders that document files, design decisions, and architecture. These are for developer orientation:

- `app/app_CONTEXT.md` — Project overview, stack, env vars, structure
- `app/src/lib/lib_CONTEXT.md` — Core types and XML parser
- `app/src/lib/server/server_CONTEXT.md` — Database, providers, cache, auth
- `app/src/lib/display/display_CONTEXT.md` — Display modules, themes, slideshow engine
- `app/src/routes/routes_CONTEXT.md` — Routes, API endpoints, auth flow

**Rule: When you modify code in a subfolder, update its `*_CONTEXT.md` file if the change affects architecture, adds/removes files, or changes design decisions.**

## Environment Variables

See `app/app_CONTEXT.md` for the full list. Key note: Supabase uses the new `publishable`/`secret` key naming (not legacy `anon`/`service_role`). Browser-safe vars use SvelteKit's `PUBLIC_` prefix.

## Database

4 tables: `hotels`, `hotel_settings`, `devices`, `hotel_users`. Schema defined in `app/src/lib/server/db/schema.ts`. Uses Supabase Postgres via transaction pooler (port 6543) with `prepare: false`.
