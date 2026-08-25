// ============================================================
//  BEADS N CHARMS — Config & Supabase API Layer
// ============================================================

const CONFIG = {
  SUPABASE_URL: 'https://kjwhxuqbrcerqfuikcmv.supabase.co',
  SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtqd2h4dXFicmNlcnFmdWlrY212Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczNzk4MDMsImV4cCI6MjEwMjk1NTgwM30.-mut3hDxggkRghXcYM3Zl6FpDBnij9piumcfJfjup2M',
  WHATSAPP_NUMBER: '923205586296',  // your WhatsApp (no + or spaces)
  DELIVERY_FEE: 300,
  FREE_DELIVERY_THRESHOLD: 2000,
  LOW_STOCK_THRESHOLD: 5,
  SITE_URL: 'https://beadsncharmss.com',
  CURRENCY: 'PKR',
};
// NOTE: there is deliberately no ADMIN_PASSWORD here. Admin access goes
// through Supabase Auth (see Auth below) so the credential never ships in
// the source, and RLS can tell the shop owner apart from the public.


// ── HTML escaping ─────────────────────────────────────────────
// Everything customer-supplied passes through this before touching
// innerHTML. Reviews and orders are attacker-controlled and render inside
// the admin panel, where the Supabase session token lives.
const ESC_MAP = { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' };
function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, c => ESC_MAP[c]); }

// ── Admin auth ────────────────────────────────────────────────
// Signs in against Supabase Auth and keeps the session token. Admin requests
// send that token instead of the anon key, which is what the "TO authenticated"
// policies in supabase.sql key off. The password is never stored anywhere.
const Auth = {
  KEY: 'bnc_admin_session',
  _session: null,

  load() {
    if (this._session) return this._session;
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      // expires_at is unix seconds; drop the session once it lapses.
      if (s.expires_at && s.expires_at * 1000 <= Date.now()) { this.clear(); return null; }
      this._session = s;
      return s;
    } catch { this.clear(); return null; }
  },

  token()    { return this.load()?.access_token || null; },
  isAuthed() { return !!this.token(); },
  email()    { return this.load()?.user?.email || ''; },

  async signIn(email, password) {
    const res = await fetch(CONFIG.SUPABASE_URL + '/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: { 'apikey': CONFIG.SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      if (res.status === 400 || res.status === 401) throw new Error('Incorrect email or password.');
      throw new Error('Sign-in failed (' + res.status + '). Check your connection.');
    }
    const s = await res.json();
    this._session = s;
    try { localStorage.setItem(this.KEY, JSON.stringify(s)); } catch {}
    return s;
  },

  async signOut() {
    const t = this.token();
    if (t) {
      fetch(CONFIG.SUPABASE_URL + '/auth/v1/logout', {
        method: 'POST',
        headers: { 'apikey': CONFIG.SUPABASE_KEY, 'Authorization': 'Bearer ' + t }
      }).catch(() => {});
    }
    this.clear();
  },

  clear() {
    this._session = null;
    try { localStorage.removeItem(this.KEY); } catch {}
  }
};

// ── Raw fetch wrapper ─────────────────────────────────────────
async function sbFetch(path, opts = {}) {
  const url = CONFIG.SUPABASE_URL + '/rest/v1/' + path;
  // Storefront writes pass opts.anon so they always run as the anon role.
  // Without it, a shop owner who happens to be signed into the admin panel
  // checks out as `authenticated` and hits a different set of RLS policies
  // than a real customer — so the owner's own testing does not reflect what
  // customers experience, in either direction.
  const auth = opts.anon ? CONFIG.SUPABASE_KEY : (Auth.token() || CONFIG.SUPABASE_KEY);
  const headers = {
    'apikey': CONFIG.SUPABASE_KEY,
    'Authorization': 'Bearer ' + auth,
    'Content-Type': 'application/json',
    'Prefer': opts.prefer !== undefined ? opts.prefer : 'return=representation'
  };
  const res = await fetch(url, {
    method: opts.method || 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error('Supabase ' + res.status + ': ' + txt);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

// ── Storage upload ────────────────────────────────────────────
async function sbUpload(file, path) {
  const url = CONFIG.SUPABASE_URL + '/storage/v1/object/product-images/' + path;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': CONFIG.SUPABASE_KEY,
      // Storage writes are authenticated-only, so this must be the admin token.
      'Authorization': 'Bearer ' + (Auth.token() || CONFIG.SUPABASE_KEY),
      'x-upsert': 'true',
      'Content-Type': file.type
    },
    body: file
  });
  if (!res.ok) throw new Error('Upload failed: ' + res.status);
  return CONFIG.SUPABASE_URL + '/storage/v1/object/public/product-images/' + path;
}

