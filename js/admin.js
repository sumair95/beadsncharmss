// ============================================================
//  BEADS N CHARMS — Admin Panel
//  Full Shopify-equivalent management dashboard
// ============================================================

let _adminSection  = 'dashboard';
let _pfmEmoji      = '📿';
let _pfmColor      = COLORS[0];
let _cfmEmoji      = '📿';

const EMOJIS = ['📿','💍','✨','💜','🌸','📱','🔑','🦋','🌙','⭐','💎','🍓','🌈','💫','🎀','🌺','💐','🧿','🪬','🫧'];

// ── Router ────────────────────────────────────────────────────
function renderAdmin() {
  return Auth.isAuthed() ? renderAdminPanel() : renderAdminLogin();
}

function renderAdminLogin() {
  return `<div class="admin-login-wrap">
    <div class="admin-login-card">
      <div style="font-size:2.5rem;margin-bottom:16px">💜</div>
      <div class="logo-big">Beads <em>n</em> Charms</div>
      <div class="logo-sub">STORE ADMIN</div>
      <div class="form-field">
        <label class="form-label">Email</label>
        <input class="form-input" id="adminEmail" type="email" autocomplete="username" placeholder="you@example.com" onkeydown="if(event.key==='Enter')document.getElementById('adminPw').focus()">
      </div>
      <div class="form-field">
        <label class="form-label">Password</label>
        <input class="form-input" id="adminPw" type="password" autocomplete="current-password" placeholder="Enter password" onkeydown="if(event.key==='Enter')doAdminLogin()">
      </div>
      <p id="adminErr" style="color:var(--sale);font-size:13px;margin-bottom:14px;display:none"></p>
      <button class="btn-fill" id="adminSignInBtn" onclick="doAdminLogin()" style="width:100%;border-radius:50px;padding:14px;font-size:13px;font-weight:600">Sign In →</button>
      <button class="btn-ghost" onclick="renderPage('home')" style="width:100%;margin-top:10px;font-size:12px">← Back to Store</button>
    </div>
  </div>`;
}

async function doAdminLogin() {
  const email = document.getElementById('adminEmail')?.value.trim();
  const pw    = document.getElementById('adminPw')?.value || '';
  const err   = document.getElementById('adminErr');
  const btn   = document.getElementById('adminSignInBtn');
  const fail  = msg => { if (err) { err.textContent = msg; err.style.display = 'block'; } };

  if (!email || !pw) { fail('Enter your email and password.'); return; }
  if (err) err.style.display = 'none';
  if (btn) { btn.disabled = true; btn.textContent = 'Signing in…'; }

  try {
    await Auth.signIn(email, pw);
    renderPage('admin');
  } catch (e) {
    fail(e.message || 'Sign-in failed.');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Sign In →'; }
  }
}

async function doAdminLogout() {
  await Auth.signOut();
  renderPage('admin');
}

function renderAdminPanel() {
  const navItems = [
    { id:'dashboard',   icon:'📊', label:'Dashboard' },
    { id:'products',    icon:'💍', label:'Products' },
    { id:'categories',  icon:'📂', label:'Categories' },
    { id:'sales',       icon:'🏷️', label:'Sale Manager' },
    { id:'discounts',   icon:'🎟️', label:'Discount Codes' },
    { id:'orders',      icon:'📦', label:'Orders' },
    { id:'emails',      icon:'📧', label:'Email List' },
    { id:'reviews',     icon:'⭐', label:'Reviews' },
    { id:'analytics',   icon:'📈', label:'Analytics' },
  ];
  return `<div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="as-brand"><div class="as-logo">Beads <em>n</em> Charms</div><div class="as-sub">STORE ADMIN</div></div>
      <div class="as-nav">
        ${navItems.map(n => `<div class="as-nav-item ${_adminSection === n.id ? 'active' : ''}" onclick="setAdminSection('${n.id}')">
          <span class="nav-icon">${n.icon}</span> ${n.label}
        </div>`).join('')}
      </div>
      <div class="as-footer">
        <button class="btn-ghost" onclick="renderPage('home')" style="width:100%;margin-bottom:8px;font-size:12px">← View Store</button>
        <div style="font-size:11px;color:rgba(255,255,255,.3);padding:0 4px 8px;word-break:break-all">${Auth.email()}</div>
        <button class="btn-ghost" onclick="doAdminLogout()" style="width:100%;font-size:12px;opacity:.5">Log Out</button>
      </div>
    </aside>
    <main class="admin-main" id="adminMain">${renderAdminSection()}</main>
  </div>`;
}

function setAdminSection(sec) {
  _adminSection = sec;
  const el = document.getElementById('adminMain');
  if (el) el.innerHTML = renderAdminSection();
}

function renderAdminSection() {
  const map = {
    dashboard:  renderAdminDashboard,
    products:   renderAdminProducts,
    categories: renderAdminCats,
    sales:      renderAdminSales,
    discounts:  renderAdminDiscounts,
    orders:     renderAdminOrders,
    emails:     renderAdminEmails,
    reviews:    renderAdminReviews,
    analytics:  renderAdminAnalytics,
  };
  return (map[_adminSection] || renderAdminDashboard)();
}

