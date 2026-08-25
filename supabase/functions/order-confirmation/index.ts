// ============================================================
//  Order confirmation email  —  Supabase Edge Function
//
//  Fired by a database webhook on INSERT into `orders`.
//  Sends the customer their confirmation and the owner an alert.
//
//  This replaces the wa.me link as the reliable notification path: that
//  link only opens WhatsApp in the *customer's* browser, so if they close
//  the tab the shop owner never learns about the order.
//
//  Secrets required (Supabase → Edge Functions → Secrets):
//    RESEND_API_KEY   from resend.com
//    FROM_EMAIL       e.g. "Beads N Charms <orders@beadsncharmss.com>"
//    OWNER_EMAIL      where owner alerts go
//  See supabase/EMAIL_SETUP.md
// ============================================================

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const FROM_EMAIL     = Deno.env.get('FROM_EMAIL')     ?? 'Beads N Charms <onboarding@resend.dev>';
const OWNER_EMAIL    = Deno.env.get('OWNER_EMAIL')    ?? '';
const SITE           = 'https://beadsncharmss.com';

const PURPLE = '#3D2467';
const MUTED  = '#4A3566';

interface OrderRow {
  id: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  address?: string;
  city?: string;
  province?: string;
  payment?: string;
  subtotal?: number;
  delivery?: number;
  discount_amount?: number;
  total?: number;
  notes?: string;
}

const pkr = (n: number | undefined) => 'PKR ' + Number(n ?? 0).toLocaleString('en-PK');