// ── DB Status indicator ───────────────────────────────────────
function dbStatus(msg, type = 'ok') {
  let el = document.getElementById('dbStatusBar');
  if (!el) {
    el = document.createElement('div');
    el.id = 'dbStatusBar';
    el.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;padding:10px 18px;border-radius:50px;font-size:12px;font-weight:600;display:flex;align-items:center;gap:8px;box-shadow:0 4px 20px rgba(0,0,0,.15);transition:all .3s;opacity:0;font-family:Inter,sans-serif';
    document.body.appendChild(el);
  }
  const styles = {
    ok:     'background:#2D7D52;color:#fff',
    err:    'background:#C0392B;color:#fff',
    info:   'background:#3D2467;color:#fff',
    saving: 'background:#6B4E9B;color:#fff'
  };
  el.setAttribute('style', el.style.cssText + ';' + (styles[type] || styles.info));
  const icon = type === 'saving' ? '<span style="display:inline-block;width:10px;height:10px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:dbspin .7s linear infinite"></span>' : type === 'ok' ? '✓' : type === 'err' ? '✕' : '●';
  el.innerHTML = icon + ' ' + msg;
  el.style.opacity = '1';
  el.style.transform = 'translateY(0)';
  if (type !== 'saving') setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateY(8px)'; }, 3000);
}

// ============================================================
//  SUPABASE DATA LAYER
// ============================================================