// ── Dashboard ─────────────────────────────────────────────────
function renderAdminDashboard() {
  const prods = DB.getProds();
  const lowStock = prods.filter(p => p.in_stock && p.stock_qty <= CONFIG.LOW_STOCK_THRESHOLD && p.stock_qty > 0);
  return `
  <div class="admin-topbar">
    <div><h1>Dashboard</h1><p>${new Date().toLocaleDateString('en-PK',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p></div>
  </div>
  <div class="stat-grid">
    <div class="stat-card"><div class="stat-label">Products</div><div class="stat-val">${prods.length}</div><div class="stat-change">${prods.filter(p=>p.in_stock).length} in stock</div></div>
    <div class="stat-card"><div class="stat-label">On Sale</div><div class="stat-val">${prods.filter(p=>p.on_sale).length}</div><div class="stat-change">Active discounts</div></div>
    <div class="stat-card"><div class="stat-label">Categories</div><div class="stat-val">${DB.getCats().length}</div><div class="stat-change">Collections</div></div>
    <div class="stat-card"><div class="stat-label">Database</div><div class="stat-val" style="font-size:20px;color:var(--green)">Live ✓</div><div class="stat-change">Supabase connected</div></div>
  </div>
  ${lowStock.length ? `<div class="admin-card" style="border-color:#fff3cd">
    <div class="admin-card-hdr" style="background:#fff3cd"><h3 style="color:#856404">⚠️ Low Stock Alert</h3></div>
    <div style="padding:16px 24px;display:flex;flex-direction:column;gap:10px">
      ${lowStock.map(p => `<div style="display:flex;justify-content:space-between;align-items:center;font-size:13px">
        <span>${p.emoji} ${p.name}</span>
        <span style="color:var(--sale);font-weight:700">${p.stock_qty} remaining</span>
      </div>`).join('')}
    </div>
  </div>` : ''}
  <div class="admin-card">
    <div class="admin-card-hdr"><h3>Quick Actions</h3></div>
    <div style="padding:20px 24px;display:flex;gap:12px;flex-wrap:wrap">
      ${[['products','+ Add Product'],['categories','+ Add Category'],['discounts','+ Add Discount'],['sales','Manage Sales'],['orders','View Orders'],['emails','Email List']].map(([sec,lbl]) =>
        `<button class="btn-fill btn-sm" onclick="setAdminSection('${sec}')" style="border-radius:50px;padding:10px 20px;font-size:12px">${lbl}</button>`
      ).join('')}
    </div>
  </div>`;
}

// ── Products ──────────────────────────────────────────────────
function renderAdminProducts(search = '') {
  let prods = DB.getProds();
  if (search) prods = prods.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  return `
  <div class="admin-topbar">
    <div><h1>Products</h1><p>${prods.length} in catalogue</p></div>
    <button class="btn-fill btn-sm" onclick="openPFM()" style="border-radius:50px;padding:10px 20px;font-size:12px">+ Add Product</button>
  </div>
  <div class="admin-card">
    <div class="admin-card-hdr">
      <h3>All Products</h3>
      <input class="search-field" placeholder="Search products…" value="${search}" oninput="document.getElementById('adminMain').innerHTML=renderAdminProducts(this.value)">
    </div>
    <div style="overflow-x:auto"><table class="admin-table"><thead><tr>
      <th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th>
    </tr></thead><tbody>
    ${prods.map(p => {
      const sp = salePrice(p);
      const stockColor = !p.in_stock ? 'var(--sale)' : p.stock_qty <= CONFIG.LOW_STOCK_THRESHOLD ? '#856404' : 'var(--green)';
      return `<tr>
        <td>
          <div style="display:flex;gap:12px;align-items:center">
            <div class="at-thumb" style="background:${p.color}">
              ${p.image_url ? `<img src="${p.image_url}" style="width:100%;height:100%;object-fit:cover;border-radius:10px" onerror="this.outerHTML='${p.emoji}'">` : p.emoji}
            </div>
            <div>
              <div class="at-name">${p.name}</div>
              ${p.featured ? '<span class="status-tag st-featured" style="font-size:10px">Featured</span>' : ''}
              ${p.has_variants ? '<span class="status-tag" style="font-size:10px;background:var(--p5);color:var(--p1)">Has Variants</span>' : ''}
            </div>
          </div>
        </td>
        <td style="font-size:13px">${catName(p.category_id)}</td>
        <td>
          ${p.on_sale ? `<span style="text-decoration:line-through;color:var(--xl);font-size:12px">${formatPKR(p.price)}</span><br>
          <span style="color:var(--sale);font-weight:700">${formatPKR(sp)}</span>` : formatPKR(p.price)}
        </td>
        <td style="font-weight:600;color:${stockColor}">
          ${p.in_stock ? p.stock_qty + ' units' : 'Out of Stock'}
        </td>
        <td>
          <div style="display:flex;gap:4px;flex-wrap:wrap">
            ${p.in_stock ? '<span class="status-tag st-active">Active</span>' : '<span class="status-tag st-oos">OOS</span>'}
            ${p.on_sale ? `<span class="status-tag st-sale">-${p.sale_percent}%</span>` : ''}
          </div>
        </td>
        <td>
          <div class="act-btns">
            <button class="act-btn" onclick="openPFM('${p.id}')" title="Edit">✏️</button>
            <button class="act-btn" onclick="toggleStock('${p.id}')" title="Toggle stock">📦</button>
            <button class="act-btn danger" onclick="deleteProduct('${p.id}')" title="Delete">🗑️</button>
          </div>
        </td>
      </tr>`;
    }).join('') || '<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--lt)">No products found</td></tr>'}
    </tbody></table></div>
  </div>`;
}

