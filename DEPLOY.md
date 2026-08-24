# Deploying to Railway

One-time setup. After this, **every push to `main` deploys automatically** and
you never touch Railway again.

---

## 1. Create the project

1. **railway.app** → **New Project** → **Deploy from GitHub repo**
2. Pick **`sumair95/beadsncharmss`**

> **If the repo isn't in the list:** it's private, so Railway's GitHub App needs
> to be granted access. Click **Configure GitHub App** → select your account →
> under *Repository access* add `beadsncharmss` → **Save**. Go back to Railway
> and it appears.

## 2. Build settings — nothing to do

Railway reads `railway.json` and uses the `Dockerfile`. No build command, no
start command, no environment variables. The Supabase URL and anon key are
already inside `index.html`.

If Railway offers to autodetect a builder (Nixpacks etc.), **decline** — the
Dockerfile is correct and `railway.json` already pins `builder: DOCKERFILE`.

## 3. Confirm auto-deploy is on

**Service → Settings → Source**

- Branch: **`main`**
- *Wait for CI*: **off** (there's no CI on this repo, and leaving it on means
  deploys never trigger)

That's the auto-deploy-on-push requirement. It's Railway's default, so this is
just a verification step.

## 4. Check the build before touching DNS

**Deployments** tab → wait for the build to go green.

Then **Settings → Networking → Generate Domain**. You get a free
`something.up.railway.app` URL. **Open it and confirm the store loads** — the
homepage should render with products and the announcement bar.

Don't move to step 5 until this works. Debugging DNS and a broken build at the
same time is miserable.

## 5. Add the custom domain

**Settings → Networking → Custom Domain** → enter `beadsncharmss.com`

Railway shows you a **CNAME target** that looks like `abc123.up.railway.app`.
Copy it — you need it for the next step.

## 6. DNS at your registrar

### ⚠️ The apex-domain problem — read this first

`beadsncharmss.com` is an **apex** (root) domain, and the DNS standard does not
allow a `CNAME` record at the apex. Many registrars will simply refuse the
record. Three ways out, best first:

**A. Your DNS provider supports `ALIAS` / `ANAME` / `CNAME flattening`**
(Cloudflare, Netlify DNS, DNSimple, Route 53 as `ALIAS`). Just create it:

| Type | Name | Value |
|---|---|---|
| ALIAS *(or ANAME / flattened CNAME)* | `@` | `abc123.up.railway.app` |
| CNAME | `www` | `abc123.up.railway.app` |

**B. Move DNS to Cloudflare (free, ~15 min).** Add the site, copy over your
existing records, switch the nameservers at your registrar, then add the CNAME
above with the **orange cloud ON** — Cloudflare flattens it at the apex
automatically.

> If you use Cloudflare with the proxy on, set **SSL/TLS → Overview → Full**.
> On *Flexible* you get an infinite redirect loop, because Railway already
> serves HTTPS.

**C. Use `www` as the real site.** Point `www` at Railway with a normal CNAME,
and set an apex → `www` redirect at your registrar (most offer "domain
forwarding"). Works everywhere, but `www` becomes the canonical URL — which
means updating `canonical`, `og:url` and `sitemap.xml` in the repo to match.

### After adding the record

Railway verifies and issues a TLS certificate automatically. Usually a few
minutes; DNS propagation can take up to a couple of hours.

## 7. Done

From here the workflow is just:

```bash
git add -A && git commit -m "…" && git push
```

Railway rebuilds and redeploys on its own. `index.html` is served `no-cache`,
so returning customers see changes immediately rather than a stale copy.

---

## Troubleshooting

**Build fails immediately** — check that Railway is using the Dockerfile, not
Nixpacks (Settings → Build).

**Deploy succeeds but the health check fails** — the app must listen on
`$PORT`. That's handled in `nginx.conf.template`; if you edited it, make sure
`listen ${PORT};` is intact.

**Site loads but products don't** — Supabase issue, not Railway. Open the
browser console; the store falls back to bundled demo products when the
database is unreachable, so a working-looking page can still mean a failed
fetch.

**Custom domain stuck on "waiting for DNS"** — verify with
`nslookup beadsncharmss.com`. If it returns your old host, the record didn't
save or hasn't propagated.