const DB = {

  // ── Catalog ──────────────────────────────────────────────
  async loadCatalog() {
    dbStatus('Loading…', 'saving');
    try {
      const [cats, prods] = await Promise.all([
        sbFetch('categories?order=sort_order&active=eq.true'),
        sbFetch('products?order=created_at&active=eq.true')
      ]);
      if (cats?.length)  localStorage.setItem('bnc_cats',  JSON.stringify(cats));
      if (prods?.length) localStorage.setItem('bnc_prods', JSON.stringify(prods));
      dbStatus('Ready', 'ok');
      return true;
    } catch (e) {
      console.warn('Using local data:', e.message);
      dbStatus('Offline mode', 'info');
      return false;
    }
  },

  getCats()  { return JSON.parse(localStorage.getItem('bnc_cats')  || 'null') || DEFAULT_CATS; },
  getProds() { return JSON.parse(localStorage.getItem('bnc_prods') || 'null') || DEFAULT_PRODS; },
  getProd(id){ return this.getProds().find(p => p.id === id); },
  getCat(id) { return this.getCats().find(c => c.id === id); },

  // ── Discount codes ───────────────────────────────────────
  async validateDiscount(code, subtotal) {
    try {
      const rows = await sbFetch(`discount_codes?code=eq.${code.toUpperCase()}&active=eq.true`);
      if (!rows?.length) return { valid: false, msg: 'Invalid discount code' };
      const d = rows[0];
      if (d.expires_at && new Date(d.expires_at) < new Date()) return { valid: false, msg: 'Code has expired' };
      if (d.max_uses && d.used_count >= d.max_uses) return { valid: false, msg: 'Code has reached its limit' };
      if (subtotal < d.min_order) return { valid: false, msg: `Minimum order PKR ${d.min_order.toLocaleString()} required` };
      let discount = 0;
      if (d.type === 'percent')       discount = Math.round(subtotal * d.value / 100);
      else if (d.type === 'fixed')    discount = d.value;
      else if (d.type === 'free_delivery') discount = CONFIG.DELIVERY_FEE;
      return { valid: true, discount, type: d.type, value: d.value, msg: `${d.type === 'percent' ? d.value + '% off' : d.type === 'fixed' ? 'PKR ' + d.value + ' off' : 'Free delivery'} applied!` };
    } catch(e) { return { valid: false, msg: 'Could not validate code' }; }
  },

  async useDiscount(code) {
    try { await sbFetch(`discount_codes?code=eq.${code}`, { method: 'PATCH', body: { used_count: 999 } }); }
    catch(e) { console.warn('Could not increment discount usage'); }
  },

  // ── Orders ───────────────────────────────────────────────
  async saveOrder(data) {
    dbStatus('Placing order…', 'saving');
    try {
      const now = new Date().toISOString();

      // Customer directory and mailing list are bookkeeping, not the sale.
      // These ran first and un-caught, so a permissions problem on either one
      // aborted the whole order. Never let them cost a sale: log and continue.
      // The order row carries name, phone and address in its own right.
      try {
        await sbFetch('customers?on_conflict=email', {
          method: 'POST', anon: true, prefer: 'resolution=merge-duplicates,return=minimal',
          body: { email: data.email, name: data.name, phone: data.phone, city: data.city, updated_at: now }
        });
      } catch (e) { console.warn('customer record not saved (non-fatal):', e.message); }

      try {
        await sbFetch('email_subscribers?on_conflict=email', {
          method: 'POST', anon: true, prefer: 'resolution=merge-duplicates,return=minimal',
          body: { email: data.email, name: data.name, source: 'checkout' }
        });
      } catch (e) { console.warn('subscriber not saved (non-fatal):', e.message); }

      // Insert order — this is the critical path and must still throw on failure.
      const orderId = 'ORD-' + Date.now();
      await sbFetch('orders', {
        method: 'POST', anon: true,
        body: {
          id: orderId,
          customer_name: data.name, customer_email: data.email, customer_phone: data.phone,
          address: data.address, city: data.city, province: data.province || '',
          notes: data.notes || '', payment: data.payment,
          discount_code: data.discountCode || null,
          discount_amount: data.discountAmount || 0,
          subtotal: data.subtotal, delivery: data.delivery, total: data.total,
          status: 'pending', created_at: now, updated_at: now
        }
      });
      // Past this point the sale is recorded. Everything below is a side
      // effect, so it must not be able to turn a saved order into a reported
      // failure — that would make the customer order again and duplicate it.
      if (data.items?.length) {
        try {
          await sbFetch('order_items', {
            method: 'POST', anon: true, prefer: 'return=minimal',
            body: data.items.map(i => ({
              order_id: orderId, product_id: i.id,
              product_name: i.name, variant: i.variant || null,
              price: i.price, quantity: i.qty, subtotal: i.price * i.qty
            }))
          });
        } catch (e) { console.error('order_items failed for ' + orderId + ':', e.message); }
      }

      // Stock is decremented by a database trigger on order_items, not here —
      // the public role has no UPDATE grant on products (deliberately), so a
      // client-side PATCH silently affected zero rows and stock never moved.

      if (data.discountCode) {
        try { await this.useDiscount(data.discountCode); }
        catch (e) { console.warn('discount usage not recorded:', e.message); }
      }

      try { this.notifyOwnerWhatsApp(orderId, data); }
      catch (e) { console.warn('WhatsApp notify failed:', e.message); }

      dbStatus('Order placed ✓', 'ok');
      return orderId;
    } catch(e) {
      console.error('Order error:', e);
      dbStatus('Order failed', 'err');
      // Never fabricate an order id. Returning one here made a failed save
      // look identical to a successful one: the customer saw "Order Placed"
      // with a real-looking number for an order that was never stored, and
      // their cart was emptied. The caller must surface this.
      throw e;
    }
  },

  notifyOwnerWhatsApp(orderId, data) {
    const items = data.items.map(i => `• ${i.name}${i.variant ? ' ('+i.variant+')' : ''} × ${i.qty} = PKR ${(i.price*i.qty).toLocaleString()}`).join('\n');
    const msg = `🛍️ *NEW ORDER — Beads N Charms*\n\n` +
      `Order ID: ${orderId}\n` +
      `Customer: ${data.name}\n` +
      `Phone: ${data.phone}\n` +
      `Email: ${data.email}\n` +
      `City: ${data.city}\n` +
      `Address: ${data.address}\n\n` +
      `*Items:*\n${items}\n\n` +
      `Payment: ${data.payment.toUpperCase()}\n` +
      `${data.discountCode ? 'Discount: ' + data.discountCode + ' (-PKR ' + data.discountAmount + ')\n' : ''}` +
      `Delivery: PKR ${data.delivery}\n` +
      `*Total: PKR ${data.total.toLocaleString()}*`;
    const url = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    // Open in new tab — owner gets instant WA notification
    window.open(url, '_blank');
  },

  // ── Abandoned cart ───────────────────────────────────────
  async saveAbandonedCart(email, phone, cartItems) {
    try {
      await sbFetch('abandoned_carts', {
        method: 'POST', anon: true,
        body: { email: email||null, phone: phone||null, cart_data: cartItems, created_at: new Date().toISOString() }
      });
    } catch(e) { console.warn('Abandoned cart save failed:', e.message); }
  },

  // ── Reviews ──────────────────────────────────────────────
  async submitReview(productId, name, rating, comment) {
    try {
      await sbFetch('reviews', {
        method: 'POST',
        body: { product_id: productId, customer_name: name, rating, comment, approved: false, created_at: new Date().toISOString() }
      });
      return true;
    } catch(e) { return false; }
  },

  async getReviews(productId) {
    try { return await sbFetch(`reviews?product_id=eq.${productId}&approved=eq.true&order=created_at.desc`); }
    catch(e) { return []; }
  },

  // ── Analytics ────────────────────────────────────────────
  async track(event, data = {}) {
    try {
      await sbFetch('analytics', {
        method: 'POST', anon: true,
        body: { event, product_id: data.product_id||null, order_id: data.order_id||null, metadata: data, created_at: new Date().toISOString() }
      });
    } catch(e) { /* silent */ }
  },

  // ── Contact ──────────────────────────────────────────────
  async saveContact(data) {
    try { await sbFetch('contact_messages', { method: 'POST', anon: true, body: { ...data, created_at: new Date().toISOString() } }); }
    catch(e) { console.warn('Contact save failed:', e.message); }
  },

  // ── Newsletter ───────────────────────────────────────────
  async subscribe(email, name = '') {
    try {
      await sbFetch('email_subscribers?on_conflict=email', {
        method: 'POST', anon: true, prefer: 'resolution=merge-duplicates',
        body: { email, name, source: 'newsletter' }
      });
      return true;
    } catch(e) { return false; }
  },

  // ── Admin: Products ──────────────────────────────────────
  async saveProd(data, editId = null) {
    dbStatus('Saving…', 'saving');
    const now = new Date().toISOString();
    const row = {
      name: data.name, category_id: data.cat, price: data.price,
      on_sale: data.onSale, sale_percent: data.salePct || 0,
      description: data.desc, tags: data.tags,
      emoji: data.emoji, color: data.color,
      image_url: data.imageUrl || null,
      images: data.images || [],
      has_variants: data.hasVariants || false,
      variants: data.variants || [],
      in_stock: data.inStock, stock_qty: data.stockQty || 999,
      featured: data.featured, updated_at: now
    };
    try {
      if (editId) {
        await sbFetch(`products?id=eq.${editId}`, { method: 'PATCH', body: row });
      } else {
        row.id = 'p' + Date.now();
        row.created_at = now;
        await sbFetch('products', { method: 'POST', body: row });
      }
      dbStatus('Saved ✓', 'ok');
      await this.loadCatalog();
      return true;
    } catch(e) { dbStatus('Save failed', 'err'); console.error(e); return false; }
  },

  async deleteProd(id) {
    try { await sbFetch(`products?id=eq.${id}`, { method: 'PATCH', prefer: '', body: { active: false } }); await this.loadCatalog(); return true; }
    catch(e) { return false; }
  },

  async saveCat(data, editId = null) {
    const row = { name: data.name, emoji: data.emoji, description: data.desc };
    try {
      if (editId) { await sbFetch(`categories?id=eq.${editId}`, { method: 'PATCH', body: row }); }
      else { row.id = data.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(); row.sort_order = 99; row.created_at = new Date().toISOString(); await sbFetch('categories', { method: 'POST', body: row }); }
      await this.loadCatalog();
    } catch(e) { console.error('saveCat error:', e); }
  },

  async deleteCat(id) {
    try { await sbFetch(`categories?id=eq.${id}`, { method: 'PATCH', prefer: '', body: { active: false } }); await this.loadCatalog(); }
    catch(e) { console.error(e); }
  },

  // ── Admin: Orders & Subscribers ─────────────────────────
  async getOrders(limit = 200) {
    try { return await sbFetch(`orders?order=created_at.desc&limit=${limit}`); }
    catch(e) { return []; }
  },

  async updateOrderStatus(id, status, tracking = null) {
    const body = { status, updated_at: new Date().toISOString() };
    if (tracking) body.tracking_number = tracking;
    try { await sbFetch(`orders?id=eq.${id}`, { method: 'PATCH', body }); }
    catch(e) { console.error(e); }
  },

  async getSubscribers() {
    try { return await sbFetch('email_subscribers?order=created_at.desc'); }
    catch(e) { return []; }
  },

  async getAnalytics() {
    try {
      const [orders, events] = await Promise.all([
        sbFetch('orders?select=total,status,created_at&order=created_at.desc&limit=1000'),
        sbFetch('analytics?select=event,product_id,created_at&order=created_at.desc&limit=1000')
      ]);
      return { orders: orders||[], events: events||[] };
    } catch(e) { return { orders:[], events:[] }; }
  },

  async getReviews_admin() {
    try { return await sbFetch('reviews?order=created_at.desc'); }
    catch(e) { return []; }
  },

  async approveReview(id, approved) {
    try { await sbFetch(`reviews?id=eq.${id}`, { method: 'PATCH', body: { approved } }); }
    catch(e) { console.error(e); }
  },

  // ── Admin: Discounts ─────────────────────────────────────
  async getDiscounts() {
    try { return await sbFetch('discount_codes?order=created_at.desc'); }
    catch(e) { return []; }
  },

  async saveDiscount(data, editId = null) {
    const row = { code: data.code.toUpperCase(), type: data.type, value: parseInt(data.value)||0, min_order: parseInt(data.minOrder)||0, max_uses: data.maxUses?parseInt(data.maxUses):null, active: data.active !== false, expires_at: data.expiresAt||null };
    try {
      if (editId) await sbFetch(`discount_codes?id=eq.${editId}`, { method: 'PATCH', body: row });
      else { row.created_at = new Date().toISOString(); await sbFetch('discount_codes', { method: 'POST', body: row }); }
      return true;
    } catch(e) { console.error(e); return false; }
  },

  async deleteDiscount(id) {
    try { await sbFetch(`discount_codes?id=eq.${id}`, { method: 'PATCH', prefer: '', body: { active: false } }); }
    catch(e) { console.error(e); }
  },

  // ── Admin: Bulk sale ─────────────────────────────────────
  async applyBulkSale(pct) {
    const now = new Date().toISOString();
    const prods = this.getProds().filter(p => p.in_stock);
    await Promise.all(prods.map(p =>
      sbFetch(`products?id=eq.${p.id}`, { method: 'PATCH', body: { on_sale: true, sale_percent: pct, updated_at: now } }).catch(() => {})
    ));
    await this.loadCatalog();
  },

  async clearAllSales() {
    const now = new Date().toISOString();
    const prods = this.getProds();
    await Promise.all(prods.map(p =>
      sbFetch(`products?id=eq.${p.id}`, { method: 'PATCH', body: { on_sale: false, sale_percent: 0, updated_at: now } }).catch(() => {})
    ));
    await this.loadCatalog();
  }
};