// ── Categories ────────────────────────────────────────────────
function renderAdminCats() {
  const cats = DB.getCats();
  const prods = DB.getProds();
  return `
  <div class="admin-topbar">
    <div><h1>Categories</h1><p>${cats.length} collections</p></div>
    <button class="btn-fill btn-sm" onclick="openCFM()" style="border-radius:50px;padding:10px 20px;font-size:12px">+ Add Category</button>
  </div>
  <div class="admin-card">
    <div style="overflow-x:auto"><table class="admin-table"><thead><tr>
      <th>Icon</th><th>Name</th><th>Description</th><th>Products</th><th>Actions</th>
    </tr></thead><tbody>
    ${cats.map(c => {
      const cnt = prods.filter(p => p.category_id === c.id).length;
      return `<tr>
        <td style="font-size:1.8rem">${c.emoji}</td>
        <td><strong>${c.name}</strong></td>
        <td style="color:var(--lt);font-size:13px">${c.description||'-'}</td>
        <td>${cnt}</td>
        <td><div class="act-btns">
          <button class="act-btn" onclick="openCFM('${c.id}')">✏️</button>
          <button class="act-btn danger" onclick="deleteCat('${c.id}')">🗑️</button>
        </div></td>
      </tr>`;
    }).join('')}
    </tbody></table></div>
  </div>`;
}

// ── Sale Manager ──────────────────────────────────────────────
function renderAdminSales() {
  const prods = DB.getProds();
  return `
  <div class="admin-topbar"><div><h1>Sale Manager</h1><p>Toggle discounts instantly</p></div></div>
  <div class="admin-card" style="margin-bottom:20px">
    <div class="admin-card-hdr"><h3>Bulk Sale</h3></div>
    <div style="padding:20px 24px;display:flex;align-items:flex-end;gap:16px;flex-wrap:wrap">
      <div>
        <label class="form-label" style="margin-bottom:7px">Discount % for all in-stock</label>
        <input type="number" class="form-input" id="bulkPct" placeholder="e.g. 20" min="1" max="90" style="width:160px">
      </div>
      <button class="btn-fill btn-sm" onclick="applyBulkSale()" style="border-radius:50px;padding:10px 20px;font-size:12px">Apply to All</button>
      <button class="btn-ghost" onclick="clearAllSales()">Clear All Sales</button>
    </div>
  </div>
  <div class="admin-card">
    <div class="admin-card-hdr"><h3>Per-Product Control</h3></div>
    <div style="overflow-x:auto"><table class="admin-table"><thead><tr>
      <th>Product</th><th>Original Price</th><th>Discount %</th><th>Sale Price</th><th>On Sale</th>
    </tr></thead><tbody>
    ${prods.map(p => `<tr>
      <td><div style="display:flex;gap:10px;align-items:center">
        <div class="at-thumb" style="background:${p.color}">${p.image_url ? `<img src="${p.image_url}" style="width:100%;height:100%;object-fit:cover;border-radius:10px">` : p.emoji}</div>
        <div class="at-name">${p.name}</div>
      </div></td>
      <td>${formatPKR(p.price)}</td>
      <td><div style="display:flex;align-items:center;gap:6px">
        <input type="number" class="sale-pct-input" value="${p.sale_percent||0}" min="0" max="90" id="spi-${p.id}" onchange="updateSalePct('${p.id}',this.value)">
        <span style="color:var(--lt);font-size:12px">%</span>
      </div></td>
      <td><span id="spv-${p.id}" style="font-weight:700;color:${p.on_sale?'var(--sale)':'var(--dk)'}">${formatPKR(salePrice(p))}</span></td>
      <td><label class="toggle-switch">
        <input type="checkbox" ${p.on_sale ? 'checked' : ''} onchange="toggleSaleDB('${p.id}',this.checked)">
        <div class="ts-track"><div class="ts-thumb"></div></div>
      </label></td>
    </tr>`).join('')}
    </tbody></table></div>
  </div>`;
}

// ── Discount Codes ────────────────────────────────────────────
function renderAdminDiscounts() {
  setTimeout(loadAdminDiscounts, 50);
  return `
  <div class="admin-topbar">
    <div><h1>Discount Codes</h1><p>Promo codes for customers</p></div>
    <button class="btn-fill btn-sm" onclick="openDiscountModal()" style="border-radius:50px;padding:10px 20px;font-size:12px">+ Add Code</button>
  </div>
  <div class="admin-card" id="discountsTable">
    <div style="padding:40px;text-align:center;color:var(--lt)">Loading…</div>
  </div>`;
}

