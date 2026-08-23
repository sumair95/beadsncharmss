# Changelog

## 2026-08-23 — Initial repo + pre-launch bug fix pass

Imported `beads_n_charms_v2.html` as `index.html` and audited it before the
first deploy. Twelve issues found; the blockers and quick wins were fixed.

### Fixed — blockers

- **Customer orders never reached the database.** `placeOrder()` wrote only to
  `localStorage` while `sbSaveOrder()` — fully implemented — was never called
  anywhere in the file. Every order placed on the site was invisible to the
  shop owner. `placeOrder()` now flattens the cart to the shape the `orders` /
  `order_items` tables expect and awaits `sbSaveOrder()`.
- **Admin dashboard always showed 0 orders / PKR 0.0k.** Same root cause: it
  read `Store.getOrders()` (browser-local) while the Orders tab read Supabase.
  Dashboard stats and Recent Orders now load from Supabase.

### Fixed — security

- **Stored XSS into the admin panel.** Order and contact fields rendered
  unescaped into admin tables, so a customer could put markup in their name and
  run script in the owner's session. Search results injected the raw query too.
  Added `esc()` and applied it to every interpolation of user- or admin-supplied
  data across the storefront and admin.
- CSV export now quotes every cell and neutralises leading `=+-@` so a customer
  name can't become a spreadsheet formula.
- Added CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` and
  `Permissions-Policy` at the nginx layer. `connect-src` and `img-src` are
  restricted to Supabase.

### Fixed — correctness

- **"Email List" admin tab was dead** — `emails` was missing from the
  `renderAdminSection` route map, so it silently rendered the Dashboard.
  `renderAdminEmails()` was orphaned code. Now routed.
- **Uploaded product photos never displayed.** Storage upload and `image_url`
  mapping both worked, but every render used `p.emoji` only. Added a `media()`
  helper used by cards, PDP, cart, search, checkout and admin tables; falls back
  to the emoji when there's no photo.
- **Shop filter checkboxes did nothing** — "In Stock Only" and "Featured" had no
  `onchange`; only the sort dropdown triggered `applyShopFilters()`.
- **No filtering or sorting at all on mobile** — the sidebar was
  `display:none` below 1024px. It now collapses into a wrapping pill row.
- **Three broken menu links** — Collections → Charms pointed at `bracelet-base`,
  `necklace-base` and `earring-base`, none of which exist as categories; all
  three landed on an empty shop. The dropdown is now generated from live
  categories, so it stays in sync with the admin panel.
- **Announcement bar sped up as you browsed.** `startTaglineRotator()` ran on
  every render and added a new uncleared `setInterval` each time. Now tears down
  the previous cycle first.
- Two more listener leaks: the product-image `change` handler and the nav scroll
  handler were re-registered on every page render. Both moved to one-time
  registration.
- **Email was marked required but never validated**, despite being the upsert key
  for `customers` and `email_subscribers`. Now format-checked before submit.
- Place Order button guards against double-submit and shows progress.
- `Store.addOrder()` no longer overwrites a supplied order id.

### Fixed — SEO / polish

- **Canonical, `og:url` and schema.org `url` pointed at `beadsncharms.pk`** —
  a different domain from the one being deployed. A canonical pointing offsite
  tells Google to index that domain instead. All now `beadsncharmss.com`.
- Added `og:image` / `twitter:image` tags (the image file itself still needs to
  be supplied — see `NEXT_STEPS.md`), plus an inline SVG favicon.
- Added the missing `@keyframes spin` — the "saving" spinner never span.
- Fixed operator-precedence bug in `dbStatus()`: `cssText += a || b` parses as
  `(cssText + a) || b`, so the fallback never applied and the style string grew
  on every call.
- `sbClearAllSales()` used the fragile filter `id=neq.placeholder`; now
  `id=not.is.null`.
- Footer year is computed rather than hardcoded to 2025.
- Removed the empty leftover "SUPABASE SDK" comment block.

### Added

- `Dockerfile` + `nginx.conf.template` — nginx on Alpine, `${PORT}` from Railway.
- `railway.json` — Dockerfile builder, `/healthz` health check.
- `robots.txt`, `sitemap.xml`, `README.md`, `NEXT_STEPS.md`, `WORKLOG.md`.

### Known, not fixed

Admin password in client source, and no URL routing. Both in `NEXT_STEPS.md`.
