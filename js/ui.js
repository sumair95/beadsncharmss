// ============================================================
//  BEADS N CHARMS — UI Layer
//  Cart drawer, toast, search, nav, product cards
// ============================================================

// ── Toast ─────────────────────────────────────────────────────
let _toastTimer;
function toast(msg, type = 'dark') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast show toast-' + type;
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}

// ── Cart UI ───────────────────────────────────────────────────
function addToCart(id, variant = null) {
  const p = DB.getProd(id);
  if (!p || !p.in_stock) return;
  if (p.stock_qty <= 0) { toast('Sorry, this item is out of stock', 'err'); return; }
  Cart.add(id, variant);
  toast(p.name + ' added to cart ✦');
  openCart();
}

function refreshCartUI() {
  const count = Cart.count();
  const pip = document.getElementById('cartPip');
  if (pip) { pip.textContent = count; pip.className = 'cart-pip' + (count > 0 ? ' show' : ''); }
  renderCartDrawer();
}

function renderCartDrawer() {
  const body = document.getElementById('cartBody');
  const ftr  = document.getElementById('cartFtr');
  if (!body) return;

  const items = Cart.get();
  if (!items.length) {
    body.innerHTML = `<div class="cart-empty-state">
      <div style="font-size:3rem;margin-bottom:12px">🛒</div>
      <p style="color:var(--lt);margin-bottom:20px">Your cart is empty</p>
      <button class="btn-fill btn-sm" onclick="closeCart();navigate('shop')" style="border-radius:50px">Browse Shop</button>
    </div>`;
    if (ftr) ftr.innerHTML = '';
    return;
  }

  body.innerHTML = items.map(item => {
    const p = DB.getProd(item.id);
    if (!p) return '';
    const sp = Cart.salePrice(p);
    const img = p.image_url
      ? `<img src="${p.image_url}" style="width:100%;height:100%;object-fit:cover;border-radius:12px" onerror="this.style.display='none';this.nextSibling.style.display='flex'">`
      : '';
    return `<div class="cart-item">
      <div class="ci-thumb" style="background:${p.color}">
        ${img}<span ${p.image_url ? 'style="display:none"' : ''}>${p.emoji}</span>
      </div>
      <div class="ci-info">
        <div class="ci-name">${esc(p.name)}</div>
        ${item.variant ? `<div style="font-size:11px;color:var(--lt);margin-bottom:4px">${esc(item.variant)}</div>` : ''}
        <div class="ci-price">${formatPKR(sp)}</div>
        <div class="ci-qty">
          <button class="qty-btn" onclick="Cart.setQty('${item.key}',${item.qty - 1})">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" onclick="Cart.setQty('${item.key}',${item.qty + 1})">+</button>
        </div>
      </div>
      <span class="ci-del" onclick="Cart.remove('${item.key}')">✕</span>
    </div>`;
  }).join('');

  const sub = Cart.total();
  const del = sub >= CONFIG.FREE_DELIVERY_THRESHOLD ? 0 : CONFIG.DELIVERY_FEE;
  if (ftr) ftr.innerHTML = `
    <div class="cart-total-row"><span>Subtotal</span><span>${formatPKR(sub)}</span></div>
    <div class="cart-total-row"><span>Delivery</span><span>${del === 0 ? '<span style="color:var(--green);font-weight:600">FREE</span>' : formatPKR(del)}</span></div>
    <div class="cart-grand"><span>Total</span><span>${formatPKR(sub + del)}</span></div>
    <p class="cart-note">PKR ${CONFIG.DELIVERY_FEE} delivery · Free above ${formatPKR(CONFIG.FREE_DELIVERY_THRESHOLD)}</p>
    <button class="btn-block btn-block-fill" onclick="closeCart();navigate('checkout')">Checkout →</button>
    <button class="btn-block btn-block-out" onclick="closeCart();navigate('shop')">Continue Shopping</button>`;
}

