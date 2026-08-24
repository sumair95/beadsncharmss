-- ============================================================
--  BEADS N CHARMS — Supabase Database Schema
--  Run this entire file in Supabase → SQL Editor → New Query
-- ============================================================

-- ── 1. CATEGORIES ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  emoji       TEXT NOT NULL DEFAULT '📿',
  description TEXT,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. PRODUCTS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id           TEXT PRIMARY KEY DEFAULT ('p' || extract(epoch from now())::bigint::text),
  name         TEXT NOT NULL,
  category_id  TEXT REFERENCES categories(id) ON DELETE SET NULL,
  price        INTEGER NOT NULL,
  on_sale      BOOLEAN DEFAULT FALSE,
  sale_percent INTEGER DEFAULT 0,
  description  TEXT,
  tags         TEXT[] DEFAULT '{}',
  emoji        TEXT DEFAULT '📿',
  color        TEXT DEFAULT 'linear-gradient(135deg,#F4EDFC,#E8D5F5)',
  in_stock     BOOLEAN DEFAULT TRUE,
  featured     BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. CUSTOMERS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  name       TEXT,
  phone      TEXT,
  city       TEXT,
  province   TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. ORDERS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id            TEXT PRIMARY KEY DEFAULT ('ORD-' || extract(epoch from now())::bigint::text),
  customer_id   UUID REFERENCES customers(id),
  customer_name TEXT,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  address       TEXT,
  city          TEXT,
  province      TEXT,
  notes         TEXT,
  payment       TEXT DEFAULT 'cod',
  subtotal      INTEGER NOT NULL DEFAULT 0,
  delivery      INTEGER NOT NULL DEFAULT 0,
  total         INTEGER NOT NULL DEFAULT 0,
  status        TEXT DEFAULT 'pending',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. ORDER ITEMS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    TEXT REFERENCES orders(id) ON DELETE CASCADE,
  product_id  TEXT REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  price       INTEGER NOT NULL,
  quantity    INTEGER NOT NULL DEFAULT 1,
  subtotal    INTEGER NOT NULL DEFAULT 0
);

-- ── 6. EMAIL SUBSCRIBERS ─────────────────────────────────────
-- All customers who place orders are auto-added here for marketing
CREATE TABLE IF NOT EXISTS email_subscribers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  name       TEXT,
  source     TEXT DEFAULT 'checkout',
  subscribed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 7. CONTACT MESSAGES ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  contact    TEXT NOT NULL,
  subject    TEXT,
  message    TEXT NOT NULL,
  status     TEXT DEFAULT 'unread',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 8. UPDATED_AT TRIGGER ────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_orders_updated
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_customers_updated
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 9. ROW LEVEL SECURITY ────────────────────────────────────
ALTER TABLE categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages  ENABLE ROW LEVEL SECURITY;

-- Public can READ categories and products (shop browsing)
CREATE POLICY "Public read categories"   ON categories        FOR SELECT USING (true);
CREATE POLICY "Public read products"     ON products          FOR SELECT USING (true);

-- Public can INSERT orders, customers, subscribers, messages
CREATE POLICY "Public insert orders"     ON orders            FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert order_items" ON order_items      FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert customers"  ON customers         FOR INSERT WITH CHECK (true);
CREATE POLICY "Public upsert customers"  ON customers         FOR UPDATE USING (true);
CREATE POLICY "Public insert subscribers" ON email_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert messages"   ON contact_messages  FOR INSERT WITH CHECK (true);

-- ── 10. SEED DEFAULT CATEGORIES ──────────────────────────────
INSERT INTO categories (id, name, emoji, description, sort_order) VALUES
  ('rings',     'Rings',               '💍', 'Delicate & statement rings',       1),
  ('bracelets', 'Bracelets',           '📿', 'Beaded & charm bracelets',         2),
  ('necklaces', 'Necklaces',           '✨', 'Layered & pendant necklaces',      3),
  ('earrings',  'Earrings',            '🌸', 'Studs, hoops & drops',             4),
  ('charms',    'Phone Charms',        '📱', 'Cute phone & bag charms',          5),
  ('keychains', 'Keychains',           '🔑', 'Personalised keychains',           6),
  ('permanent', 'Permanent Jewellery', '💜', 'Welded-on forever pieces',         7)
