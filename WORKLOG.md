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
