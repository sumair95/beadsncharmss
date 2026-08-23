# Next steps

Ordered by urgency. Updated 2026-08-23.

---

## 1. Verify Supabase RLS — do this first 🔴

The anon key is in the client (normal and unavoidable for a static site), so
**whatever the anon role is allowed to do, the public can do.** Check the
policies on every table in the Supabase dashboard:

| Table | anon should be able to | anon must NOT be able to |
|---|---|---|
| `products` | `SELECT` | `INSERT` / `UPDATE` / `DELETE` |
| `categories` | `SELECT` | `INSERT` / `UPDATE` / `DELETE` |
| `orders` | `INSERT` | `SELECT` (would leak every customer's address) |
| `order_items` | `INSERT` | `SELECT` |
| `customers` | `INSERT` / upsert | `SELECT` |
| `email_subscribers` | `INSERT` / upsert | `SELECT` |
| `contact_messages` | `INSERT` | `SELECT` |

Note the tension: the admin panel currently reads `orders`, `email_subscribers`
and writes `products` **using the anon key**. So locking anon down correctly
*will* break the admin panel — which is exactly why item 2 has to happen with it.
Do them together.

If anon can currently `SELECT` from `orders`, treat every customer name, phone,
address and email in that table as already public.

## 2. Move admin auth to Supabase Auth 🔴

`const ADMIN_PW='beadsncharms2025'` sits in `index.html` in plain text. Anyone
who opens View Source can sign in and delete the catalogue, apply a 90% discount,
or read every customer record.

No client-side password check can ever be secure — the fix is real auth:

1. Create an admin user in Supabase Auth.
2. Replace the password prompt with `signInWithPassword`.
3. Write RLS policies keyed on `auth.role() = 'authenticated'` for the
   admin-only reads and writes.
4. Use the session token instead of the anon key for admin requests.

Until this ships, treat the admin panel as public and rotate that password out
of the repo.

## 3. Supply `og-image.jpg` 🟠

Shares to WhatsApp and Instagram currently have no preview image. Drop a
**1200×630** JPG at the repo root named `og-image.jpg` and push — the meta tags
already point at it. A clean flat-lay of your bestsellers works well.

## 4. URL routing 🟠

The store is one in-memory SPA. Every page is `beadsncharmss.com/` — so:

- product links can't be shared or sent to a customer,
- the browser Back button does nothing,
- **Google can only ever index the homepage**, which wastes the extensive
  keyword meta already written into `<head>`.

Fix with `history.pushState` in `renderPage()` plus a `popstate` handler and a
path parser on boot. nginx already falls back to `index.html` for unknown paths,
so no server change is needed. Add the resulting URLs to `sitemap.xml`.

## 5. Smaller items 🟡

- **Order confirmation emails.** Checkout collects an email and promises "your
  order confirmation will be sent here" — nothing sends one. Needs a Supabase
  Edge Function on insert to `orders` (Resend / Postmark).
- **Newsletter signup has no UI.** `sbSubscribe()` is written and working but
  nothing calls it. A footer signup field would start building the list.
- **Wishlist is fake.** The ♡ button just fires a toast; nothing is saved.
- **Contact form doesn't confirm delivery.** `sbSaveContact()` swallows errors,
  so the success modal shows even when the write failed.
- **Keyboard accessibility.** Navigation uses `<a>` and `<div>` with `onclick`,
  no `href`, `role` or `tabindex` — unreachable by keyboard and unclear to
  screen readers.
- **Product detail thumbnails are decorative** — the 2nd and 3rd are hardcoded
  ✨ and 💜 regardless of the product. Either wire up multiple images or drop them.
- **Instagram strip is hardcoded gradients**, not real posts.
