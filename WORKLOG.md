# Work log

## 2026-08-23 — Repo setup, bug fix pass, Railway deploy

**Goal:** get `beads_n_charms_v2.html` off the Downloads folder and onto
beadsncharmss.com with auto-deploy.

**Done:**
- Moved the file to `AI_Agent/beadsncharmss/index.html`.
- Full read-through and audit — 12 issues, see `CHANGELOG.md`.
- Fixed the blockers + quick wins (orders → Supabase, XSS escaping, dead admin
  tab, product photos, mobile filters, broken menu links, timer leaks, SEO
  domain). Verified with `node --check` on the extracted script body.
- Added Docker/nginx deploy config for Railway.
- Created GitHub repo `sumair95/beadsncharmss`, pushed `main`.
- Connected Railway to the repo with auto-deploy on push.
- Pointed beadsncharmss.com at the Railway service.

**Context worth keeping:**
- The store keeps a `localStorage` mirror of the Supabase catalogue as an
  offline fallback. When debugging "stale products", clear `bnc_products` /
  `bnc_categories` in devtools — the DB may be fine and the mirror stale.
- The admin panel talks to Supabase with the **anon key**, not an authenticated
  session. That's why tightening RLS and moving to Supabase Auth have to be
  done in the same change (see `NEXT_STEPS.md` items 1 and 2).
- `index.html` is served `no-cache` deliberately. Don't "optimise" that — it's
  what makes a redeploy visible to returning customers immediately.

**Left deliberately undone:** admin auth hardening and URL routing — both
scoped in `NEXT_STEPS.md`.

## 2026-08-24 — bnc-final build, Supabase Auth, schema migration

**Done:**
- Replaced the single-file store with the multi-file `bnc-final` build
  (variants, stock, discounts, reviews, analytics, WhatsApp alerts). Merged
  rather than overwritten — the zip ships no Dockerfile, so a wholesale push
  would have broken the Railway build.
- Moved admin auth from a hardcoded password to Supabase Auth; added
  `TO authenticated` policies so the anon key keeps only catalogue-read and
  order-insert.
- Locked storage writes to authenticated. They were public.
- Made `supabase.sql` genuinely idempotent (policies *and* triggers).
- Added an `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` migration block: the
  live DB was built from the older 7-table schema and was missing 15 columns
  the new code needs. `CREATE TABLE IF NOT EXISTS` would have skipped them
  silently, then the policy step would have failed on `products.active`.
- Verified RLS against the live database with the anon key. See NEXT_STEPS.

**Gotchas worth remembering:**
- Four copies of the schema existed on disk; pasting a stale one reproduced an
  already-fixed error. Repo now has exactly one `supabase.sql`.
- A PostgREST PATCH/DELETE with a filter matching zero rows returns 204
  whether or not RLS allows it. To test write permission, do a no-op update
  against a **real** row with `Prefer: return=representation` and count the
  returned rows.

**Next:** Railway deploy verification, DNS for the apex domain, og-image.jpg.