function openCart()  { document.getElementById('cartDrawer')?.classList.add('open'); document.getElementById('cartOverlay')?.classList.add('open'); }
function closeCart() { document.getElementById('cartDrawer')?.classList.remove('open'); document.getElementById('cartOverlay')?.classList.remove('open'); }

// ── Search ────────────────────────────────────────────────────
function openSearch()  { document.getElementById('searchOver')?.classList.add('open'); setTimeout(() => document.getElementById('searchInput')?.focus(), 50); }
function closeSearch() { document.getElementById('searchOver')?.classList.remove('open'); }

function handleSearch(q) {
  const wrap = document.getElementById('searchResultsWrap');
  if (!wrap) return;
  if (!q.trim()) { wrap.innerHTML = ''; return; }
  const results = DB.getProds().filter(p => {
    const lq = q.toLowerCase();
    return p.name.toLowerCase().includes(lq) || (p.tags||[]).some(t => t.includes(lq)) || catName(p.category_id).toLowerCase().includes(lq);
  }).slice(0, 7);

  if (!results.length) { wrap.innerHTML = '<div class="search-results-wrap"><div class="search-empty">No results for "' + esc(q) + '"</div></div>'; return; }
  wrap.innerHTML = '<div class="search-results-wrap">' + results.map(p => {
    const img = p.image_url ? `<img src="${p.image_url}" style="width:100%;height:100%;object-fit:cover;border-radius:10px">` : p.emoji;
    return `<div class="sr-item" onclick="closeSearch();navigate('product','${p.id}')">
      <div class="sr-thumb" style="background:${p.color}">${img}</div>
      <div>
        <div class="sr-name">${esc(p.name)}</div>
        <div class="sr-price">${formatPKR(salePrice(p))}${p.on_sale ? ` <span style="color:var(--sale);font-size:11px">-${p.sale_percent}%</span>` : ''}</div>
      </div>
      ${p.stock_qty <= CONFIG.LOW_STOCK_THRESHOLD && p.stock_qty > 0 ? '<span style="font-size:10px;color:var(--sale);font-weight:700">Only ' + p.stock_qty + ' left!</span>' : ''}
    </div>`;
  }).join('') + '</div>';
}

// ── Product card HTML ─────────────────────────────────────────
function productCardHTML(p) {
  const sp = salePrice(p);
  const priceHTML = p.on_sale
    ? `<span class="pc-orig">${formatPKR(p.price)}</span><span class="pc-sale">${formatPKR(sp)}</span>`
    : `<span class="pc-price">${formatPKR(p.price)}</span>`;

  const imgContent = p.image_url
    ? `<img src="${p.image_url}" alt="${esc(p.name)}" style="width:100%;height:100%;object-fit:cover" onerror="this.outerHTML='<span style=\\"font-size:4rem\\">${p.emoji}</span>'">`
    : `<span style="font-size:4rem">${p.emoji}</span>`;

  const stockBadge = !p.in_stock ? '<div class="badge-oos">Sold Out</div>'
    : p.stock_qty <= CONFIG.LOW_STOCK_THRESHOLD && p.stock_qty > 0 ? `<div class="badge-low">Only ${p.stock_qty} left!</div>` : '';

  return `<div class="product-card" onclick="navigate('product','${p.id}')" role="article" aria-label="${esc(p.name)}">
    <div class="pc-img" style="background:${p.color}">
      ${imgContent}
      <div class="pc-badges">
        ${p.on_sale ? `<div class="badge-sale">-${p.sale_percent}%</div>` : ''}
        ${stockBadge}
      </div>
      <div class="pc-quick ${!p.in_stock ? 'oos-btn' : ''}"
        onclick="event.stopPropagation();${p.in_stock ? `handleAddToCart('${p.id}')` : ''}">
        ${p.in_stock ? '+ Add to Cart' : 'Out of Stock'}
      </div>
    </div>
    <div class="pc-body">
      <div class="pc-cat">${catName(p.category_id)}</div>
      <div class="pc-name">${esc(p.name)}</div>
      <div class="pc-prices">${priceHTML}</div>
      ${p.has_variants ? '<div style="font-size:11px;color:var(--lt);margin-top:4px">Multiple options available</div>' : ''}
    </div>
  </div>`;
}