async function loadAdminDiscounts() {
  const el = document.getElementById('discountsTable');
  if (!el) return;
  const discounts = await DB.getDiscounts();
  if (!discounts.length) { el.innerHTML = '<div style="padding:40px;text-align:center;color:var(--lt)">No discount codes yet</div>'; return; }
  el.innerHTML = `<div style="overflow-x:auto"><table class="admin-table"><thead><tr>
    <th>Code</th><th>Type</th><th>Value</th><th>Min Order</th><th>Uses</th><th>Expires</th><th>Status</th><th>Actions</th>
  </tr></thead><tbody>
  ${discounts.map(d => `<tr>
    <td><strong style="font-family:monospace;font-size:14px;color:var(--p1)">${d.code}</strong></td>
    <td style="text-transform:capitalize">${d.type.replace('_',' ')}</td>
    <td>${d.type==='percent'?d.value+'%':d.type==='fixed'?formatPKR(d.value):'Free Delivery'}</td>
    <td>${d.min_order>0?formatPKR(d.min_order):'-'}</td>
    <td>${d.used_count}${d.max_uses?' / '+d.max_uses:' / ∞'}</td>
    <td style="font-size:12px;color:var(--lt)">${d.expires_at?new Date(d.expires_at).toLocaleDateString():'-'}</td>
    <td><span class="status-tag ${d.active?'st-active':'st-oos'}">${d.active?'Active':'Inactive'}</span></td>
    <td><div class="act-btns">
      <button class="act-btn danger" onclick="deleteDiscount('${d.id}')">🗑️</button>
    </div></td>
  </tr>`).join('')}
  </tbody></table></div>`;
}

function openDiscountModal() {
  document.getElementById('discountFormModal')?.classList.add('open');
}

async function saveDiscountCode() {
  const data = {
    code:      document.getElementById('dcCode')?.value,
    type:      document.getElementById('dcType')?.value,
    value:     document.getElementById('dcValue')?.value,
    minOrder:  document.getElementById('dcMinOrder')?.value,
    maxUses:   document.getElementById('dcMaxUses')?.value,
    expiresAt: document.getElementById('dcExpires')?.value || null,
    active:    true
  };
  if (!data.code) { toast('Code is required', 'err'); return; }
  const ok = await DB.saveDiscount(data);
  if (ok) { toast('Discount code created ✦'); document.getElementById('discountFormModal')?.classList.remove('open'); setAdminSection('discounts'); }
  else    toast('Failed to save discount', 'err');
}

async function deleteDiscount(id) {
  if (!confirm('Deactivate this code?')) return;
  await DB.deleteDiscount(id);
  setAdminSection('discounts');
  toast('Discount deactivated');
}

// ── Orders ────────────────────────────────────────────────────
function renderAdminOrders() {
  setTimeout(loadAdminOrders, 50);
  return `
  <div class="admin-topbar">
    <div><h1>Orders</h1><p>Live from database</p></div>
    <button class="btn-fill btn-sm" onclick="loadAdminOrders()" style="border-radius:50px;padding:10px 20px;font-size:12px">↺ Refresh</button>
  </div>
  <div class="admin-card" id="ordersTable">
    <div style="padding:40px;text-align:center;color:var(--lt)">⏳ Loading orders…</div>
  </div>`;
}

async function loadAdminOrders() {
  const el = document.getElementById('ordersTable');
  if (!el) return;
  const orders = await DB.getOrders();
  if (!orders.length) { el.innerHTML = '<div style="padding:40px;text-align:center;color:var(--lt)">No orders yet</div>'; return; }
  const statusBg = { pending:'#fff3cd', confirmed:'#d4edda', processing:'#cce5ff', shipped:'#d1ecf1', delivered:'#d4edda', cancelled:'#fde8e6' };
  const statusColor = { pending:'#856404', confirmed:'#27643a', processing:'#004085', shipped:'#0c5460', delivered:'#27643a', cancelled:'#8b1a23' };
  el.innerHTML = `
  <div class="admin-card-hdr">
    <h3>${orders.length} orders · ${orders.filter(o=>o.status==='pending').length} pending</h3>
    <div style="display:flex;gap:8px">
      <span style="font-size:12px;color:var(--green);font-weight:600">PKR ${orders.filter(o=>o.status!=='cancelled').reduce((s,o)=>s+(o.total||0),0).toLocaleString()} revenue</span>
    </div>
  </div>
  <div style="overflow-x:auto"><table class="admin-table"><thead><tr>
    <th>Order ID</th><th>Customer</th><th>Email</th><th>Total</th><th>Payment</th><th>Status</th><th>Tracking</th><th>Date</th>
  </tr></thead><tbody>
  ${orders.map(o => `<tr>
    <td><strong style="font-family:monospace;font-size:11px">${o.id}</strong></td>
    <td><div class="at-name">${o.customer_name||'-'}</div><div class="at-sub">${o.customer_phone||''}</div></td>
    <td style="font-size:12px;color:var(--p2)">${o.customer_email||'-'}</td>
    <td style="font-weight:600">${formatPKR(o.total)}</td>
    <td style="text-transform:capitalize;font-size:13px">${o.payment||'cod'}</td>
    <td>
      <select class="sort-sel" style="font-size:12px;padding:5px 8px;background:${statusBg[o.status]||'#eee'};color:${statusColor[o.status]||'#333'}"
        onchange="updateOrderStatusAdmin('${o.id}',this.value)">
        ${['pending','confirmed','processing','shipped','delivered','cancelled'].map(s =>
          `<option value="${s}" ${o.status===s?'selected':''}>${s}</option>`
        ).join('')}
      </select>
    </td>
    <td>
      <input type="text" placeholder="Add tracking" value="${o.tracking_number||''}" style="font-size:11px;padding:4px 8px;border:1px solid var(--border);border-radius:6px;width:120px"
        onblur="addTracking('${o.id}',this.value)">
    </td>
    <td style="color:var(--lt);font-size:12px">${new Date(o.created_at).toLocaleDateString()}</td>
  </tr>`).join('')}
  </tbody></table></div>`;
}

