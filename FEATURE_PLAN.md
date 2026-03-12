# Feature Plan — Smart Hotel Slideshow

## Tier 1 — High Value, Low Complexity

### 1. Hotel Services Board
- **What**: Cards for restaurant, spa, pool, gym, etc. — name, category, hours, description, optional image URL
- **DB**: New `hotel_services` table (`hotel_id`, `name`, `category`, `description`, `hours`, `image_url`, `sort_order`, `is_active`)
- **Admin**: New Services page — CRUD list with add/edit/delete, drag-to-reorder or sort_order field
- **Display**: `ServicesModule.svelte` — grid of service cards with icons per category
- **Status**: Not started

### 2. Custom Announcements
- **What**: Rich text messages with optional image, schedulable (show from/until date)
- **DB**: New `announcements` table (`hotel_id`, `title`, `body`, `image_url`, `show_from`, `show_until`, `priority`, `is_active`)
- **Admin**: New Announcements page — CRUD with scheduling fields
- **Display**: `AnnouncementsModule.svelte` — styled announcement cards, only shows active + in-date-range
- **Status**: Not started

### 3. General Weather (multi-destination)
- **What**: Current conditions + forecast for any city, not just ski resorts
- **Provider**: OpenWeatherMap API (free tier: 1000 calls/day)
- **Admin**: Weather destinations config in Settings — pick 2-3 cities/locations to display
- **DB**: Add `weather_destinations` JSONB to `hotel_settings` (array of `{ name, lat, lon }`)
- **Display**: `GeneralWeatherModule.svelte` — cards with current temp, conditions, forecast
- **API**: New provider in `src/lib/server/providers/` using provider abstraction
- **Status**: Not started

### 4. QR Code Widgets
- **What**: Auto-generated QR codes from URLs (feedback form, menu PDF, Wi-Fi login, etc.)
- **DB**: Add `qr_codes` JSONB to `hotel_settings` (array of `{ label, url }`)
- **Admin**: QR code config in Settings — add/remove label+URL pairs
- **Display**: `QRCodeModule.svelte` — renders QR codes client-side with labels
- **Library**: `qrcode` npm package for client-side generation
- **Status**: Not started

---

## Tier 2 — Medium Complexity, Strong Differentiators

### 5. Events / Schedule Module
- Date, time, location, description for hotel events (weddings, conferences, yoga)
- New `hotel_events` table with date-based filtering
- Calendar-style admin editor

### 6. Multi-Language Content Rotation
- Admins enter content in 2-3 languages
- Display cycles through languages or uses guest/device preference
- i18n layer for all CMS content

### 7. Emergency Alert Override
- Priority message that takes over all screens instantly
- Simple flag/message in admin, overrides slideshow when active
- Safety/compliance selling point

### 8. Image / Video Slideshow
- Promotional content upload (photos, short videos)
- Leverages existing slideshow engine
- File upload to Supabase Storage or external CDN

### 9. Local Attractions
- Curated list of nearby restaurants, activities, landmarks
- Manual CMS with name, address, phone, link, category, image

---

## Tier 3 — Future Roadmap

### 10. PMS Integration
- Start with Mews or Apaleo (best-documented APIs)
- Personalized welcome messages ("Welcome, Mr. Smith")
- Pull event blocks, group names

### 11. Social Media Wall
- Instagram hashtag feed via Meta API
- Aggregated guest UGC

### 12. Content Templates / Marketplace
- Pre-designed seasonal layouts (Christmas, summer, ski season)
- One-click activation

### 13. Time-Based Content Rules
- Breakfast menu in morning, bar menu in evening
- Weather-triggered content (rainy day → spa promo)
- Occupancy-based messaging

### 14. Transportation Module
- Shuttle schedules, taxi numbers, public transit
- Google Maps/transit API or manual CMS

### 15. News / RSS Feed Module
- Parse configurable RSS feeds for local news or curated content

---

## Architecture Notes

- **No RLS needed** — Drizzle connects directly to Postgres (bypasses PostgREST/RLS). Authorization is enforced in API route handlers via `hotel_users` table lookup.
- **Provider abstraction** — General weather fits the existing `DataProvider` pattern in `src/lib/server/providers/`.
- **Module system** — New display modules register in `src/lib/display/modules/index.ts` and become available in hotel settings.
- **Admin pages** — Each CMS feature gets its own admin page with CRUD API endpoints.

## Market Context

- Small hotel signage SaaS: $10-30/screen/month
- Tier 1 features cover ~80% of small/medium hotel needs without PMS integration
- Multi-property management (already supported) justifies premium pricing
