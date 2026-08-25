# Order confirmation emails — setup

One-time. ~15 minutes. Sends the customer a confirmation and you an alert,
every time an order is inserted — regardless of what the customer's browser does.

This replaces the `wa.me` link as your reliable notification path. That link
only opens WhatsApp in the *customer's* browser; if they close the tab, you
never find out about the order.

---

## 1. Resend account (free)

1. Sign up at [resend.com](https://resend.com) — free tier is 3,000 emails/month.
2. **API Keys → Create API Key**, copy it.
3. **Domains → Add Domain → `beadsncharmss.com`**, add the DNS records it shows
   to Cloudflare. Takes a few minutes to verify.

> Skip the domain step to test: leave `FROM_EMAIL` as `onboarding@resend.dev`.
> That only delivers to **your own** Resend signup address, so it is fine for
> testing but not for customers.

## 2. Deploy the function

**Dashboard** — Supabase → **Edge Functions → Deploy a new function** →
name it `order-confirmation` → paste the contents of
`supabase/functions/order-confirmation/index.ts`.

**Or CLI:**

```bash
npx supabase login
npx supabase link --project-ref kjwhxuqbrcerqfuikcmv
npx supabase functions deploy order-confirmation
```

## 3. Secrets

Supabase → **Edge Functions → Secrets** (or Project Settings → Edge Functions):

| Name | Value |
|---|---|
| `RESEND_API_KEY` | the key from step 1 |
| `FROM_EMAIL` | `Beads N Charms <orders@beadsncharmss.com>` (or `onboarding@resend.dev` to test) |
| `OWNER_EMAIL` | where you want new-order alerts |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically —
do not add them yourself, and never put the service role key in the website repo.

## 4. Fire it on every order

Supabase → **Database → Webhooks → Create a new hook**:

- **Name:** `order_confirmation`
- **Table:** `orders`
- **Events:** ✅ Insert only
- **Type:** Supabase Edge Function
- **Function:** `order-confirmation`

## 5. Test

Place a dummy order. Within a few seconds you should get the owner alert and
the customer confirmation.

If nothing arrives: Supabase → Edge Functions → `order-confirmation` → **Logs**.
The function returns `{ ok: true, customer: "sent", owner: "sent" }` on success,
and reports the exact Resend error otherwise.

---

## Notes

- The function waits ~1.2s before reading `order_items`, because the line items
  are inserted just after the order row. If items are ever missing from an
  email, increase that delay.
- Email failures never affect the order. The order is already committed before
  the webhook fires.
- Once this is running, `notifyOwnerWhatsApp()` in `js/config.js` becomes a
  convenience rather than your actual notification channel.