async function updateOrderStatusAdmin(id, status) {
  await DB.updateOrderStatus(id, status);
  toast('Order status updated');
}

async function addTracking(id, tracking) {
  if (!tracking) return;
  await DB.updateOrderStatus(id, null, tracking);
  toast('Tracking number saved ✦');
}

// ── Email List ────────────────────────────────────────────────
function renderAdminEmails() {
  setTimeout(loadAdminEmails, 50);
  return `
  <div class="admin-topbar">
    <div><h1>Email List</h1><p>Collected at checkout & newsletter</p></div>
    <button class="btn-fill btn-sm" onclick="exportEmails()" style="border-radius:50px;padding:10px 20px;font-size:12px">⬇ Export CSV</button>
  </div>
  <div class="admin-card" id="emailsTable">
    <div style="padding:40px;text-align:center;color:var(--lt)">⏳ Loading…</div>
  </div>`;
}

async function loadAdminEmails() {
  const el = document.getElementById('emailsTable');
  if (!el) return;
  const subs = await DB.getSubscribers();
  window._adminSubs = subs;
  if (!subs.length) { el.innerHTML = '<div style="padding:40px;text-align:center;color:var(--lt)">No subscribers yet</div>'; return; }
  el.innerHTML = `
  <div class="admin-card-hdr">
    <h3 style="color:var(--green)">📧 ${subs.length} subscribers</h3>
    <span style="font-size:12px;color:var(--lt)">Auto-collected at checkout + newsletter signups</span>
  </div>
  <div style="overflow-x:auto"><table class="admin-table"><thead><tr>
    <th>Email</th><th>Name</th><th>Source</th><th>Subscribed</th><th>Date</th>
  </tr></thead><tbody>
  ${subs.map(s => `<tr>
    <td style="color:var(--p1);font-weight:600">${s.email}</td>
    <td>${s.name||'-'}</td>
    <td><span class="status-tag ${s.source==='checkout'?'st-active':'st-featured'}">${s.source||'checkout'}</span></td>
    <td><span class="status-tag ${s.subscribed!==false?'st-active':'st-oos'}">${s.subscribed!==false?'Yes':'No'}</span></td>
    <td style="color:var(--lt);font-size:12px">${new Date(s.created_at).toLocaleDateString()}</td>
  </tr>`).join('')}
  </tbody></table></div>`;
}

function exportEmails() {
  const subs = window._adminSubs || [];
  if (!subs.length) { toast('No subscribers to export', 'err'); return; }
  const csv = ['Email,Name,Source,Date', ...subs.map(s => `${s.email},"${s.name||''}",${s.source||'checkout'},${new Date(s.created_at).toLocaleDateString()}`)].join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = 'beadsncharmss_emails_' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
  toast('Email list exported ✓');
}

// ── Reviews ───────────────────────────────────────────────────
function renderAdminReviews() {
  setTimeout(loadAdminReviews, 50);
  return `
  <div class="admin-topbar"><div><h1>Reviews</h1><p>Approve or reject customer reviews</p></div></div>
  <div class="admin-card" id="reviewsTable">
    <div style="padding:40px;text-align:center;color:var(--lt)">⏳ Loading…</div>
  </div>`;
}

async function loadAdminReviews() {
  const el = document.getElementById('reviewsTable');
  if (!el) return;
  const reviews = await DB.getReviews_admin();
  if (!reviews.length) { el.innerHTML = '<div style="padding:40px;text-align:center;color:var(--lt)">No reviews yet</div>'; return; }
  el.innerHTML = `<div style="overflow-x:auto"><table class="admin-table"><thead><tr>
    <th>Product</th><th>Customer</th><th>Rating</th><th>Comment</th><th>Status</th><th>Actions</th>
  </tr></thead><tbody>
  ${reviews.map(r => `<tr>
    <td style="font-size:12px;color:var(--mid)">${r.product_id||'-'}</td>
    <td><strong>${r.customer_name}</strong></td>
    <td>${starsHTML(r.rating)}</td>
    <td style="font-size:13px;color:var(--mid);max-width:200px">${r.comment||'-'}</td>
    <td><span class="status-tag ${r.approved?'st-active':'st-pending'}">${r.approved?'Approved':'Pending'}</span></td>
    <td><div class="act-btns">
      ${!r.approved ? `<button class="act-btn" onclick="approveReview('${r.id}',true)" title="Approve" style="color:var(--green)">✓</button>` : ''}
      <button class="act-btn danger" onclick="approveReview('${r.id}',false)" title="Reject">✕</button>
    </div></td>
  </tr>`).join('')}
  </tbody></table></div>`;
}

