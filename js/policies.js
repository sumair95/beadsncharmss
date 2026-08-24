// ============================================================
//  BEADS N CHARMS — Policy & Information Pages
//  Returns, Shipping, FAQ, Privacy, Terms
//  Each is registered in SEO_META (index.html) so it gets its
//  own URL, title, description and canonical.
// ============================================================

const policyCSS = `
<style>
.policy-wrap{max-width:900px;margin:0 auto;padding:56px 32px 80px}
.policy-wrap h2{font-family:'Cormorant Garamond',serif;font-size:30px;font-weight:500;color:var(--dk);margin:44px 0 14px}
.policy-wrap h2:first-of-type{margin-top:0}
.policy-wrap h3{font-size:16px;font-weight:600;color:var(--dk);margin:26px 0 8px}
.policy-wrap p,.policy-wrap li{font-size:15px;line-height:1.85;color:var(--mid)}
.policy-wrap p{margin-bottom:14px}
.policy-wrap ul,.policy-wrap ol{margin:0 0 18px 22px}
.policy-wrap li{margin-bottom:8px}
.policy-wrap strong{color:var(--dk);font-weight:600}
.policy-wrap a{color:var(--p2)}
.policy-card{background:var(--p6);border-left:3px solid var(--p2);border-radius:12px;padding:22px 26px;margin:24px 0}
.policy-card p:last-child{margin-bottom:0}
.policy-table{width:100%;border-collapse:collapse;margin:18px 0 26px;font-size:14px}
.policy-table th{text-align:left;padding:12px 14px;background:var(--p6);color:var(--dk);font-weight:600;font-size:13px;border-bottom:1px solid rgba(196,168,216,.3)}
.policy-table td{padding:12px 14px;border-bottom:1px solid rgba(196,168,216,.15);color:var(--mid)}
.policy-table-wrap{overflow-x:auto}
.faq-item{border-bottom:1px solid rgba(196,168,216,.2)}
.faq-q{width:100%;text-align:left;padding:20px 40px 20px 0;font-size:16px;font-weight:600;color:var(--dk);cursor:pointer;background:none;border:none;position:relative;font-family:inherit}
.faq-q::after{content:'+';position:absolute;right:8px;top:50%;transform:translateY(-50%);font-size:22px;color:var(--p2);font-weight:400}
.faq-item.open .faq-q::after{content:'-'}
.faq-a{display:none;padding:0 0 20px}
.faq-item.open .faq-a{display:block}
.policy-updated{font-size:13px;color:var(--lt);font-style:italic;margin-bottom:32px}
.policy-cta{margin-top:40px;display:flex;gap:12px;flex-wrap:wrap}
</style>`;

