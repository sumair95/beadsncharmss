# Next steps

Ordered by urgency. Updated 2026-08-24.

---

## ✅ Done — Supabase RLS verified (2026-08-24)

`supabase.sql` applied cleanly. Verified against the live database with the
public anon key:

- Public can read `products`, `categories`, approved `reviews`, active
  `discount_codes` — nothing else.
- `orders`, `customers`, `order_items`, `email_subscribers`,
  `contact_messages`, `analytics`, `abandoned_carts` return no rows publicly.
- Anon cannot edit or delete catalogue rows (confirmed with a no-op UPDATE
  against a real row, which RLS filtered out).
- Storage uploads are authenticated-only; the bucket is no longer publicly
  writable.
- Anon can still INSERT orders, so checkout works.

Caveat: the `orders` read check ran against an empty table, so it is
consistent with both "blocked" and "empty". Re-run it once a real order
exists to make it conclusive.

## ✅ Done — admin moved to Supabase Auth (2026-08-24)

No password in the source. The panel signs in via Supabase Auth and sends the
session token, which is what the `TO authenticated` policies grant against.

## 1. Supply `og-image.jpg`

Shares to WhatsApp and Instagram have no preview image. Drop a **1200x630**
JPG at the repo root named `og-image.jpg` and push — the meta tags already
point at it, and the Dockerfile now serves any new asset automatically.

## 2. URL routing

The store is one in-memory SPA. Every page is `beadsncharmss.com/` — so
product links can't be shared, Back does nothing, and Google can only index
the homepage, wasting the keyword meta in `<head>`. Fix with
`history.pushState` in `renderPage()` plus a `popstate` handler and a path
parser on boot. nginx already falls back to `index.html`, so no server change
is needed. Add the resulting URLs to `sitemap.xml`.

## 3. Order notifications are not reliable

`notifyOwnerWhatsApp()` builds a `wa.me` link, which opens WhatsApp in the
*customer's* browser. If they close the tab, you never hear about the order.
The dependable version is a Supabase Edge Function triggered on insert to
`orders`, sending via the WhatsApp Business API or email (Resend/Postmark).
The same function should send the customer their confirmation — checkout
promises one today and nothing sends it.

## 4. Smaller items

- **`customers.password_hash` should not be used.** It implies storing
  customer credentials yourself. Supabase Auth already does this properly.
- **Discount codes are publicly listable** — anyone can `GET
  /rest/v1/discount_codes` and read WELCOME10, SAVE200, FREESHIP, BNC20.
  Inherent to client-side validation; just don't treat them as private.
- **Anon can UPDATE `customers` and `abandoned_carts`** (`Public upsert
  customers` uses `USING (true)`). They can't read them, but they can blindly
  overwrite. Tighten if it ever matters.
- **Keyboard accessibility** — nav uses `<div>`/`<a>` with `onclick` and no
  `href`/`role`/`tabindex`.