ON CONFLICT (id) DO NOTHING;

-- ── 11. SEED DEFAULT PRODUCTS ────────────────────────────────
INSERT INTO products (id, name, category_id, price, on_sale, sale_percent, description, tags, emoji, color, in_stock, featured) VALUES
  ('p1', 'Pearl Beaded Bracelet',    'bracelets', 850,  false, 0,  'Delicate freshwater pearl bracelet with gold-filled clasp. Adjustable sizing, perfect for stacking.',           ARRAY['pearl','bracelet','minimal'],      '📿', 'linear-gradient(135deg,#F4EDFC,#E8D5F5)', true,  true),
  ('p2', 'Moon & Star Charm Set',    'charms',    650,  true,  30, 'Set of 3 celestial phone charms — crescent moon, star, and cloud. Detachable lobster clasp.',                  ARRAY['moon','star','charm'],             '🌙', 'linear-gradient(135deg,#C4A8D8,#9B7BB8)', true,  true),
  ('p3', 'Lilac Flower Ring',        'rings',     550,  false, 0,  'Dainty adjustable ring with hand-painted lilac flower resin detail. One size fits most.',                     ARRAY['ring','flower','lilac'],           '💜', 'linear-gradient(135deg,#E8D5F5,#C4A8D8)', true,  true),
  ('p4', 'Permanent Gold Bracelet',  'permanent', 2500, false, 0,  'Our signature permanent bracelet — welded onto your wrist for a forever look. Gold-filled chain.',            ARRAY['permanent','gold','forever'],      '✨', 'linear-gradient(135deg,#F7F3EE,#EDE6DC)', true,  true),
  ('p5', 'Butterfly Keychain',       'keychains', 450,  true,  22, 'Beaded butterfly keychain in purple and pink tones. Approx 12cm length.',                                     ARRAY['butterfly','keychain','beaded'],   '🦋', 'linear-gradient(135deg,#9B7BB8,#6B4E9B)', true,  true),
  ('p6', 'Crystal Drop Earrings',    'earrings',  700,  false, 0,  'Amethyst-toned crystal drop earrings with surgical steel posts. Hypoallergenic.',                             ARRAY['earrings','crystal','amethyst'],   '💎', 'linear-gradient(135deg,#EDE6DC,#E8D5F5)', true,  true),
  ('p7', 'Layered Chain Necklace',   'necklaces', 1200, true,  21, 'Three-layer gold-filled chain necklace with tiny charm pendants. Adjustable 40–45cm.',                        ARRAY['necklace','layered','chain'],      '📿', 'linear-gradient(135deg,#F4EDFC,#E8D5F5)', true,  false),
  ('p8', 'Purple Stackable Ring',    'rings',     400,  false, 0,  'Stackable ring with purple seed beads on elastic band. Set of 2 rings.',                                      ARRAY['ring','bead','purple'],            '💍', 'linear-gradient(135deg,#E8D5F5,#C4A8D8)', true,  false),
  ('p9', 'Strawberry Phone Charm',   'charms',    380,  false, 0,  'Cute handmade strawberry phone charm with beaded details. Fits most phone cases.',                            ARRAY['strawberry','charm','cute'],       '🍓', 'linear-gradient(135deg,#F9E4EA,#E8D5F5)', false, false),
  ('p10','Beaded Friendship Bracelet','bracelets', 650,  true,  23, 'Colourful seed bead bracelet in purple, lilac and beige. Adjustable macramé tie.',                           ARRAY['friendship','bracelet','colorful'],'🌈', 'linear-gradient(135deg,#EDE6DC,#E8D5F5)', true,  false)
ON CONFLICT (id) DO NOTHING;

-- ── DONE ─────────────────────────────────────────────────────
-- All tables created, RLS enabled, default data seeded.
-- Next: paste your Supabase URL + anon key into the store HTML.