// ============================================================
//  CART — localStorage
// ============================================================
const Cart = {
  get() { return JSON.parse(localStorage.getItem('bnc_cart') || '[]'); },
  save(items) { localStorage.setItem('bnc_cart', JSON.stringify(items)); refreshCartUI(); },

  add(id, variant = null) {
    const items = this.get();
    const key = id + (variant ? '::' + variant : '');
    const ex = items.find(i => i.key === key);
    if (ex) { ex.qty++; }
    else {
      const p = DB.getProd(id);
      if (!p) return;
      items.push({ key, id, qty: 1, variant, name: p.name, emoji: p.emoji, color: p.color });
    }
    this.save(items);
    DB.track('add_to_cart', { product_id: id });
  },

  remove(key)         { this.save(this.get().filter(i => i.key !== key)); },
  setQty(key, qty)    { if (qty < 1) { this.remove(key); return; } this.save(this.get().map(i => i.key === key ? { ...i, qty } : i)); },
  clear()             { this.save([]); },

  salePrice(p) {
    return p.on_sale && p.sale_percent > 0 ? Math.round(p.price * (1 - p.sale_percent / 100)) : p.price;
  },

  total() {
    return this.get().reduce((s, i) => {
      const p = DB.getProd(i.id);
      return p ? s + this.salePrice(p) * i.qty : s;
    }, 0);
  },

  count() { return this.get().reduce((s, i) => s + i.qty, 0); }
};