async function approveReview(id, approved) {
  await DB.approveReview(id, approved);
  toast(approved ? 'Review approved ✦' : 'Review rejected');
  setAdminSection('reviews');
}

// ── Analytics ─────────────────────────────────────────────────
function renderAdminAnalytics() {
  setTimeout(loadAdminAnalytics, 50);
  return `
  <div class="admin-topbar"><div><h1>Analytics</h1><p>Store performance overview</p></div></div>
  <div id="analyticsContent"><div style="padding:40px;text-align:center;color:var(--lt)">⏳ Loading analytics…</div></div>`;
}

async function loadAdminAnalytics() {
  const el = document.getElementById('analyticsContent');
  if (!el) return;
  const { orders, events } = await DB.getAnalytics();
  const revenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.total||0), 0);
  const thisMonth = orders.filter(o => new Date(o.created_at).getMonth() === new Date().getMonth());
  const monthRevenue = thisMonth.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.total||0), 0);
  const pageViews = events.filter(e => e.event === 'page_view').length;
  const addToCarts = events.filter(e => e.event === 'add_to_cart').length;
  const purchases = events.filter(e => e.event === 'purchase').length;
  const convRate = pageViews ? ((purchases / pageViews) * 100).toFixed(1) : 0;

  // Top products
  const prodEvents = events.filter(e => e.event === 'product_view' && e.product_id);
  const prodCounts = {};
  prodEvents.forEach(e => { prodCounts[e.product_id] = (prodCounts[e.product_id]||0)+1; });
  const topProds = Object.entries(prodCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);

  el.innerHTML = `
  <div class="stat-grid" style="grid-template-columns:repeat(4,1fr)">
    <div class="stat-card"><div class="stat-label">Total Revenue</div><div class="stat-val" style="font-size:22px">PKR ${(revenue/1000).toFixed(1)}k</div><div class="stat-change">All time</div></div>
    <div class="stat-card"><div class="stat-label">This Month</div><div class="stat-val" style="font-size:22px">PKR ${(monthRevenue/1000).toFixed(1)}k</div><div class="stat-change">${thisMonth.length} orders</div></div>
    <div class="stat-card"><div class="stat-label">Total Orders</div><div class="stat-val">${orders.length}</div><div class="stat-change">${orders.filter(o=>o.status==='pending').length} pending</div></div>
    <div class="stat-card"><div class="stat-label">Conversion Rate</div><div class="stat-val" style="font-size:22px">${convRate}%</div><div class="stat-change">${pageViews} views → ${purchases} orders</div></div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
    <div class="admin-card">
      <div class="admin-card-hdr"><h3>Funnel</h3></div>
      <div style="padding:20px 24px">
        ${[['Page Views',pageViews,'var(--p3)'],['Product Views',events.filter(e=>e.event==='product_view').length,'var(--p2)'],['Add to Cart',addToCarts,'var(--p1)'],['Purchases',purchases,'var(--green)']].map(([label,val,color]) => `
        <div style="margin-bottom:14px">
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
            <span style="color:var(--mid)">${label}</span><span style="font-weight:700">${val}</span>
          </div>
          <div style="height:6px;background:var(--b2);border-radius:3px">
            <div style="height:100%;width:${Math.min(100,(val/Math.max(pageViews,1))*100)}%;background:${color};border-radius:3px"></div>
          </div>
        </div>`).join('')}
      </div>
    </div>
    <div class="admin-card">
      <div class="admin-card-hdr"><h3>Top Products</h3></div>
      <div style="padding:20px 24px">
        ${topProds.length ? topProds.map(([id, count]) => {
          const p = DB.getProd(id);
          return `<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;font-size:13px">
            <div style="width:32px;height:32px;border-radius:8px;background:${p?.color||'var(--p6)'};display:flex;align-items:center;justify-content:center">${p?.emoji||'📿'}</div>
            <span style="flex:1;color:var(--dk)">${p?.name||id}</span>
            <span style="font-weight:700;color:var(--p2)">${count} views</span>
          </div>`;
        }).join('') : '<p style="color:var(--lt);font-size:13px">No data yet — share your store!</p>'}
      </div>
    </div>
  </div>`;
}

// ── Admin actions ─────────────────────────────────────────────
async function toggleStock(id) {
  const p = DB.getProd(id);
  if (!p) return;
  await DB.saveProd({ ...p, cat: p.category_id, onSale: p.on_sale, salePct: p.sale_percent, inStock: !p.in_stock, stockQty: p.stock_qty, featured: p.featured }, id);
  setAdminSection('products');
  toast('Stock status updated');
}

async function deleteProduct(id) {
  if (!confirm('Archive this product? It will be hidden from the store.')) return;
  await DB.deleteProd(id);
  setAdminSection('products');
  toast('Product archived');
}

async function deleteCat(id) {
  if (!confirm('Archive this category?')) return;
  await DB.deleteCat(id);
  setAdminSection('categories');
  toast('Category archived');
}

