# Beads N Charms — Complete E-Commerce Store

Pinterest-inspired handmade jewellery store for Pakistan market.
Live at: [beadsncharmss.com](https://beadsncharmss.com)

## Tech Stack
- **Frontend:** Vanilla HTML/CSS/JS — no framework, loads instantly
- **Database:** Supabase (PostgreSQL) — products, orders, customers
- **Storage:** Supabase Storage — product images
- **Hosting:** Railway / Netlify
- **Domain:** beadsncharmss.com

## Features
- ✅ Full product catalogue with real images
- ✅ Product variants (size, colour)
- ✅ Stock quantity tracking + low stock alerts
- ✅ Discount codes (%, fixed, free delivery)
- ✅ Order tracking page
- ✅ Customer reviews
- ✅ Abandoned cart capture
- ✅ WhatsApp owner notifications on every order
- ✅ Email collection (compulsory at checkout)
- ✅ Analytics dashboard
- ✅ COD / EasyPaisa / JazzCash checkout
- ✅ Admin panel (products, orders, emails, discounts, reviews)
- ✅ SEO optimised for Pakistan

## Project Structure
```
.
├── index.html          # Main entry point
├── css/
│   └── styles.css      # All styles
├── js/
│   ├── config.js       # Supabase config + DB layer
│   ├── ui.js           # Cart, nav, search, product cards
│   ├── pages.js        # Page renderers (home, shop, checkout...)
│   └── admin.js        # Admin panel
├── supabase.sql        # Run once in Supabase SQL editor
└── README.md
```

## Setup

### 1. Supabase Database
1. Go to [supabase.com](https://supabase.com) → your project
2. SQL Editor → New Query → paste `supabase.sql` → Run
3. Tables, RLS policies, and seed data are created.
   The script is idempotent — safe to re-run.

### 1b. Create the admin user
Authentication → Users → **Add user** → set an email + strong password, and
tick *Auto Confirm User*. That is the login for the admin panel.

### 2. Local Development
```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/beadsncharmss.git
cd beadsncharmss

# Open in browser (no build step needed)
open index.html
# Or use a local server:
npx serve .
```

### 3. Deploy
Already wired: Railway builds the `Dockerfile` and deploys on every push to
`main`. Just `git push`. See `DEPLOY.md`.

### 4. Connect Domain
See `DEPLOY.md` — `beadsncharmss.com` is an apex domain, so a plain CNAME at
the root will not work with every registrar.

## Admin Panel
Footer → **Admin ↗**. Sign in with the **Supabase Auth** user you created
(Supabase → Authentication → Users → Add user).

There is no password in the source. The panel signs in against Supabase Auth
and sends the resulting session token instead of the anon key, which is what
the `TO authenticated` policies in `supabase.sql` grant against. The anon key
the storefront uses can read the catalogue and insert orders — nothing more.

## Environment Variables
None. The Supabase URL and **anon** key in `js/config.js` are public by design
and safe to ship — RLS is what protects the data, not secrecy of that key.
Never put the `service_role` key in this repo; it bypasses RLS entirely.

## Deploying
Railway builds from the `Dockerfile` and redeploys on every push to `main`.
See `DEPLOY.md` for the full setup, including the apex-domain DNS caveat.

## Discount Codes (pre-seeded)
| Code | Type | Value |
|------|------|-------|
| WELCOME10 | 10% off | All orders |
| SAVE200 | PKR 200 off | Orders above PKR 1,500 |
| FREESHIP | Free delivery | All orders |
| BNC20 | 20% off | Orders above PKR 2,000 |

## WhatsApp Notifications
When an order is placed, a WhatsApp message is auto-drafted to your number.
Update `CONFIG.WHATSAPP_NUMBER` in `js/config.js` to your number.