function policyDate() {
  return new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Shared page header
function policyHero(eyebrow, title, plainTitle, sub) {
  return `
  <div class="page-hero" style="background:var(--p6);padding:56px 32px;border-bottom:1px solid rgba(196,168,216,.15)">
    <div style="max-width:900px;margin:0 auto">
      <div class="breadcrumb"><a onclick="navigate('home')" href="/" style="cursor:pointer">Home</a><span>/</span>${esc(plainTitle)}</div>
      <div class="sec-eyebrow" style="margin-bottom:10px">${esc(eyebrow)}</div>
      <h1 class="sec-title">${title}</h1>
      ${sub ? `<p style="font-size:15px;color:var(--mid);margin-top:12px;max-width:640px;line-height:1.7">${sub}</p>` : ''}
    </div>
  </div>`;
}

// ── RETURNS & REFUNDS ─────────────────────────────────────────
function renderReturns() {
  return navHTML() + policyCSS + policyHero(
    'Shopping with confidence',
    'Returns &amp; <em>Refund Policy</em>',
    'Returns & Refunds',
    'Not quite right? You have <strong>7 days</strong> from delivery to request a return or exchange on eligible items.'
  ) + `
  <div class="policy-wrap">
    <p class="policy-updated">Last updated: ${policyDate()}</p>

    <h2>The short version</h2>
    <div class="policy-card">
      <p><strong>7 days</strong> to raise a return from the day your parcel arrives. Items must be unworn, undamaged and in their original packaging. Message us on WhatsApp at <strong>+92 320 5586296</strong> with your order number and a photo, and we will take it from there.</p>
    </div>

    <h2>What can be returned</h2>
    <p>We accept returns and exchanges on most of our handmade jewellery, provided the piece is in the same condition you received it — unworn, with no scratches, tarnishing or broken beads, and in its original packaging.</p>
    <div class="policy-table-wrap">
    <table class="policy-table">
      <thead><tr><th>Item</th><th>Returnable</th><th>Notes</th></tr></thead>
      <tbody>
        <tr><td>Bracelets, necklaces, earrings, keychains</td><td>Yes</td><td>Within 7 days, unworn</td></tr>
        <tr><td>Phone &amp; bag charms</td><td>Yes</td><td>Within 7 days, unused</td></tr>
        <tr><td>Faulty or damaged on arrival</td><td>Yes</td><td>Report within 48 hours with photos</td></tr>
        <tr><td>Wrong item sent</td><td>Yes</td><td>We cover return delivery</td></tr>
        <tr><td>Custom &amp; personalised pieces</td><td>No</td><td>Made specifically for you</td></tr>
        <tr><td>Permanent jewellery</td><td>No</td><td>Welded on at fitting — see below</td></tr>
        <tr><td>Sale items over 40% off</td><td>No</td><td>Final sale, exchange only</td></tr>
        <tr><td>Pierced earrings</td><td>No</td><td>Hygiene reasons, unless faulty</td></tr>
      </tbody>
    </table>
    </div>

    <h3>Why some items are excluded</h3>
    <p>Custom and personalised pieces are made to your specification and cannot be resold. Pierced earrings are excluded for hygiene reasons — standard practice for jewellery retailers, and it protects every customer. Permanent jewellery is welded directly onto your wrist or ankle at a fitting, so it cannot be returned; if the weld fails within 14 days we will re-weld it free of charge.</p>
    <p><strong>None of these exclusions apply to a faulty item.</strong> If something arrives broken, or develops a fault that is not normal wear, we will put it right regardless of category.</p>

    <h2>How to start a return</h2>
    <ol>
      <li><strong>Message us within 7 days.</strong> WhatsApp <strong>+92 320 5586296</strong> or DM <a href="https://instagram.com/beads_ncharmss" target="_blank" rel="noopener">@beads_ncharmss</a>. Include your order number and a clear photo of the item.</li>
      <li><strong>We confirm.</strong> We reply within 24 hours with the return address and next steps.</li>
      <li><strong>Post it back.</strong> Pack it securely in the original packaging and keep your receipt — you will need the tracking number.</li>
      <li><strong>We inspect and resolve.</strong> Once it arrives we check the item and process your exchange or refund within 3–5 working days.</li>
    </ol>

    <h2>Refunds</h2>
    <p>Refunds are issued by the same method you paid, wherever possible:</p>
    <ul>
      <li><strong>EasyPaisa / JazzCash</strong> — refunded to the same number within 3–5 working days of us receiving the item.</li>
      <li><strong>Cash on Delivery</strong> — refunded by EasyPaisa or JazzCash transfer to a number you nominate, since there is no card to reverse.</li>
    </ul>
    <p>The original delivery charge is refunded only where the item was faulty, damaged, or not what you ordered. For a change-of-mind return, return postage is yours to cover.</p>

    <h2>Exchanges</h2>
    <p>Want a different colour, size or piece entirely? Exchanges follow the same 7-day window. If the new item costs more you pay the difference; if it costs less we refund it. We cover delivery on the replacement for your first exchange on any order.</p>

    <h2>Damaged or faulty items</h2>
    <div class="policy-card">
      <p>Handmade means each piece is individually assembled, and occasionally something slips through. <strong>Report any damage within 48 hours of delivery</strong> with photos, and we will replace it or refund you in full, including all delivery charges. You will not be asked to pay return postage on a faulty item.</p>
    </div>
    <p>Please note that slight variations in bead colour, placement and finish are inherent to handmade jewellery and are not considered faults. Every piece is a little different — that is rather the point.</p>

    <h2>Caring for your jewellery</h2>
    <p>To keep your pieces looking their best and your warranty intact: keep them away from water, perfume and lotions; remove before swimming, showering or sleeping; and store them in the pouch they arrived in. Tarnishing caused by contact with water or chemicals is not covered as a fault.</p>

    <h2>Still need help?</h2>
    <p>WhatsApp <strong>+92 320 5586296</strong>, DM <a href="https://instagram.com/beads_ncharmss" target="_blank" rel="noopener">@beads_ncharmss</a>, or use our <a onclick="navigate('contact')" href="/contact" style="cursor:pointer">contact form</a>. We reply within 24 hours, every day.</p>

    <div class="policy-cta">
      <button class="btn-fill" onclick="navigate('track')">Track My Order</button>
      <button class="btn-outline" onclick="navigate('faq')">Read the FAQ</button>
    </div>
  </div>
  ` + footerHTML();
}

// ── SHIPPING & DELIVERY ───────────────────────────────────────
function renderShipping() {
  return navHTML() + policyCSS + policyHero(
    'Getting it to you',
    'Shipping &amp; <em>Delivery</em>',
    'Shipping & Delivery',
    'We deliver nationwide across Pakistan with <strong>Cash on Delivery</strong> available everywhere. Free delivery on orders above PKR 2,000.'
  ) + `
  <div class="policy-wrap">
    <p class="policy-updated">Last updated: ${policyDate()}</p>

    <h2>Delivery charges</h2>
    <div class="policy-table-wrap">
    <table class="policy-table">
      <thead><tr><th>Order value</th><th>Delivery charge</th></tr></thead>
      <tbody>
        <tr><td>PKR 2,000 and above</td><td><strong style="color:var(--green)">FREE</strong></td></tr>
        <tr><td>Below PKR 2,000</td><td>PKR 300 flat, anywhere in Pakistan</td></tr>
      </tbody>
    </table>
    </div>
    <p>One flat rate nationwide — Karachi, Lahore, Islamabad, Peshawar, Quetta, Gilgit or a village in between, the charge is the same.</p>

    <h2>How long it takes</h2>
    <div class="policy-table-wrap">
    <table class="policy-table">
      <thead><tr><th>Destination</th><th>Estimated delivery</th></tr></thead>
      <tbody>
        <tr><td>Islamabad &amp; Rawalpindi</td><td>1–2 working days</td></tr>
        <tr><td>Lahore, Karachi, Faisalabad, Multan</td><td>2–3 working days</td></tr>
        <tr><td>Other major cities</td><td>3–4 working days</td></tr>
        <tr><td>Remote areas, AJK, Gilgit-Baltistan</td><td>4–7 working days</td></tr>
      </tbody>
    </table>
    </div>
    <p>Orders are dispatched within <strong>1–2 working days</strong> of confirmation. Orders placed Friday or Saturday are dispatched the following Monday. These are courier estimates, not guarantees — during Eid, sale periods and heavy rain, expect a little longer.</p>

    <h2>Payment methods</h2>
    <ul>
      <li><strong>Cash on Delivery (COD)</strong> — pay the courier in cash when your parcel arrives. Available nationwide, no advance payment.</li>
      <li><strong>EasyPaisa</strong> — transfer to our account and send the screenshot on WhatsApp to confirm.</li>
      <li><strong>JazzCash</strong> — same process as EasyPaisa.</li>
    </ul>
    <div class="policy-card">
      <p>For EasyPaisa and JazzCash, place your order first, then send payment to <strong>+92 320 5586296</strong> and WhatsApp us the screenshot. We confirm and dispatch once payment shows.</p>
    </div>

    <h2>Tracking your parcel</h2>
    <p>Once dispatched we send your tracking number by WhatsApp. You can also check your order status any time on our <a onclick="navigate('track')" href="/track-order" style="cursor:pointer">order tracking page</a> using the order number from your confirmation.</p>

    <h2>If nobody is home</h2>
    <p>Our courier attempts delivery up to <strong>three times</strong>. Keep the phone number you gave at checkout switched on — couriers ring before arriving. After three failed attempts the parcel returns to us and we will contact you to arrange redelivery. Redelivery on a returned COD parcel is charged at PKR 300.</p>

    <h2>Checking your parcel</h2>
    <p>You are welcome to open and inspect your parcel at the door before paying. If something is wrong — wrong item, visibly damaged — refuse the delivery and we will sort it out at no cost to you. Once you have paid and the courier has left, report any problems within 48 hours under our <a onclick="navigate('returns')" href="/returns-policy" style="cursor:pointer">returns policy</a>.</p>

    <h2>Wrong address?</h2>
    <p>Message us on WhatsApp <strong>immediately</strong>. If the parcel has not been dispatched we will update it free. Once it is with the courier we may not be able to redirect it, and a re-delivery charge may apply.</p>

    <h2>International shipping</h2>
    <p>We currently ship within Pakistan only. If you are abroad and want a piece sent to a Pakistani address for family or a friend, that works perfectly — just enter their address at checkout. For international orders, message us on Instagram and we will see what we can arrange case by case.</p>

    <div class="policy-cta">
      <button class="btn-fill" onclick="navigate('track')">Track My Order</button>
      <button class="btn-outline" onclick="navigate('shop')">Start Shopping</button>
    </div>
  </div>
  ` + footerHTML();
}

// ── FAQ ───────────────────────────────────────────────────────
const FAQS = [
  ['Do you deliver across Pakistan?',
   'Yes — we deliver nationwide, including AJK and Gilgit-Baltistan. Delivery is PKR 300 flat, and free on orders above PKR 2,000. Most major cities receive orders in 2 to 3 working days.'],
  ['Is Cash on Delivery available?',
   'Yes, COD is available everywhere we deliver, with no advance payment. You pay the courier in cash when your parcel arrives, and you can inspect it at the door before paying. We also accept EasyPaisa and JazzCash.'],
  ['How long will my order take?',
   'Orders are dispatched within 1 to 2 working days. After that, expect 1 to 2 days for Islamabad and Rawalpindi, 2 to 3 days for other major cities, and 4 to 7 days for remote areas. You get a tracking number by WhatsApp once it ships.'],
  ['Can I return something if I change my mind?',
   'Yes. You have 7 days from delivery to request a return, as long as the piece is unworn and in its original packaging. Custom pieces, pierced earrings and permanent jewellery are excluded. See our returns policy for the full detail.'],
  ['What is permanent jewellery?',
   'A fine chain bracelet, anklet or necklace welded directly onto you — no clasp, so it never comes off. It is fitted in person at our pop-up events or a private session. Message us on Instagram to find out when we are next near you.'],
  ['Will my jewellery tarnish?',
   'Our gold-filled and surgical steel pieces resist tarnishing well. To keep them looking new, remove them before showering, swimming or sleeping, and keep them away from perfume and lotion. Store them in the pouch they arrived in.'],
  ['Are the pieces hypoallergenic?',
   'Our earrings use surgical steel posts, which suit most sensitive ears. If you have a specific metal allergy, message us before ordering and we will tell you exactly what a piece is made from.'],
  ['Do you make custom or personalised pieces?',
   'Yes, custom orders are one of our favourite things. WhatsApp us or DM on Instagram with your idea, colours and budget. Note that custom pieces cannot be returned, since they are made specifically for you.'],
  ['Can I order in bulk for an event?',
   'Absolutely. We do bulk orders for weddings, mehndis, birthdays and corporate gifting, with discounts on larger quantities. Get in touch through the contact form and select Bulk / Wholesale.'],
  ['My order has not arrived, what do I do?',
   'First check your order status on the tracking page. If the estimated window has passed, WhatsApp us at +92 320 5586296 with your order number and we will chase the courier for you.'],
  ['Do you have a physical shop?',
   'We are online-first and ship nationwide, but we run pop-up stalls for permanent jewellery fittings. Follow @beads_ncharmss on Instagram for announcements about where we will be next.'],
  ['How do I use a discount code?',
   'Enter it in the discount code box at checkout and press Apply. The saving appears in your order summary before you confirm. One code per order.']
];

function renderFAQ() {
  return navHTML() + policyCSS + policyHero(
    'Questions, answered',
    'Frequently Asked <em>Questions</em>',
    'FAQ',
    'Everything about delivery, returns, payment and caring for your handmade jewellery. Still stuck? WhatsApp us — we reply within 24 hours.'
  ) + `
  <div class="policy-wrap">
    <div>
      ${FAQS.map((f, i) => `
      <div class="faq-item" id="faq-${i}">
        <button class="faq-q" onclick="toggleFAQ(${i})" aria-expanded="false">${esc(f[0])}</button>
        <div class="faq-a"><p style="margin:0">${esc(f[1])}</p></div>
      </div>`).join('')}
    </div>
    <div class="policy-card" style="margin-top:36px">
      <p><strong>Did not find your answer?</strong> WhatsApp <strong>+92 320 5586296</strong>, DM <a href="https://instagram.com/beads_ncharmss" target="_blank" rel="noopener">@beads_ncharmss</a>, or use the <a onclick="navigate('contact')" href="/contact" style="cursor:pointer">contact form</a>.</p>
    </div>
  </div>
  ` + footerHTML();
}

function toggleFAQ(i) {
  const el = document.getElementById('faq-' + i);
  if (!el) return;
  const open = el.classList.toggle('open');
  el.querySelector('.faq-q')?.setAttribute('aria-expanded', open ? 'true' : 'false');
}

// FAQPage structured data — lets Google show these as rich results.
function faqSchema() {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(f => ({
      '@type': 'Question',
      name: f[0],
      acceptedAnswer: { '@type': 'Answer', text: f[1] }
    }))
  });
}