async function toggleSaleDB(id, val) {
  const p = DB.getProd(id);
  if (!p) return;
  await sbFetch(`products?id=eq.${id}`, { method: 'PATCH', body: { on_sale: val, updated_at: new Date().toISOString() } });
  await DB.loadCatalog();
  const el = document.getElementById('spv-' + id);
  const updated = DB.getProd(id);
  if (el && updated) { el.textContent = formatPKR(salePrice(updated)); el.style.color = val ? 'var(--sale)' : 'var(--dk)'; }
  toast('Sale status updated');
}

async function updateSalePct(id, val) {
  const pct = Math.max(0, Math.min(90, parseInt(val) || 0));
  await sbFetch(`products?id=eq.${id}`, { method: 'PATCH', body: { sale_percent: pct, updated_at: new Date().toISOString() } });
  await DB.loadCatalog();
  const updated = DB.getProd(id);
  const el = document.getElementById('spv-' + id);
  if (el && updated) el.textContent = formatPKR(salePrice(updated));
}

async function applyBulkSale() {
  const pct = parseInt(document.getElementById('bulkPct')?.value);
  if (!pct || pct < 1 || pct > 90) { toast('Enter a valid percentage (1–90)', 'err'); return; }
  dbStatus('Applying bulk sale…', 'saving');
  await DB.applyBulkSale(pct);
  setAdminSection('sales');
  toast(`${pct}% applied to all in-stock products ✦`);
}

async function clearAllSales() {
  if (!confirm('Remove all active sales?')) return;
  dbStatus('Clearing sales…', 'saving');
  await DB.clearAllSales();
  setAdminSection('sales');
  toast('All sales cleared ✦');
}

// ── Product form modal ────────────────────────────────────────
function buildEmojiPicker(pickerId, selected, onSelectFn) {
  const el = document.getElementById(pickerId);
  if (!el) return;
  el.innerHTML = EMOJIS.map(e => `<span class="emoji-opt ${e === selected ? 'sel' : ''}" onclick="${onSelectFn}('${e}')">${e}</span>`).join('');
}

function buildColorPicker() {
  const el = document.getElementById('colorPicker');
  if (!el) return;
  el.innerHTML = COLORS.map((c, i) => `<div class="color-swatch ${c === _pfmColor ? 'sel' : ''}" style="background:${c}" onclick="selectPFMColor(${i})"></div>`).join('');
}

function selectPFMEmoji(e) { _pfmEmoji = e; const inp = document.getElementById('pfmEmoji'); if (inp) inp.value = e; buildEmojiPicker('emojiPicker', e, 'selectPFMEmoji'); }
function selectPFMColor(i) { _pfmColor = COLORS[i]; buildColorPicker(); }
function selectCFMEmoji(e) { _cfmEmoji = e; const inp = document.getElementById('cfmEmoji'); if (inp) inp.value = e; buildEmojiPicker('catEmojiPicker', e, 'selectCFMEmoji'); }
function togglePFMSale()  { document.getElementById('pfmSaleFields').style.display = document.getElementById('pfmOnSale').checked ? 'block' : 'none'; }
function togglePFMVariants() { document.getElementById('pfmVariantsFields').style.display = document.getElementById('pfmHasVariants').checked ? 'block' : 'none'; }

function previewPFMSale() {
  const price = parseInt(document.getElementById('pfmPrice')?.value) || 0;
  const pct   = parseInt(document.getElementById('pfmSalePct')?.value) || 0;
  const el    = document.getElementById('pfmSalePreview');
  if (el) el.textContent = pct && price ? `Sale price: ${formatPKR(Math.round(price * (1 - pct/100)))}` : '';
}

function openPFM(id = null) {
  _pfmEmoji = '📿'; _pfmColor = COLORS[0]; _selectedVariants = {};
  document.getElementById('pfmCat').innerHTML = DB.getCats().map(c => `<option value="${c.id}">${c.emoji} ${c.name}</option>`).join('');
  document.getElementById('pfmId').value = '';
  document.getElementById('pfmTitle').textContent = 'Add Product';
  ['pfmName','pfmPrice','pfmDesc','pfmTags','pfmSalePct','pfmStockQty','pfmVariantsList'].forEach(f => { const el = document.getElementById(f); if (el) el.value = ''; });
  document.getElementById('pfmEmoji').value = '📿';
  document.getElementById('pfmInstock').checked = true;
  document.getElementById('pfmFeatured').checked = false;
  document.getElementById('pfmOnSale').checked = false;
  document.getElementById('pfmHasVariants').checked = false;
  document.getElementById('pfmSaleFields').style.display = 'none';
  document.getElementById('pfmVariantsFields').style.display = 'none';
  document.getElementById('pfmSalePreview').textContent = '';
  document.getElementById('pfmCurrentImg').style.display = 'none';
  if (id) {
    const p = DB.getProd(id);
    if (!p) return;
    document.getElementById('pfmId').value = id;
    document.getElementById('pfmTitle').textContent = 'Edit Product';
    document.getElementById('pfmName').value = p.name;
    document.getElementById('pfmCat').value = p.category_id;
    document.getElementById('pfmPrice').value = p.price;
    document.getElementById('pfmDesc').value = p.description || '';
    document.getElementById('pfmTags').value = (p.tags||[]).join(', ');
    document.getElementById('pfmEmoji').value = p.emoji;
    document.getElementById('pfmStockQty').value = p.stock_qty || 0;
    document.getElementById('pfmInstock').checked = p.in_stock;
    document.getElementById('pfmFeatured').checked = p.featured || false;
    document.getElementById('pfmOnSale').checked = p.on_sale;
    document.getElementById('pfmHasVariants').checked = p.has_variants || false;
    _pfmEmoji = p.emoji; _pfmColor = p.color || COLORS[0];
    if (p.on_sale) { document.getElementById('pfmSaleFields').style.display = 'block'; document.getElementById('pfmSalePct').value = p.sale_percent; previewPFMSale(); }
    if (p.has_variants) { document.getElementById('pfmVariantsFields').style.display = 'block'; document.getElementById('pfmVariantsList').value = JSON.stringify(p.variants||[], null, 2); }
    if (p.image_url) { const img = document.getElementById('pfmCurrentImg'); const imgEl = document.getElementById('pfmCurrentImgEl'); if (img && imgEl) { imgEl.src = p.image_url; img.style.display = 'block'; } }
  }
  buildEmojiPicker('emojiPicker', _pfmEmoji, 'selectPFMEmoji');
  buildColorPicker();
  document.getElementById('productFormModal')?.classList.add('open');
}