const escapeHtml = (v: unknown) =>
  String(v ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

function itemRows(items: Array<Record<string, unknown>>) {
  if (!items.length) {
    return `<tr><td colspan="2" style="padding:12px 0;color:${MUTED}">Your items are listed in your order confirmation on WhatsApp.</td></tr>`;
  }
  return items.map(i => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #EDE6DC;color:${MUTED};font-size:14px">
        ${escapeHtml(i.product_name)}${i.variant ? ` <span style="color:#8B7BAA">(${escapeHtml(i.variant)})</span>` : ''}
        <span style="color:#8B7BAA"> × ${escapeHtml(i.quantity)}</span>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #EDE6DC;text-align:right;color:#1A0E2E;font-size:14px;white-space:nowrap">
        ${pkr(Number(i.subtotal))}
      </td>
    </tr>`).join('');
}

function customerEmail(o: OrderRow, items: Array<Record<string, unknown>>) {
  const discount = Number(o.discount_amount ?? 0);
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#F7F3EE;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F3EE;padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #EDE6DC">

        <tr><td style="background:${PURPLE};padding:32px 32px 28px;text-align:center">
          <div style="color:#fff;font-size:24px;letter-spacing:.5px">Beads <em>n</em> Charms</div>
          <div style="color:#C4A8D8;font-size:12px;letter-spacing:2px;margin-top:6px">ORDER CONFIRMED</div>
        </td></tr>

        <tr><td style="padding:32px">
          <p style="margin:0 0 8px;font-size:18px;color:#1A0E2E">Thank you, ${escapeHtml((o.customer_name || '').split(' ')[0] || 'friend')}! 💜</p>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:${MUTED}">
            We've received your order and are getting it ready. You'll hear from us on WhatsApp
            once it's on its way.
          </p>

          <table role="presentation" width="100%" style="background:#F4EDFC;border-radius:10px;padding:14px 18px;margin-bottom:24px">
            <tr><td style="font-size:12px;color:${MUTED}">Order number</td></tr>
            <tr><td style="font-size:17px;font-weight:700;color:${PURPLE};font-family:monospace">${escapeHtml(o.id)}</td></tr>
          </table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${itemRows(items)}
            <tr><td style="padding:12px 0 4px;color:${MUTED};font-size:14px">Subtotal</td>
                <td style="padding:12px 0 4px;text-align:right;color:${MUTED};font-size:14px">${pkr(o.subtotal)}</td></tr>
            ${discount > 0 ? `<tr><td style="padding:4px 0;color:#2D7D52;font-size:14px">Discount</td>
                <td style="padding:4px 0;text-align:right;color:#2D7D52;font-size:14px">−${pkr(discount)}</td></tr>` : ''}
            <tr><td style="padding:4px 0;color:${MUTED};font-size:14px">Delivery</td>
                <td style="padding:4px 0;text-align:right;color:${MUTED};font-size:14px">${Number(o.delivery ?? 0) === 0 ? '<span style="color:#2D7D52">FREE</span>' : pkr(o.delivery)}</td></tr>
            <tr><td style="padding:14px 0 0;border-top:2px solid ${PURPLE};font-size:16px;font-weight:700;color:#1A0E2E">Total</td>
                <td style="padding:14px 0 0;border-top:2px solid ${PURPLE};text-align:right;font-size:16px;font-weight:700;color:#1A0E2E">${pkr(o.total)}</td></tr>
          </table>

          <table role="presentation" width="100%" style="margin-top:28px;background:#F7F3EE;border-radius:10px;padding:18px">
            <tr><td style="font-size:12px;letter-spacing:1px;color:#8B7BAA;padding-bottom:8px">DELIVERING TO</td></tr>
            <tr><td style="font-size:14px;line-height:1.6;color:${MUTED}">
              ${escapeHtml(o.customer_name)}<br>
              ${escapeHtml(o.address)}<br>
              ${escapeHtml(o.city)}${o.province ? ', ' + escapeHtml(o.province) : ''}<br>
              ${escapeHtml(o.customer_phone)}
            </td></tr>
            <tr><td style="font-size:13px;color:${MUTED};padding-top:12px">
              Payment: <strong>${o.payment === 'cod' ? 'Cash on Delivery' : escapeHtml(o.payment)}</strong>
            </td></tr>
          </table>

          <div style="text-align:center;margin-top:28px">
            <a href="${SITE}/track-order" style="display:inline-block;background:${PURPLE};color:#fff;text-decoration:none;padding:13px 30px;border-radius:50px;font-size:14px">Track Your Order</a>
          </div>

          <p style="margin:26px 0 0;font-size:13px;line-height:1.7;color:#8B7BAA;text-align:center">
            Questions? WhatsApp us on <strong>+92 320 5586296</strong><br>
            or reply to this email.
          </p>
        </td></tr>

        <tr><td style="background:#1A0E2E;padding:22px 32px;text-align:center">
          <p style="margin:0;color:rgba(255,255,255,.5);font-size:12px">
            Handmade with 💜 in Pakistan &nbsp;·&nbsp;
            <a href="${SITE}/returns-policy" style="color:#C4A8D8;text-decoration:none">Returns</a> &nbsp;·&nbsp;
            <a href="${SITE}/shipping" style="color:#C4A8D8;text-decoration:none">Shipping</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function ownerEmail(o: OrderRow, items: Array<Record<string, unknown>>) {
  const lines = items.map(i =>
    `<li>${escapeHtml(i.product_name)}${i.variant ? ' (' + escapeHtml(i.variant) + ')' : ''} × ${escapeHtml(i.quantity)} — ${pkr(Number(i.subtotal))}</li>`
  ).join('') || '<li>(no line items recorded)</li>';

  return `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#F7F3EE;padding:24px">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;border:1px solid #EDE6DC">
      <h2 style="margin:0 0 4px;color:${PURPLE}">🛍️ New order — ${pkr(o.total)}</h2>
      <p style="margin:0 0 20px;font-family:monospace;color:#8B7BAA">${escapeHtml(o.id)}</p>
      <ul style="color:${MUTED};line-height:1.8">${lines}</ul>
      <table style="width:100%;margin-top:18px;font-size:14px;color:${MUTED}">
        <tr><td style="padding:4px 0"><strong>Customer</strong></td><td>${escapeHtml(o.customer_name)}</td></tr>
        <tr><td style="padding:4px 0"><strong>Phone</strong></td><td><a href="https://wa.me/${String(o.customer_phone ?? '').replace(/[^0-9]/g, '')}">${escapeHtml(o.customer_phone)}</a></td></tr>
        <tr><td style="padding:4px 0"><strong>Email</strong></td><td>${escapeHtml(o.customer_email)}</td></tr>
        <tr><td style="padding:4px 0;vertical-align:top"><strong>Address</strong></td><td>${escapeHtml(o.address)}, ${escapeHtml(o.city)}${o.province ? ', ' + escapeHtml(o.province) : ''}</td></tr>
        <tr><td style="padding:4px 0"><strong>Payment</strong></td><td>${escapeHtml(o.payment)}</td></tr>
        ${o.notes ? `<tr><td style="padding:4px 0;vertical-align:top"><strong>Notes</strong></td><td>${escapeHtml(o.notes)}</td></tr>` : ''}
      </table>
    </div></body></html>`;
}

async function send(to: string, subject: string, html: string, replyTo?: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html, ...(replyTo ? { reply_to: replyTo } : {}) })
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
  return await res.json();
}

Deno.serve(async (req: Request) => {
  try {
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not set' }), { status: 500 });
    }

    const payload = await req.json();
    // Supabase database webhooks send { type, table, record, old_record }.
    const order: OrderRow = payload.record ?? payload;
    if (!order?.id) {
      return new Response(JSON.stringify({ error: 'no order in payload' }), { status: 400 });
    }

    // Line items are inserted just after the order, so allow a brief moment.
    await new Promise(r => setTimeout(r, 1200));

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const itemsRes = await fetch(
      `${supabaseUrl}/rest/v1/order_items?select=product_name,variant,quantity,subtotal&order_id=eq.${encodeURIComponent(order.id)}`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
    );
    const items = itemsRes.ok ? await itemsRes.json() : [];

    const results: Record<string, string> = {};

    if (order.customer_email) {
      try {
        await send(order.customer_email, `Order confirmed — ${order.id} · Beads N Charms`, customerEmail(order, items));
        results.customer = 'sent';
      } catch (e) { results.customer = `failed: ${e.message}`; }
    }

    if (OWNER_EMAIL) {
      try {
        await send(OWNER_EMAIL, `🛍️ New order ${pkr(order.total)} — ${order.id}`, ownerEmail(order, items), order.customer_email);
        results.owner = 'sent';
      } catch (e) { results.owner = `failed: ${e.message}`; }
    }

    return new Response(JSON.stringify({ ok: true, order: order.id, ...results }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    console.error('order-confirmation error:', e);
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), { status: 500 });
  }
});