// ── PRIVACY ───────────────────────────────────────────────────
function renderPrivacy() {
  return navHTML() + policyCSS + policyHero(
    'Your data',
    'Privacy <em>Policy</em>',
    'Privacy Policy',
    'What we collect, why we collect it, and what we never do with it.'
  ) + `
  <div class="policy-wrap">
    <p class="policy-updated">Last updated: ${policyDate()}</p>

    <h2>What we collect</h2>
    <p>When you place an order we collect your <strong>name, phone number, email address and delivery address</strong>. We need all four: the address and name to deliver, the phone number because our couriers ring before arriving, and the email to send your confirmation.</p>
    <p>If you contact us, we keep your message and contact details so we can reply and refer back if you get in touch again. We also record basic, anonymous usage data — which pages are viewed and which products are popular — to work out what to stock.</p>

    <h2>What we do not collect</h2>
    <div class="policy-card">
      <p>We <strong>never</strong> see or store your card details, EasyPaisa PIN or JazzCash PIN. Cash on Delivery is settled between you and the courier. Mobile wallet payments happen entirely inside your own EasyPaisa or JazzCash app — we only ever see the screenshot you choose to send us.</p>
    </div>

    <h2>How we use it</h2>
    <ul>
      <li>To process, pack and deliver your order</li>
      <li>To send order confirmations and delivery updates</li>
      <li>To answer your questions and handle returns</li>
      <li>To send occasional news about new pieces and sales — only if you have not opted out, and every message has an unsubscribe option</li>
    </ul>

    <h2>Who we share it with</h2>
    <p>Your name, address and phone number go to <strong>our courier partner</strong>, because there is no other way to deliver a parcel. Your order data is stored with <strong>Supabase</strong>, our database provider, and the site is hosted by <strong>Railway</strong>.</p>
    <p><strong>We do not sell your data. We do not rent it, trade it, or hand it to advertisers.</strong> Beyond the providers above, nobody outside Beads N Charms sees your details.</p>

    <h2>How long we keep it</h2>
    <p>Order records are kept for three years, which covers returns, warranty questions and our tax obligations. Marketing contact details are kept until you unsubscribe. Ask us to delete your data and we will, except where we are legally required to retain a transaction record.</p>

    <h2>Security</h2>
    <p>The site is served entirely over HTTPS. Our database enforces row-level security, meaning customer records — orders, addresses, phone numbers — are not publicly readable, and the admin area requires an authenticated login. No system is perfect, but we do not take shortcuts with your details.</p>

    <h2>Your rights</h2>
    <p>You can ask us at any time to show you what we hold about you, correct anything wrong, delete your data, or stop marketing messages. WhatsApp <strong>+92 320 5586296</strong> or use the <a onclick="navigate('contact')" href="/contact" style="cursor:pointer">contact form</a>. We respond within 30 days, usually much sooner.</p>

    <h2>Cookies and local storage</h2>
    <p>We use your browser local storage to remember your shopping cart between visits. That is functional, not tracking, and it stays on your device. We do not run third-party advertising trackers.</p>

    <h2>Children</h2>
    <p>Our store is not directed at children under 13 and we do not knowingly collect their data. If you believe a child has given us their details, contact us and we will delete them.</p>

    <h2>Changes</h2>
    <p>If we change this policy we will update the date at the top. Material changes will be announced on our Instagram.</p>
  </div>
  ` + footerHTML();
}