function closePFM() { document.getElementById('productFormModal')?.classList.remove('open'); }

async function savePFM() {
  const name = document.getElementById('pfmName')?.value.trim();
  const price = parseInt(document.getElementById('pfmPrice')?.value);
  const cat   = document.getElementById('pfmCat')?.value;
  if (!name || !price || !cat) { toast('Name, price and category are required', 'err'); return; }

  const onSale   = document.getElementById('pfmOnSale').checked;
  const salePct  = parseInt(document.getElementById('pfmSalePct')?.value) || 0;
  const hasVars  = document.getElementById('pfmHasVariants').checked;
  let variants   = [];
  if (hasVars) {
    try { variants = JSON.parse(document.getElementById('pfmVariantsList')?.value || '[]'); }
    catch(e) { toast('Invalid variants JSON format', 'err'); return; }
  }

  const editId   = document.getElementById('pfmId')?.value;
  const imageFile = document.getElementById('pfmImage')?.files[0];
  let imageUrl = editId ? DB.getProd(editId)?.image_url : null;

  if (imageFile) {
    dbStatus('Uploading image…', 'saving');
    const ext  = imageFile.name.split('.').pop();
    const path = 'products/' + (editId || 'p' + Date.now()) + '.' + ext;
    try { imageUrl = await sbUpload(imageFile, path); }
    catch(e) { toast('Image upload failed: ' + e.message, 'err'); }
  }

  const data = {
    name, cat, price, onSale, salePct: onSale ? salePct : 0,
    desc:      document.getElementById('pfmDesc')?.value.trim(),
    tags:      document.getElementById('pfmTags')?.value.split(',').map(t => t.trim()).filter(Boolean),
    emoji:     document.getElementById('pfmEmoji')?.value || _pfmEmoji,
    color:     _pfmColor,
    imageUrl:  imageUrl,
    inStock:   document.getElementById('pfmInstock').checked,
    stockQty:  parseInt(document.getElementById('pfmStockQty')?.value) || 999,
    featured:  document.getElementById('pfmFeatured').checked,
    hasVariants: hasVars,
    variants
  };

  const ok = await DB.saveProd(data, editId || null);
  if (ok) { toast(editId ? 'Product updated ✦' : 'Product added ✦'); closePFM(); setAdminSection('products'); }
  else    toast('Failed to save product', 'err');
}

// ── Category form modal ───────────────────────────────────────
function openCFM(id = null) {
  _cfmEmoji = '📿';
  document.getElementById('cfmId').value = '';
  document.getElementById('cfmTitle').textContent = 'Add Category';
  ['cfmName','cfmDesc','cfmEmoji'].forEach(f => { const el = document.getElementById(f); if (el) el.value = ''; });
  if (id) {
    const c = DB.getCat(id);
    if (!c) return;
    document.getElementById('cfmId').value = id;
    document.getElementById('cfmTitle').textContent = 'Edit Category';
    document.getElementById('cfmName').value = c.name;
    document.getElementById('cfmDesc').value = c.description || '';
    document.getElementById('cfmEmoji').value = c.emoji;
    _cfmEmoji = c.emoji;
  }
  buildEmojiPicker('catEmojiPicker', _cfmEmoji, 'selectCFMEmoji');
  document.getElementById('catFormModal')?.classList.add('open');
}

function closeCFM() { document.getElementById('catFormModal')?.classList.remove('open'); }

async function saveCFM() {
  const name = document.getElementById('cfmName')?.value.trim();
  const emoji = document.getElementById('cfmEmoji')?.value.trim() || _cfmEmoji || '📿';
  if (!name) { toast('Category name is required', 'err'); return; }
  const editId = document.getElementById('cfmId')?.value;
  await DB.saveCat({ name, emoji, desc: document.getElementById('cfmDesc')?.value.trim() || '' }, editId || null);
  toast(editId ? 'Category updated ✦' : 'Category added ✦');
  closeCFM();
  setAdminSection('categories');
}