// If product has variants, open detail page instead of adding directly
function handleAddToCart(id) {
  const p = DB.getProd(id);
  if (!p) return;
  if (p.has_variants && p.variants?.length) {
    renderPage('product', id); // go to page to pick variant
  } else {
    addToCart(id);
  }
}

// ── Nav HTML ──────────────────────────────────────────────────
function navHTML(active = '') {
  return `
  <div class="announce" id="announceBar">
    <span id="announceLeft">✦ Handmade Jewellery Pakistan · Free Delivery above ${formatPKR(CONFIG.FREE_DELIVERY_THRESHOLD)} · ${formatPKR(CONFIG.DELIVERY_FEE)} delivery nationwide ✦</span>
    <span id="announceTagline" style="display:none;transition:opacity .5s"></span>
  </div>
  <nav>
    <div class="nav-wrap">
      <button class="hamburger" id="hamburger" onclick="document.getElementById('navLinks').classList.toggle('open')" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
      <a class="logo" onclick="navigate('home')" href="/" style="cursor:pointer" aria-label="Beads N Charms home">
        <img src="/assets/logo.png" alt="Beads N Charms — handmade jewellery Pakistan" width="249" height="249">
      </a>
      <div class="nav-links" id="navLinks">
        <span class="nav-link ${active === 'home' ? 'active' : ''}" onclick="navigate('home')">Home</span>
        <span class="nav-link ${active === 'shop' ? 'active' : ''}" onclick="navigate('shop')">Shop</span>
        <div class="nav-cats">
          <span class="nav-link" style="cursor:pointer">Collections ▾</span>
          <div class="cat-drop">
            <div class="cat-item cat-parent">
              <span class="ci">✨</span>Charms
              <span style="margin-left:auto;font-size:10px;color:var(--xl)">▶</span>
              <div class="cat-sub-drop">
                <div class="cat-item" onclick="navigate('shop','bracelet-base')"><span class="ci">📿</span>Bracelet Base</div>
                <div class="cat-item" onclick="navigate('shop','necklace-base')"><span class="ci">💫</span>Necklace Base</div>
                <div class="cat-item" onclick="navigate('shop','earring-base')"><span class="ci">🌸</span>Earring Base</div>
              </div>
            </div>
            <div class="cat-item" onclick="navigate('shop','bracelets')"><span class="ci">📿</span>Bracelets</div>
            <div class="cat-item" onclick="navigate('shop','necklaces')"><span class="ci">💫</span>Necklaces</div>
            <div class="cat-item" onclick="navigate('shop','earrings')"><span class="ci">🌸</span>Earrings</div>
            <div class="cat-item" onclick="navigate('shop','charms-phone')"><span class="ci">📱</span>Phone Charms</div>
            <div class="cat-item" onclick="navigate('shop','keychains')"><span class="ci">🔑</span>Keychains</div>
            <div class="cat-item" onclick="navigate('shop','permanent')"><span class="ci">💜</span>Permanent Jewellery</div>
          </div>
        </div>
        <span class="nav-link ${active === 'about' ? 'active' : ''}" onclick="navigate('about')">About</span>
        <span class="nav-link ${active === 'contact' ? 'active' : ''}" onclick="navigate('contact')">Contact</span>
      </div>
      <div class="nav-right">
        <button class="icon-btn" onclick="openSearch()" aria-label="Search">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </button>
        <button class="icon-btn" onclick="openCart()" aria-label="Cart" style="position:relative">
          <svg viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          <div class="cart-pip" id="cartPip">0</div>
        </button>
      </div>
    </div>
  </nav>`;
}