// ============================================================
//  DEFAULT FALLBACK DATA
// ============================================================
const DEFAULT_CATS = [
  { id:'charms',     name:'Charms',               emoji:'✨', description:'Bracelet, necklace & earring bases' },
  { id:'bracelets',  name:'Bracelets',             emoji:'📿', description:'Beaded & charm bracelets' },
  { id:'necklaces',  name:'Necklaces',             emoji:'💫', description:'Layered & pendant necklaces' },
  { id:'earrings',   name:'Earrings',              emoji:'🌸', description:'Studs, hoops & drops' },
  { id:'charms-phone',name:'Phone Charms',         emoji:'📱', description:'Cute phone & bag charms' },
  { id:'keychains',  name:'Keychains',             emoji:'🔑', description:'Personalised keychains' },
  { id:'permanent',  name:'Permanent Jewellery',   emoji:'💜', description:'Welded-on forever pieces' },
];

const COLORS = [
  'linear-gradient(135deg,#F4EDFC,#E8D5F5)',
  'linear-gradient(135deg,#C4A8D8,#9B7BB8)',
  'linear-gradient(135deg,#E8D5F5,#C4A8D8)',
  'linear-gradient(135deg,#F7F3EE,#EDE6DC)',
  'linear-gradient(135deg,#9B7BB8,#6B4E9B)',
  'linear-gradient(135deg,#EDE6DC,#E8D5F5)',
  'linear-gradient(135deg,#F9E4EA,#E8D5F5)',
  'linear-gradient(135deg,#3D2467,#6B4E9B)',
];

