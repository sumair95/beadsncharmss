// ============================================================
//  BEADS N CHARMS — Page Renderers
// ============================================================

// ── HOME ──────────────────────────────────────────────────────
function renderHome() {
  const cats = DB.getCats();
  const featured = DB.getProds().filter(p => p.featured).slice(0, 8);
  const saleProds = DB.getProds().filter(p => p.on_sale && p.in_stock);
  const maxOff = saleProds.length ? Math.max(...saleProds.map(p => p.sale_percent)) : 0;
  const mosaic = DB.getProds().slice(0, 4);

  DB.track('page_view', { page: 'home' });

  return navHTML('home') + `<main>
  <section class="hero">
    <div class="hero-left">
      <div class="hero-eyebrow">Handmade Jewellery Online Pakistan</div>
      <h1 class="hero-h1">Wear<br>What<br>You <em>Pin</em></h1>
      <p class="hero-body">Pakistan's favourite Pinterest-inspired jewellery brand. Handcrafted beaded bracelets, phone charms & permanent jewellery — delivered to your doorstep with Cash on Delivery.</p>
      <div class="hero-btns">
        <button class="btn-fill" onclick="navigate('shop')">Shop Now</button>
        ${saleProds.length ? `<button class="btn-outline" onclick="navigate('shop','sale')">Sale — Up to ${maxOff}% Off</button>` : ''}
      </div>
    </div>
    <div class="hero-right">
      <div class="hero-mosaic">
        ${mosaic.map(p => {
          const imgContent = p.image_url
            ? `<img src="${p.image_url}" alt="${esc(p.name)}" style="width:100%;height:100%;object-fit:cover" onerror="this.outerHTML='<span style=\\"font-size:3.5rem\\">${p.emoji}</span>'">`
            : `<span style="font-size:3.5rem">${p.emoji}</span>`;
          return `<div class="mosaic-card" onclick="navigate('product','${p.id}')">
            <div class="mosaic-img" style="background:${p.color}">${imgContent}</div>
            <div class="mosaic-info">
              <div class="mosaic-name">${esc(p.name)}</div>
              <div class="mosaic-price">${formatPKR(salePrice(p))}${p.on_sale ? `<span class="mosaic-badge">-${p.sale_percent}%</span>` : ''}</div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>
  </section>

  <section class="section" aria-label="Collections">
    <div class="container">
      <div class="sec-hdr">
        <div><div class="sec-eyebrow">Browse by category</div><h2 class="sec-title">Our <em>Collections</em></h2></div>
        <span class="link-arrow" onclick="navigate('shop')" style="cursor:pointer">View all →</span>
      </div>
      <div class="cat-strip">
        ${cats.map(c => `<div class="cat-pill" onclick="navigate('shop','${c.id}')"><span class="ce">${c.emoji}</span>${esc(c.name)}</div>`).join('')}
      </div>
    </div>
  </section>

  <section class="section section-alt" aria-label="Featured Products">
    <div class="container">
      <div class="sec-hdr">
        <div><div class="sec-eyebrow">Handpicked for you</div><h2 class="sec-title">Featured <em>Pieces</em></h2></div>
        <span class="link-arrow" onclick="navigate('shop')" style="cursor:pointer">View all →</span>
      </div>
      <div class="products-grid">${featured.map(productCardHTML).join('')}</div>
    </div>
  </section>

  ${saleProds.length ? `<section class="sale-section">
    <div class="sale-inner">
      <div class="sale-eyebrow">Limited time — Pakistan exclusive</div>
      <div class="sale-title">Sale is Live ✦</div>
      <div class="sale-sub">Up to <strong>${maxOff}%</strong> off on selected pieces</div>
      <button class="btn-white" onclick="navigate('shop','sale')">Shop Sale Now</button>
    </div>
  </section>` : ''}

  <section class="section">
    <div class="container">
      <div class="about-grid">
        <div class="about-visual">
          <div class="about-card-big">📿</div>
          <div class="about-card-small"><h4>Permanent Jewellery</h4><p>Welded on. Worn forever.</p></div>
        </div>
        <div>
          <span class="sec-eyebrow">Our Story</span>
          <h2 class="sec-title" style="margin-bottom:20px">From Beads to <em>Forever Pieces</em></h2>
          <p class="about-body">What started as a love for beaded accessories grew into Pakistan's go-to handmade jewellery brand — offering everything from playful phone charms to permanent bracelets welded right onto your wrist.</p>
          <p class="about-body">Every piece is handpicked with intention. We believe jewellery should feel like <em style="font-family:'Cormorant Garamond',serif;font-style:italic;color:var(--p2)">you</em>.</p>
          <button class="btn-outline" onclick="navigate('about')" style="border-radius:50px">Our Story →</button>
        </div>
      </div>
    </div>
  </section>

  <div class="insta-label">✦ Follow us <a href="https://instagram.com/beads_ncharmss" target="_blank" rel="noopener">@beads_ncharmss</a> ✦</div>
  <div class="insta-strip">
    ${[['linear-gradient(135deg,#E8D5F5,#C4A8D8)','📿'],['linear-gradient(135deg,#F7F3EE,#E8D5F5)','💜'],['linear-gradient(135deg,#C4A8D8,#9B7BB8)','✨'],['linear-gradient(135deg,#EDE6DC,#E8D5F5)','💍'],['linear-gradient(135deg,#9B7BB8,#6B4E9B)','📱'],['linear-gradient(135deg,#F7F3EE,#C4A8D8)','🌸']].map(([bg, em]) => `<a href="https://instagram.com/beads_ncharmss" target="_blank" rel="noopener" class="insta-tile" style="background:${bg}">${em}</a>`).join('')}
  </div>

  <section class="newsletter-section">
    <div class="newsletter-inner">
      <h2>Get Exclusive Offers 💜</h2>
      <p>New arrivals, restocks & member-only discounts — first in your inbox.</p>
      <div class="newsletter-form">
        <input type="email" id="nlEmail" placeholder="your@email.com">
        <button onclick="handleNewsletter()">Subscribe</button>
      </div>
      <p style="font-size:11px;opacity:.6;margin-top:10px">No spam. Unsubscribe anytime.</p>
    </div>
  </section>
  </main>` + footerHTML();
}

async function handleNewsletter() {
  const email = document.getElementById('nlEmail')?.value.trim();
  if (!email || !email.includes('@')) { toast('Please enter a valid email', 'err'); return; }
  const ok = await DB.subscribe(email, '');
  if (ok) { toast('Subscribed! Welcome to Beads N Charms 💜'); document.getElementById('nlEmail').value = ''; }
  else toast('Already subscribed!', 'info');
}

// ── SHOP ──────────────────────────────────────────────────────
function renderShop(filterCat = null) {
  const cats = DB.getCats();
  const isSale = filterCat === 'sale';
  const activeCat = isSale ? null : filterCat;
  let prods = DB.getProds();
  if (isSale) prods = prods.filter(p => p.on_sale);
  else if (activeCat) prods = prods.filter(p => p.category_id === activeCat);
  const label = activeCat ? catName(activeCat) : isSale ? 'Sale' : 'All Products';

  DB.track('page_view', { page: 'shop', category: filterCat });

  return navHTML('shop') + `
  <div class="shop-hero">
    <div class="shop-hero-inner">
      <div class="breadcrumb"><a onclick="navigate('home')">Home</a><span>/</span>Shop${activeCat ? `<span>/</span>${label}` : ''}${isSale ? '<span>/</span>Sale' : ''}</div>
      <h1 class="sec-title" style="margin-bottom:8px">${label}</h1>
    </div>
  </div>
  <div class="shop-layout">
    <aside class="sidebar">
      <div class="sidebar-section">
        <div class="sidebar-title">Categories</div>
        <div class="filter-opt ${!activeCat && !isSale ? 'active' : ''}" onclick="navigate('shop')">All Products</div>
        <div class="filter-opt ${isSale ? 'active' : ''}" onclick="navigate('shop','sale')">🏷️ On Sale</div>
        ${cats.map(c => `<div class="filter-opt ${activeCat === c.id ? 'active' : ''}" onclick="navigate('shop','${c.id}')">
          ${c.emoji} ${esc(c.name)}
          <span class="filter-opt-count">${DB.getProds().filter(p => p.category_id === c.id).length}</span>
        </div>`).join('')}
      </div>
      <div class="sidebar-section">
        <div class="sidebar-title">Filter</div>
        <label class="filter-opt"><input type="checkbox" id="fInstock" onchange="applyShopFilters()"> In Stock Only</label>
        <label class="filter-opt"><input type="checkbox" id="fFeatured" onchange="applyShopFilters()"> Featured</label>
      </div>
      <div class="sidebar-section">
        <div class="sidebar-title">Sort</div>
        <select class="sort-sel" id="shopSort" onchange="applyShopFilters()">
          <option value="default">Default</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
          <option value="name">Name A–Z</option>
          <option value="sale">Sale First</option>
          <option value="new">Newest First</option>
        </select>
      </div>
    </aside>
    <div>
      <div class="shop-topbar">
        <div>
          <h2 id="shopResultTitle" style="font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:500">${label}</h2>
          <div class="shop-count" id="shopCount">${prods.length} products</div>
        </div>
      </div>
      <div class="products-grid" id="shopGrid">${prods.map(productCardHTML).join('') || '<div class="empty-grid">No products found.</div>'}</div>
    </div>
  </div>` + footerHTML();
}

function applyShopFilters() {
  let prods = DB.getProds();
  const cat = _currentData;
  if (cat === 'sale') prods = prods.filter(p => p.on_sale);
  else if (cat) prods = prods.filter(p => p.category_id === cat);
  if (document.getElementById('fInstock')?.checked) prods = prods.filter(p => p.in_stock);
  if (document.getElementById('fFeatured')?.checked) prods = prods.filter(p => p.featured);
  const sort = document.getElementById('shopSort')?.value;
  if (sort === 'price-asc') prods.sort((a, b) => salePrice(a) - salePrice(b));
  else if (sort === 'price-desc') prods.sort((a, b) => salePrice(b) - salePrice(a));
  else if (sort === 'name') prods.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === 'sale') prods.sort((a, b) => b.on_sale - a.on_sale);
  const grid = document.getElementById('shopGrid');
  if (grid) grid.innerHTML = prods.map(productCardHTML).join('') || '<div class="empty-grid">No products found.</div>';
  const count = document.getElementById('shopCount');
  if (count) count.textContent = prods.length + ' products';
}

// ── PRODUCT DETAIL ────────────────────────────────────────────
async function renderProductPage(id) {
  const p = DB.getProd(id);
  if (!p) return navHTML() + `<div style="padding:80px;text-align:center"><h2 style="font-family:'Cormorant Garamond',serif">Product not found</h2><button class="btn-fill" onclick="navigate('shop')" style="margin-top:20px;border-radius:50px;padding:12px 28px">Back to Shop</button></div>` + footerHTML();

  DB.track('product_view', { product_id: id });
  const sp = salePrice(p);
  const related = DB.getProds().filter(r => r.id !== p.id && r.category_id === p.category_id).slice(0, 4);
  const reviews = await DB.getReviews(id);
  const avgRating = reviews.length ? Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0;

  // Gallery
  const allImages = [p.image_url, ...(p.images || [])].filter(Boolean);
  const galleryHTML = allImages.length
    ? `<div class="pdp-main-img" id="mainImg" style="background:${p.color}">
        <img src="${allImages[0]}" id="mainImgEl" alt="${esc(p.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:24px" onerror="this.outerHTML='<span style=\\"font-size:7rem\\">${p.emoji}</span>'">
       </div>
       <div class="pdp-thumb-row">
         ${allImages.map((img, i) => `<div class="pdp-thumb ${i === 0 ? 'active' : ''}" onclick="switchImg('${img}',this)">
           <img src="${img}" style="width:100%;height:100%;object-fit:cover;border-radius:8px">
         </div>`).join('')}
         ${allImages.length === 0 ? `<div class="pdp-thumb active" style="background:${p.color}">${p.emoji}</div>` : ''}
       </div>`
    : `<div class="pdp-main-img" style="background:${p.color}"><span style="font-size:7rem">${p.emoji}</span></div>`;

  // Variants
  const variantsHTML = p.has_variants && p.variants?.length
    ? p.variants.map(v => `
      <div style="margin-bottom:16px">
        <label style="font-size:12px;font-weight:600;color:var(--dk);display:block;margin-bottom:8px">${esc(v.name)}</label>
        <div style="display:flex;gap:8px;flex-wrap:wrap" id="variant-${v.name.replace(/\s/g,'')}">
          ${v.options.map(opt => `<button class="variant-btn" onclick="selectVariant('${esc(v.name)}','${opt}',this)" 
            style="padding:8px 16px;border:1.5px solid rgba(196,168,216,.4);border-radius:8px;font-size:13px;background:#fff;cursor:pointer;transition:all .15s">
            ${opt}
          </button>`).join('')}
        </div>
      </div>`).join('')
    : '';

  const priceHTML = p.on_sale
    ? `<span class="pdp-orig">${formatPKR(p.price)}</span><span class="pdp-sale">${formatPKR(sp)}</span><span class="pdp-pct">-${p.sale_percent}%</span>`
    : `<span class="pdp-price">${formatPKR(p.price)}</span>`;

  return navHTML('shop') + `
  <div class="container" style="padding-top:24px">
    <div class="breadcrumb">
      <a onclick="navigate('home')">Home</a><span>/</span>
      <a onclick="navigate('shop')">Shop</a><span>/</span>
      <a onclick="navigate('shop','${p.category_id}')">${catName(p.category_id)}</a><span>/</span>
      ${esc(p.name)}
    </div>
  </div>
  <div class="pdp-wrap" itemscope itemtype="https://schema.org/Product">
    <div class="pdp-gallery">${galleryHTML}</div>
    <div class="pdp-info">
      <div class="pdp-cat">${catName(p.category_id)}</div>
      <h1 class="pdp-name" itemprop="name">${esc(p.name)}</h1>
      ${reviews.length ? `<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
        <div>${starsHTML(avgRating)}</div>
        <span style="font-size:13px;color:var(--lt)">${reviews.length} review${reviews.length !== 1 ? 's' : ''}</span>
      </div>` : ''}
      <div class="pdp-prices" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
        ${priceHTML}
        <meta itemprop="price" content="${sp}">
        <meta itemprop="priceCurrency" content="PKR">
        <meta itemprop="availability" content="${p.in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'}">
      </div>
      ${p.stock_qty <= CONFIG.LOW_STOCK_THRESHOLD && p.stock_qty > 0 && p.in_stock ? `<div style="font-size:12px;color:var(--sale);font-weight:600;margin-bottom:12px">⚠️ Only ${p.stock_qty} left in stock!</div>` : ''}
      ${!p.in_stock ? '<div class="badge-oos" style="display:inline-block;margin-bottom:16px;padding:6px 14px;border-radius:8px">Currently Out of Stock</div>' : ''}
      <p class="pdp-desc" itemprop="description">${esc(p.description || '')}</p>
      ${variantsHTML}
      <input type="hidden" id="selectedVariant" value="">
      <button class="pdp-add ${!p.in_stock ? 'oos' : ''}" id="addToCartBtn"
        onclick="${p.in_stock ? `addToCartWithVariant('${p.id}')` : ''}" ${!p.in_stock ? 'disabled' : ''}>
        ${p.in_stock ? '+ Add to Cart' : 'Out of Stock'}
      </button>
      <div class="pdp-tags">${(p.tags || []).map(t => `<span class="pdp-tag">#${t}</span>`).join('')}</div>
      <div class="pdp-info-strip">
        <div class="pdp-info-item"><div class="pdp-info-icon">🚚</div><div class="pdp-info-label">Free Delivery</div><div class="pdp-info-sub">Orders above ${formatPKR(CONFIG.FREE_DELIVERY_THRESHOLD)}</div></div>
        <div class="pdp-info-item"><div class="pdp-info-icon">📦</div><div class="pdp-info-label">Cash on Delivery</div><div class="pdp-info-sub">Pay when it arrives</div></div>
        <div class="pdp-info-item"><div class="pdp-info-icon">💜</div><div class="pdp-info-label">Handcrafted</div><div class="pdp-info-sub">Made in Pakistan</div></div>
      </div>
    </div>
  </div>

  ${reviews.length ? `<div class="container" style="padding-bottom:40px">
    <h2 style="font-family:'Cormorant Garamond',serif;font-size:28px;margin-bottom:24px">Customer Reviews</h2>
    <div style="display:flex;flex-direction:column;gap:16px">
      ${reviews.slice(0, 5).map(r => `
        <div style="background:#fff;border-radius:14px;padding:20px;border:1px solid rgba(196,168,216,.15)">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
            <strong style="font-size:14px">${esc(r.customer_name)}</strong>
            <div>${starsHTML(r.rating)}</div>
          </div>
          <p style="font-size:13px;color:var(--mid)">${esc(r.comment || '')}</p>
        </div>`).join('')}
    </div>
  </div>` : ''}

  <div class="container" style="padding-bottom:20px">
    <div style="background:#fff;border-radius:16px;padding:24px;border:1px solid rgba(196,168,216,.15);max-width:480px">
      <h3 style="font-family:'Cormorant Garamond',serif;font-size:20px;margin-bottom:16px">Write a Review</h3>
      <div style="margin-bottom:12px">
        <label style="font-size:12px;font-weight:600;display:block;margin-bottom:6px">Your Name</label>
        <input class="form-input" id="revName" placeholder="Name">
      </div>
      <div style="margin-bottom:12px">
        <label style="font-size:12px;font-weight:600;display:block;margin-bottom:6px">Rating</label>
        <div id="starPicker" style="display:flex;gap:4px;font-size:24px;cursor:pointer">
          ${[1,2,3,4,5].map(n => `<span onclick="setReviewRating(${n})" id="star${n}" style="color:#ddd;transition:color .1s">★</span>`).join('')}
        </div>
        <input type="hidden" id="revRating" value="0">
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:12px;font-weight:600;display:block;margin-bottom:6px">Comment (optional)</label>
        <textarea class="form-input" id="revComment" rows="3" placeholder="Share your experience…"></textarea>
      </div>
      <button class="btn-fill" onclick="submitProductReview('${p.id}')" style="border-radius:50px;padding:12px 28px;font-size:13px">Submit Review</button>
    </div>
  </div>

  ${related.length ? `<div class="related-section"><div class="container">
    <div class="sec-hdr"><div><div class="sec-eyebrow">More from ${catName(p.category_id)}</div><h2 class="sec-title">You May Also <em>Like</em></h2></div></div>
    <div class="products-grid">${related.map(productCardHTML).join('')}</div>
  </div></div>` : ''}
  ` + footerHTML();
}

function switchImg(src, el) {
  const mainEl = document.getElementById('mainImgEl');
  if (mainEl) mainEl.src = src;
  document.querySelectorAll('.pdp-thumb').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

let _selectedVariants = {};
function selectVariant(name, value, btn) {
  _selectedVariants[name] = value;
  const container = document.getElementById('variant-' + name.replace(/\s/g, ''));
  if (container) container.querySelectorAll('.variant-btn').forEach(b => {
    b.style.borderColor = b.textContent.trim() === value ? 'var(--p1)' : 'rgba(196,168,216,.4)';
    b.style.background  = b.textContent.trim() === value ? 'var(--p6)' : '#fff';
    b.style.color       = b.textContent.trim() === value ? 'var(--p1)' : 'inherit';
  });
  document.getElementById('selectedVariant').value = Object.entries(_selectedVariants).map(([k, v]) => `${k}: ${v}`).join(', ');
}

function addToCartWithVariant(id) {
  const p = DB.getProd(id);
  if (!p) return;
  if (p.has_variants && p.variants?.length) {
    const required = p.variants.map(v => v.name);
    const missing = required.filter(n => !_selectedVariants[n]);
    if (missing.length) { toast('Please select: ' + missing.join(', '), 'err'); return; }
  }
  const variant = document.getElementById('selectedVariant')?.value || null;
  addToCart(id, variant);
}

function setReviewRating(n) {
  document.getElementById('revRating').value = n;
  [1,2,3,4,5].forEach(i => {
    const el = document.getElementById('star' + i);
    if (el) el.style.color = i <= n ? '#f0ad4e' : '#ddd';
  });
}

async function submitProductReview(productId) {
  const name   = document.getElementById('revName')?.value.trim();
  const rating = parseInt(document.getElementById('revRating')?.value || '0');
  const comment = document.getElementById('revComment')?.value.trim();
  if (!name)   { toast('Please enter your name', 'err'); return; }
  if (!rating) { toast('Please select a rating', 'err'); return; }
  const ok = await DB.submitReview(productId, name, rating, comment);
  if (ok) toast('Review submitted! It will appear after approval 💜');
  else    toast('Could not submit review. Please try again.', 'err');
}

// ── CHECKOUT ──────────────────────────────────────────────────
function renderCheckout() {
  const items = Cart.get();
  if (!items.length) return navHTML() + `<div style="padding:100px;text-align:center">
    <h2 style="font-family:'Cormorant Garamond',serif;font-size:32px;margin-bottom:12px">Your cart is empty</h2>
    <button class="btn-fill" onclick="navigate('shop')" style="border-radius:50px;padding:14px 32px;font-size:13px">Browse Shop</button>
  </div>` + footerHTML();

  const sub = Cart.total();
  const del = sub >= CONFIG.FREE_DELIVERY_THRESHOLD ? 0 : CONFIG.DELIVERY_FEE;

  return navHTML() + `
  <div class="container" style="padding-top:24px">
    <div class="breadcrumb"><a onclick="navigate('home')">Home</a><span>/</span>Checkout</div>
  </div>
  <div class="checkout-wrap">
    <div>
      <div class="checkout-form">
        <h3>Delivery Details</h3>
        <div class="form-row">
          <div class="form-field">
            <label class="form-label">First Name <span style="color:var(--sale)">*</span></label>
            <input class="form-input" id="coFN" placeholder="Sami">
          </div>
          <div class="form-field">
            <label class="form-label">Last Name</label>
            <input class="form-input" id="coLN" placeholder="Khan">
          </div>
        </div>
        <div class="form-field">
          <label class="form-label">Email Address <span style="color:var(--sale)">*</span></label>
          <input class="form-input" id="coEmail" type="email" placeholder="your@email.com" required>
          <div style="font-size:11px;color:var(--lt);margin-top:4px">✉️ Order confirmation sent here</div>
        </div>
        <div class="form-field">
          <label class="form-label">Phone Number <span style="color:var(--sale)">*</span></label>
          <input class="form-input" id="coPhone" placeholder="+92 300 0000000">
        </div>
        <div class="form-field">
          <label class="form-label">Street Address <span style="color:var(--sale)">*</span></label>
          <input class="form-input" id="coAddr" placeholder="House 12, Street 4, Block A">
        </div>
        <div class="form-row">
          <div class="form-field">
            <label class="form-label">City <span style="color:var(--sale)">*</span></label>
            <input class="form-input" id="coCity" placeholder="Islamabad">
          </div>
          <div class="form-field">
            <label class="form-label">Province</label>
            <select class="form-input" id="coProv">
              <option value="">Select…</option>
              <option>Punjab</option><option>Sindh</option><option>KPK</option>
              <option>Balochistan</option><option>Islamabad (Federal)</option>
              <option>AJK</option><option>Gilgit-Baltistan</option>
            </select>
          </div>
        </div>
        <div class="form-field">
          <label class="form-label">Order Notes</label>
          <textarea class="form-input" id="coNotes" placeholder="Special instructions or customisation requests…"></textarea>
        </div>
      </div>

      <div class="checkout-form" style="margin-top:20px">
        <h3>Discount Code</h3>
        <div style="display:flex;gap:10px">
          <input class="form-input" id="discountInput" placeholder="Enter code e.g. WELCOME10" style="flex:1;text-transform:uppercase">
          <button class="btn-fill btn-sm" onclick="applyDiscount()" style="border-radius:50px;white-space:nowrap;padding:12px 20px">Apply</button>
        </div>
        <div id="discountMsg" style="font-size:13px;margin-top:8px;display:none"></div>
      </div>

      <div class="checkout-form" style="margin-top:20px">
        <h3>Payment Method</h3>
        <div class="pay-opts">
          <label class="pay-opt sel" id="payOpt-cod">
            <input type="radio" name="payment" value="cod" checked onchange="selectPayOpt('cod')">
            <div><div class="pay-opt-name">💵 Cash on Delivery</div><div class="pay-opt-desc">Pay when your order arrives</div></div>
            <span class="pay-opt-chip chip-avail">Available</span>
          </label>
          <label class="pay-opt" id="payOpt-easypaisa">
            <input type="radio" name="payment" value="easypaisa" onchange="selectPayOpt('easypaisa')">
            <div><div class="pay-opt-name">📱 EasyPaisa</div><div class="pay-opt-desc">Send to our account & share screenshot</div></div>
            <span class="pay-opt-chip" style="background:var(--p5);color:var(--p1)">Manual</span>
          </label>
          <label class="pay-opt" id="payOpt-jazzcash">
            <input type="radio" name="payment" value="jazzcash" onchange="selectPayOpt('jazzcash')">
            <div><div class="pay-opt-name">💜 JazzCash</div><div class="pay-opt-desc">Send to our account & share screenshot</div></div>
            <span class="pay-opt-chip" style="background:var(--p5);color:var(--p1)">Manual</span>
          </label>
        </div>
        <div class="manual-note" id="manualNote">
          📲 After placing your order, send payment to <strong>+92 320 5586296</strong> and WhatsApp us your screenshot to confirm.
        </div>
      </div>
    </div>

    <div class="checkout-sidebar">
      <div class="order-card">
        <h3>Order Summary</h3>
        <div class="order-items">
          ${items.map(item => {
            const p = DB.getProd(item.id);
            if (!p) return '';
            const sp = Cart.salePrice(p);
            const img = p.image_url ? `<img src="${p.image_url}" style="width:100%;height:100%;object-fit:cover;border-radius:10px">` : p.emoji;
            return `<div class="oi-row">
              <div class="oi-thumb" style="background:${p.color}">${img}</div>
              <div class="oi-name">${esc(p.name)}${item.variant ? `<div class="oi-qty">${esc(item.variant)}</div>` : ''}
                <div class="oi-qty">× ${item.qty}</div>
              </div>
              <div class="oi-price">${formatPKR(sp * item.qty)}</div>
            </div>`;
          }).join('')}
        </div>
        <hr class="order-divider">
        <div class="summary-row"><span>Subtotal</span><span>${formatPKR(sub)}</span></div>
        <div class="summary-row" id="discountRow" style="display:none;color:var(--green)"><span>Discount</span><span id="discountRowAmt"></span></div>
        <div class="summary-row"><span>Delivery</span><span id="deliveryDisplay">${del === 0 ? '<span style="color:var(--green);font-weight:600">FREE</span>' : formatPKR(del)}</span></div>
        <div class="summary-grand"><span>Total</span><span id="totalDisplay">${formatPKR(sub + del)}</span></div>
        ${del === 0 ? '<p class="free-del">Free delivery applied ✓</p>' : ''}
        <button class="place-btn" id="placeOrderBtn" onclick="placeOrder()">Place Order ✦</button>
        <p class="secure-note">🔒 Secure · Order confirmation via email & WhatsApp</p>
      </div>
    </div>
  </div>` + footerHTML();
}

// Discount state
let _discountData = null;

async function applyDiscount() {
  const code = document.getElementById('discountInput')?.value.trim();
  const msgEl = document.getElementById('discountMsg');
  if (!code) { toast('Please enter a discount code', 'err'); return; }
  const sub = Cart.total();
  const result = await DB.validateDiscount(code, sub);
  if (msgEl) {
    msgEl.style.display = 'block';
    msgEl.style.color = result.valid ? 'var(--green)' : 'var(--sale)';
    msgEl.textContent = result.msg;
  }
  if (result.valid) {
    _discountData = { code, amount: result.discount, type: result.type };
    updateOrderTotal();
    toast(result.msg + ' 🎉');
  } else {
    _discountData = null;
    updateOrderTotal();
  }
}

function updateOrderTotal() {
  const sub = Cart.total();
  let del = sub >= CONFIG.FREE_DELIVERY_THRESHOLD ? 0 : CONFIG.DELIVERY_FEE;
  let discountAmt = 0;
  if (_discountData) {
    discountAmt = _discountData.amount;
    if (_discountData.type === 'free_delivery') del = 0;
  }
  const total = Math.max(0, sub - discountAmt + del);
  const discountRow = document.getElementById('discountRow');
  const discountRowAmt = document.getElementById('discountRowAmt');
  const deliveryEl = document.getElementById('deliveryDisplay');
  const totalEl = document.getElementById('totalDisplay');
  if (discountRow) discountRow.style.display = _discountData ? 'flex' : 'none';
  if (discountRowAmt) discountRowAmt.textContent = '-' + formatPKR(discountAmt);
  if (deliveryEl) deliveryEl.innerHTML = del === 0 ? '<span style="color:var(--green);font-weight:600">FREE</span>' : formatPKR(del);
  if (totalEl) totalEl.textContent = formatPKR(total);
}

function selectPayOpt(val) {
  document.querySelectorAll('.pay-opt').forEach(el => el.classList.remove('sel'));
  document.getElementById('payOpt-' + val)?.classList.add('sel');
  const note = document.getElementById('manualNote');
  if (note) note.className = 'manual-note' + (val !== 'cod' ? ' show' : '');
}

async function placeOrder() {
  const fn    = document.getElementById('coFN')?.value.trim();
  const email = document.getElementById('coEmail')?.value.trim();
  const phone = document.getElementById('coPhone')?.value.trim();
  const addr  = document.getElementById('coAddr')?.value.trim();
  const city  = document.getElementById('coCity')?.value.trim();
  if (!fn)    { toast('Please enter your first name', 'err'); return; }
  if (!email || !email.includes('@')) { toast('A valid email is required', 'err'); return; }
  if (!phone) { toast('Phone number is required', 'err'); return; }
  if (!addr)  { toast('Delivery address is required', 'err'); return; }
  if (!city)  { toast('City is required', 'err'); return; }
  if (!Cart.get().length) { toast('Your cart is empty', 'err'); return; }

  const btn = document.getElementById('placeOrderBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Placing order…'; }

  const sub = Cart.total();
  let del = sub >= CONFIG.FREE_DELIVERY_THRESHOLD ? 0 : CONFIG.DELIVERY_FEE;
  let discountAmt = 0;
  if (_discountData) { discountAmt = _discountData.amount; if (_discountData.type === 'free_delivery') del = 0; }
  const total = Math.max(0, sub - discountAmt + del);
  const payment = document.querySelector('input[name=payment]:checked')?.value || 'cod';

  const cartItems = Cart.get().map(i => {
    const p = DB.getProd(i.id);
    return { id: i.id, name: p?.name || '', price: p ? Cart.salePrice(p) : 0, qty: i.qty, variant: i.variant || null };
  });

  // Save abandoned cart data first (in case they abandon)
  await DB.saveAbandonedCart(email, phone, cartItems);

  const orderId = await DB.saveOrder({
    name: fn + ' ' + (document.getElementById('coLN')?.value || '').trim(),
    email, phone, address: addr, city,
    province: document.getElementById('coProv')?.value || '',
    notes: document.getElementById('coNotes')?.value || '',
    payment, subtotal: sub, delivery: del, total,
    discountCode: _discountData?.code || null,
    discountAmount: discountAmt,
    items: cartItems
  });

  DB.track('purchase', { order_id: orderId, total });
  Cart.clear();
  _discountData = null;

  document.getElementById('successOrderId').textContent = orderId;
  document.getElementById('successModal')?.classList.add('open');
}

// ── ORDER TRACKING ────────────────────────────────────────────
function renderTrack() {
  return navHTML() + `
  <div style="max-width:560px;margin:80px auto;padding:0 24px">
    <div style="text-align:center;margin-bottom:40px">
      <div class="sec-eyebrow">Track your order</div>
      <h1 class="sec-title">Order <em>Status</em></h1>
    </div>
    <div style="background:#fff;border-radius:20px;padding:36px;border:1px solid rgba(196,168,216,.15)">
      <div class="form-field">
        <label class="form-label">Order ID</label>
        <input class="form-input" id="trackOrderId" placeholder="ORD-1234567890">
      </div>
      <div class="form-field">
        <label class="form-label">Email Address</label>
        <input class="form-input" id="trackEmail" type="email" placeholder="your@email.com">
      </div>
      <button class="btn-fill" onclick="trackOrder()" style="width:100%;border-radius:50px;padding:14px;font-size:13px;font-weight:600">Track Order →</button>
      <div id="trackResult" style="margin-top:20px"></div>
    </div>
  </div>` + footerHTML();
}

async function trackOrder() {
  const orderId = document.getElementById('trackOrderId')?.value.trim();
  const email   = document.getElementById('trackEmail')?.value.trim();
  const result  = document.getElementById('trackResult');
  if (!orderId || !email) { toast('Please enter your Order ID and email', 'err'); return; }
  result.innerHTML = '<p style="color:var(--lt);font-size:13px">Looking up your order…</p>';
  try {
    const orders = await sbFetch(`orders?id=eq.${orderId}&customer_email=eq.${email}`);
    if (!orders?.length) { result.innerHTML = '<p style="color:var(--sale);font-size:13px">Order not found. Please check your Order ID and email.</p>'; return; }
    const o = orders[0];
    const statusColors = { pending:'#856404', confirmed:'#27643a', processing:'#004085', shipped:'#0c5460', delivered:'#27643a', cancelled:'#8b1a23' };
    const statusBg = { pending:'#fff3cd', confirmed:'#d4edda', processing:'#cce5ff', shipped:'#d1ecf1', delivered:'#d4edda', cancelled:'#fde8e6' };
    result.innerHTML = `
      <div style="border-radius:14px;padding:24px;border:1px solid rgba(196,168,216,.15);background:#fff">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <strong style="font-size:14px">${o.id}</strong>
          <span style="background:${statusBg[o.status]||'#eee'};color:${statusColors[o.status]||'#333'};padding:5px 12px;border-radius:20px;font-size:12px;font-weight:700;text-transform:capitalize">${esc(o.status)}</span>
        </div>
        <div style="font-size:13px;color:var(--mid)">
          <div style="margin-bottom:6px">📅 Placed: ${new Date(o.created_at).toLocaleDateString('en-PK', { day:'numeric', month:'long', year:'numeric' })}</div>
          <div style="margin-bottom:6px">📦 Items: ${formatPKR(o.subtotal)}</div>
          <div style="margin-bottom:6px">🚚 Delivery: ${o.delivery === 0 ? 'FREE' : formatPKR(o.delivery)}</div>
          <div style="font-weight:700;color:var(--dk);margin-top:10px">Total Paid: ${formatPKR(o.total)}</div>
          ${o.tracking_number ? `<div style="margin-top:10px;padding:10px;background:var(--p6);border-radius:8px">📦 Tracking: <strong>${esc(o.tracking_number)}</strong></div>` : ''}
        </div>
      </div>`;
  } catch(e) { result.innerHTML = '<p style="color:var(--sale);font-size:13px">Could not fetch order. Please try again.</p>'; }
}

// ── ABOUT ─────────────────────────────────────────────────────
function renderAbout() {
  return navHTML('about') + `
  <div style="background:var(--p6);padding:56px 32px;border-bottom:1px solid rgba(196,168,216,.15)">
    <div style="max-width:1100px;margin:0 auto">
      <div class="sec-eyebrow" style="margin-bottom:10px">Who we are</div>
      <h1 class="sec-title">About Beads <em>N</em> Charms</h1>
    </div>
  </div>
  <div class="about-page">
    <div class="about-hero-split">
      <div>
        <span class="sec-eyebrow">Our Story</span>
        <h2 class="sec-title" style="margin-bottom:20px">From Beads to <em>Forever Pieces</em></h2>
        <p style="font-size:15px;color:var(--mid);line-height:1.85;margin-bottom:16px">Beads N Charms began as a simple love for beaded accessories — colourful, playful, and personal. What started as handmade bracelets gifted to friends quickly grew into one of Pakistan's favourite handmade jewellery brands.</p>
        <p style="font-size:15px;color:var(--mid);line-height:1.85;margin-bottom:32px">Today, we offer a full range of handpicked jewellery online — from delicate charms and beaded bracelets to permanent jewellery, welded right onto your wrist. We ship across Pakistan with Cash on Delivery available.</p>
        <button class="btn-fill" onclick="navigate('shop')" style="border-radius:50px;padding:14px 32px;font-size:13px">Shop the Collection</button>
      </div>
      <div style="background:var(--p6);border-radius:24px;height:400px;display:flex;align-items:center;justify-content:center;font-size:7rem">📿</div>
    </div>
    <div style="text-align:center;margin-bottom:32px"><span class="sec-eyebrow">Our Values</span><h2 class="sec-title">What We Stand <em>For</em></h2></div>
    <div class="values-row">
      <div class="value-card"><div class="value-icon-big">💜</div><h3>Handcrafted with Love</h3><p>Every piece is made with care, attention, and a genuine love for the craft. No mass production — only intentional pieces.</p></div>
      <div class="value-card"><div class="value-icon-big">✨</div><h3>Pinterest-Inspired</h3><p>We curate aesthetics you actually pin — delicate, dreamy, and editorial. Your mood board, brought to life.</p></div>
      <div class="value-card"><div class="value-icon-big">📍</div><h3>Pakistan-Made</h3><p>Proudly Pakistani. We support local craftsmanship and ship nationwide with cash on delivery across Pakistan.</p></div>
    </div>
    <div class="perm-banner">
      <div><h2>Permanent Jewellery ✦</h2><p>Our signature service — a fine chain bracelet, anklet, or necklace welded onto your body with no clasp. It stays forever. Available at our pop-up stalls.</p></div>
      <button class="btn-white" onclick="navigate('contact')" style="border-radius:50px;padding:14px 28px;white-space:nowrap">Book a Session →</button>
    </div>
  </div>` + footerHTML();
}

// ── CONTACT ───────────────────────────────────────────────────
function renderContact() {
  return navHTML('contact') + `
  <div style="background:var(--p6);padding:56px 32px;border-bottom:1px solid rgba(196,168,216,.15)">
    <div style="max-width:1100px;margin:0 auto">
      <div class="sec-eyebrow" style="margin-bottom:10px">Get in touch</div>
      <h1 class="sec-title">Contact <em>Us</em></h1>
    </div>
  </div>
  <div class="contact-page">
    <div class="contact-info">
      <h2>Let's Talk <em style="font-family:'Cormorant Garamond',serif;font-style:italic;color:var(--p2)">Jewellery</em></h2>
      <p>Questions about an order, custom pieces, or permanent jewellery? We reply within a few hours.</p>
      <div class="contact-item"><div class="contact-icon">📸</div><div><h4>Instagram</h4><p><a href="https://instagram.com/beads_ncharmss" target="_blank" style="color:var(--p1)">@beads_ncharmss</a> — DMs open</p></div></div>
      <div class="contact-item"><div class="contact-icon">📱</div><div><h4>WhatsApp</h4><p><a href="https://wa.me/${CONFIG.WHATSAPP_NUMBER}" target="_blank" style="color:var(--p1)">+92 320 5586296</a></p></div></div>
      <div class="contact-item"><div class="contact-icon">📍</div><div><h4>Location</h4><p>Pakistan — shipping nationwide, COD available</p></div></div>
      <div class="contact-item"><div class="contact-icon">⏰</div><div><h4>Response Time</h4><p>Within 24 hours on all channels</p></div></div>
    </div>
    <div class="contact-form-card">
      <h3>Send a Message</h3>
      <div class="form-row">
        <div class="form-field"><label class="form-label">Name <span style="color:var(--sale)">*</span></label><input class="form-input" id="ctName" placeholder="Your name"></div>
        <div class="form-field"><label class="form-label">Phone / Instagram <span style="color:var(--sale)">*</span></label><input class="form-input" id="ctContact" placeholder="@handle or +92…"></div>
      </div>
      <div class="form-field"><label class="form-label">Subject</label>
        <select class="form-input" id="ctSubject">
          <option>General Question</option>
          <option>Order Inquiry</option>
          <option>Custom Order Request</option>
          <option>Permanent Jewellery Booking</option>
          <option>Bulk / Wholesale</option>
        </select>
      </div>
      <div class="form-field"><label class="form-label">Message <span style="color:var(--sale)">*</span></label><textarea class="form-input" id="ctMsg" rows="5" placeholder="Tell us what you have in mind…"></textarea></div>
      <button class="btn-fill" onclick="submitContact()" style="width:100%;border-radius:50px;padding:16px;font-size:13px;font-weight:600">Send Message ✦</button>
    </div>
  </div>
  <div class="modal-bg" id="contactSuccessModal">
    <div class="modal-box">
      <div class="modal-icon">💜</div>
      <div class="modal-title">Message Received!</div>
      <div class="modal-sub">We'll get back to you within 24 hours. DM us on Instagram too!</div>
      <button class="btn-fill" onclick="closeModal('contactSuccessModal');renderPage('home')" style="border-radius:50px;padding:14px 32px;font-size:13px">Back to Home</button>
    </div>
  </div>` + footerHTML();
}

async function submitContact() {
  const name    = document.getElementById('ctName')?.value.trim();
  const contact = document.getElementById('ctContact')?.value.trim();
  const msg     = document.getElementById('ctMsg')?.value.trim();
  if (!name || !contact || !msg) { toast('Please fill in all required fields', 'err'); return; }
  await DB.saveContact({ name, contact, subject: document.getElementById('ctSubject')?.value, message: msg, status: 'unread' });
  openModal('contactSuccessModal');
}