// ── Footer HTML ───────────────────────────────────────────────
function footerHTML() {
  const cats = DB.getCats();
  return `<footer>
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a class="logo logo-footer" onclick="navigate('home')" href="/" style="cursor:pointer;display:block;margin-bottom:14px" aria-label="Beads N Charms home">
            <img src="/assets/logo.png" alt="Beads N Charms" width="249" height="249">
          </a>
          <p>Pakistan's favourite handmade jewellery brand. Pinterest-inspired beaded bracelets, phone charms & permanent jewellery. COD available nationwide.</p>
          <div class="socials" style="margin-top:16px">
            <a class="social-btn" href="https://instagram.com/beads_ncharmss" target="_blank" rel="noopener">IG</a>
            <a class="social-btn" href="https://wa.me/${CONFIG.WHATSAPP_NUMBER}" target="_blank">WA</a>
          </div>
        </div>
        <div class="footer-col">
          <h4>Collections</h4>
          <ul>${cats.map(c => `<li><a onclick="navigate('shop','${c.id}')" style="cursor:pointer">${esc(c.name)}</a></li>`).join('')}</ul>
        </div>
        <div class="footer-col">
          <h4>Help</h4>
          <ul>
            <li><a onclick="navigate('contact')" style="cursor:pointer">Contact Us</a></li>
            <li><a onclick="navigate('track')" style="cursor:pointer">Track Order</a></li>
            <li><a onclick="navigate('shipping')" href="/shipping" style="cursor:pointer">Shipping &amp; Delivery</a></li>
            <li><a onclick="navigate('returns')" href="/returns-policy" style="cursor:pointer">Returns &amp; Refunds</a></li>
            <li><a onclick="navigate('faq')" href="/faq" style="cursor:pointer">FAQ</a></li>
            <li><a onclick="navigate('privacy')" href="/privacy-policy" style="cursor:pointer">Privacy Policy</a></li>
            <li><a onclick="navigate('terms')" href="/terms" style="cursor:pointer">Terms &amp; Conditions</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Connect</h4>
          <ul>
            <li><a href="https://instagram.com/beads_ncharmss" target="_blank">@beads_ncharmss</a></li>
            <li><a href="https://wa.me/${CONFIG.WHATSAPP_NUMBER}" target="_blank">WhatsApp</a></li>
            <li><a onclick="navigate('about')" style="cursor:pointer">Our Story</a></li>
            <li><a onclick="navigate('admin')" style="cursor:pointer;opacity:.25;font-size:11px">Admin ↗</a></li>
          </ul>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container">© 2025 Beads N Charms · Handmade with 💜 in Pakistan · Buy handmade jewellery online Pakistan</div>
    </div>
  </footer>`;
}

// ── Tagline rotator ───────────────────────────────────────────
const TAGLINES = [
  "Your new charm obsession ✦",
  "Because basic isn't your vibe 💜",
  "Made to match your aesthetic ✨",
  "Beads n Charms: because basic is boring 📿"
];
let _tagIdx = 0;

function startTaglineRotator() {
  const left = document.getElementById('announceLeft');
  const tg   = document.getElementById('announceTagline');
  if (!left || !tg) return;
  setTimeout(() => {
    left.style.display = 'none';
    tg.style.display = 'inline';
    tg.style.opacity = '0';
    tg.textContent = TAGLINES[_tagIdx];
    setTimeout(() => tg.style.opacity = '1', 50);
    setInterval(() => {
      tg.style.opacity = '0';
      setTimeout(() => {
        _tagIdx = (_tagIdx + 1) % TAGLINES.length;
        tg.textContent = TAGLINES[_tagIdx];
        tg.style.opacity = '1';
      }, 500);
    }, 3000);
  }, 3000);
}

// ── Scroll animations ─────────────────────────────────────────
function initScrollAnimations() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.product-card,.mosaic-card,.value-card,.about-card-big,.sec-hdr,.category-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity .45s ease,transform .45s ease';
    observer.observe(el);
  });
}

// ── Modal helpers ─────────────────────────────────────────────
function openModal(id)  { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

// ── Star rating renderer ──────────────────────────────────────
function starsHTML(rating, max = 5) {
  return Array.from({ length: max }, (_, i) =>
    `<span style="color:${i < rating ? '#f0ad4e' : '#ddd'};font-size:14px">★</span>`
  ).join('');
}