const DEFAULT_PRODS = [
  { id:'p1', name:'Pearl Beaded Bracelet',    category_id:'bracelets',   price:850,  on_sale:false, sale_percent:0,  description:'Delicate freshwater pearl bracelet with gold-filled clasp.', tags:['pearl','bracelet'], emoji:'📿', color:COLORS[0], in_stock:true, stock_qty:25, featured:true,  has_variants:false, variants:[], images:[] },
  { id:'p2', name:'Moon & Star Charm Set',    category_id:'charms-phone',price:650,  on_sale:true,  sale_percent:30, description:'Set of 3 celestial phone charms.', tags:['moon','star'], emoji:'🌙', color:COLORS[1], in_stock:true, stock_qty:15, featured:true,  has_variants:false, variants:[], images:[] },
  { id:'p4', name:'Permanent Gold Bracelet',  category_id:'permanent',   price:2500, on_sale:false, sale_percent:0,  description:'Signature permanent bracelet welded onto your wrist.', tags:['permanent','gold'], emoji:'✨', color:COLORS[3], in_stock:true, stock_qty:10, featured:true,  has_variants:false, variants:[], images:[] },
  { id:'p5', name:'Butterfly Keychain',       category_id:'keychains',   price:450,  on_sale:true,  sale_percent:22, description:'Beaded butterfly keychain in purple tones.', tags:['butterfly','keychain'], emoji:'🦋', color:COLORS[4], in_stock:true, stock_qty:20, featured:true,  has_variants:false, variants:[], images:[] },
  { id:'p6', name:'Crystal Drop Earrings',    category_id:'earrings',    price:700,  on_sale:false, sale_percent:0,  description:'Amethyst-toned crystal drop earrings.', tags:['earrings','crystal'], emoji:'💎', color:COLORS[5], in_stock:true, stock_qty:18, featured:true,  has_variants:false, variants:[], images:[] },
  { id:'p7', name:'Layered Chain Necklace',   category_id:'necklaces',   price:1200, on_sale:true,  sale_percent:21, description:'Three-layer gold-filled chain necklace.', tags:['necklace','layered'], emoji:'📿', color:COLORS[0], in_stock:true, stock_qty:12, featured:false, has_variants:false, variants:[], images:[] },
  { id:'p8', name:'Beaded Friendship Bracelet',category_id:'bracelets',  price:650,  on_sale:true,  sale_percent:23, description:'Colourful seed bead bracelet in purple tones.', tags:['bracelet','friendship'], emoji:'🌈', color:COLORS[5], in_stock:true, stock_qty:22, featured:false, has_variants:false, variants:[], images:[] },
];

// ── Helpers ───────────────────────────────────────────────────
function salePrice(p) {
  return p.on_sale && p.sale_percent > 0 ? Math.round(p.price * (1 - p.sale_percent / 100)) : p.price;
}

function catName(id) {
  const c = DB.getCat(id);
  return c ? c.name : id;
}

function formatPKR(n) {
  return 'PKR ' + (n || 0).toLocaleString();
}
