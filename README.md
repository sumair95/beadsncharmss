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
bnc-final/
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
3. Tables, RLS policies, and seed data are created

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

### 3. Deploy to Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### 4. Connect Domain
In Railway dashboard → Settings → Domains → Add `beadsncharmss.com`
Then update DNS at your registrar:
- CNAME `www` → your-project.railway.app
- A record → Railway IP

## Admin Panel
Visit `/index.html` → scroll to footer → click "Admin ↗"
Password: `beadsncharms2025` (change in `js/config.js`)

## Environment Variables
No environment variables needed — Supabase keys are in `js/config.js`
For production, move keys to Railway environment variables.

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