// ── TERMS ─────────────────────────────────────────────────────
function renderTerms() {
  return navHTML() + policyCSS + policyHero(
    'The formal bit',
    'Terms &amp; <em>Conditions</em>',
    'Terms & Conditions',
    'The terms you agree to when you order from Beads N Charms.'
  ) + `
  <div class="policy-wrap">
    <p class="policy-updated">Last updated: ${policyDate()}</p>

    <h2>Who we are</h2>
    <p>Beads N Charms is a handmade jewellery business operating online in Pakistan, reachable at <strong>+92 320 5586296</strong> and <a href="https://instagram.com/beads_ncharmss" target="_blank" rel="noopener">@beads_ncharmss</a>. Using this website or placing an order means you accept these terms.</p>

    <h2>Orders</h2>
    <p>Placing an order is an offer to buy, not a completed contract. The contract forms when we confirm your order by WhatsApp or email. We may decline an order where an item is out of stock, the delivery address is outside our coverage, a pricing error has occurred, or we have reason to believe the order is not genuine.</p>

    <h2>Pricing</h2>
    <p>All prices are in <strong>Pakistani Rupees (PKR)</strong> and include applicable taxes. Delivery is charged separately as set out on the <a onclick="navigate('shipping')" href="/shipping" style="cursor:pointer">shipping page</a>. We may change prices at any time, but never after confirming your order.</p>
    <p>If an item is listed at an obviously incorrect price, we will contact you before dispatch and you may proceed at the correct price or cancel for a full refund.</p>

    <h2>Product descriptions</h2>
    <p>Every piece is handmade, so <strong>slight variations in colour, bead placement and finish are normal</strong> and are not defects. Screen colours vary between devices, so the shade you see may differ a little from the piece you receive. We describe our products as accurately as we can.</p>

    <h2>Stock</h2>
    <p>Listed stock is our best information but is not guaranteed until we confirm your order. If an item sells out after you order, we will offer you an alternative, a wait, or a full refund.</p>

    <h2>Payment</h2>
    <p>We accept Cash on Delivery, EasyPaisa and JazzCash. For mobile wallet payments, orders are dispatched only once payment is confirmed. Repeatedly refusing COD parcels at the door may result in us requiring advance payment on future orders.</p>

    <h2>Returns</h2>
    <p>Returns are governed by our <a onclick="navigate('returns')" href="/returns-policy" style="cursor:pointer">Returns and Refund Policy</a>, which forms part of these terms.</p>

    <h2>Permanent jewellery</h2>
    <p>Permanent jewellery is welded onto the body at an in-person fitting. By booking, you confirm you are over 18 (or have a guardian present), have no metal allergy that would make the fitting unsafe, and understand the piece has no clasp and must be cut to remove. We will re-weld a failed weld free within 14 days. We are not liable for injury caused by attempting to remove a piece yourself.</p>

    <h2>Intellectual property</h2>
    <p>All content on this site — photographs, designs, text and the Beads N Charms name and logo — belongs to us. You may not reproduce it commercially without written permission. Reposting our photos on social media with credit is welcome and appreciated.</p>

    <h2>Liability</h2>
    <p>Our liability for any order is limited to the amount you paid for it. We are not liable for indirect losses. Nothing here limits liability that cannot be limited by Pakistani law, including for death or personal injury caused by negligence.</p>

    <h2>Governing law</h2>
    <p>These terms are governed by the laws of the Islamic Republic of Pakistan, and disputes fall to the courts of Islamabad.</p>

    <h2>Contact</h2>
    <p>Questions about these terms? WhatsApp <strong>+92 320 5586296</strong> or use our <a onclick="navigate('contact')" href="/contact" style="cursor:pointer">contact form</a>.</p>
  </div>
  ` + footerHTML();
}
