# Beads N Charms

Storefront for **Beads N Charms** — handmade jewellery, Pakistan.
Live at **https://beadsncharmss.com**

A single self-contained `index.html`: markup, styles and app logic in one file,
talking to Supabase over the REST API. No build step, no framework, no bundler.

---

## Stack

| Piece | What it is |
|---|---|
| Frontend | One static `index.html` — vanilla JS, no dependencies |
| Data | Supabase REST (`kjwhxuqbrcerqfuikcmv.supabase.co`) |
| Images | Supabase Storage, bucket `product-images` |
| Hosting | Railway, nginx in Docker |
| Domain | beadsncharmss.com |

## Supabase tables

`categories` · `products` · `orders` · `order_items` · `customers` ·
`email_subscribers` · `contact_messages`

The catalogue loads from Supabase on boot and is mirrored into `localStorage`,
which doubles as the offline fallback if the database is unreachable.

## Local development

It's a static file — open it directly, or serve it to get realistic behaviour:

```bash
npx serve .            # then visit http://localhost:3000
```

To test exactly what Railway runs:

```bash
docker build -t bnc .
docker run --rm -p 8080:8080 bnc
```

## Deploying

Railway watches the `main` branch. **Every push to `main` deploys automatically** —
there is no manual deploy step.

```bash
git add -A
git commit -m "your change"
git push
```

Build is defined by `Dockerfile` + `nginx.conf.template`; Railway settings live
in `railway.json`. `index.html` is served with `no-cache` so a deploy reaches
returning visitors immediately.

## Admin panel

Footer → **Admin**. Manage products, categories, bulk sales, orders and the
email list.

> ⚠️ The admin password is currently a plain string in `index.html`. Anyone
> viewing source can read it and sign in. See `NEXT_STEPS.md` — this needs to
> move to Supabase Auth with RLS before the store handles real volume.

## Files

```
index.html            the entire store
Dockerfile            nginx:alpine image
nginx.conf.template   server config; ${PORT} filled in by Railway at boot
railway.json          builder + health check settings
robots.txt            crawler rules
sitemap.xml           sitemap (root only — SPA has no per-page URLs)
og-image.jpg          MISSING — add a 1200x630 photo for link previews
```
