-- ============================================================
--  BEADS N CHARMS — Complete Supabase Schema v3
--  Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── EXTENSIONS ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. CATEGORIES ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  emoji       TEXT DEFAULT '📿',
  description TEXT,
  sort_order  INTEGER DEFAULT 0,
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. PRODUCTS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id            TEXT PRIMARY KEY DEFAULT ('p' || extract(epoch from now())::bigint::text),
  name          TEXT NOT NULL,
  category_id   TEXT REFERENCES categories(id) ON DELETE SET NULL,
  price         INTEGER NOT NULL,
  on_sale       BOOLEAN DEFAULT FALSE,
  sale_percent  INTEGER DEFAULT 0,
  description   TEXT,
  tags          TEXT[] DEFAULT '{}',
  emoji         TEXT DEFAULT '📿',
  color         TEXT DEFAULT 'linear-gradient(135deg,#F4EDFC,#E8D5F5)',
  -- NEW: real images
  image_url     TEXT,                    -- primary image
  images        TEXT[] DEFAULT '{}',     -- gallery (up to 5)
  -- NEW: variants
  has_variants  BOOLEAN DEFAULT FALSE,
  variants      JSONB DEFAULT '[]',      -- [{name,options:[],price_mod:0}]
  -- NEW: stock
  in_stock      BOOLEAN DEFAULT TRUE,
  stock_qty     INTEGER DEFAULT 999,     -- actual quantity
  low_stock_threshold INTEGER DEFAULT 5,
  featured      BOOLEAN DEFAULT FALSE,
  active        BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. CUSTOMERS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  name          TEXT,
  phone         TEXT,
  city          TEXT,
  province      TEXT,
  password_hash TEXT,                    -- for customer accounts
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. DISCOUNT CODES ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS discount_codes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          TEXT UNIQUE NOT NULL,    -- e.g. SAVE20
  type          TEXT NOT NULL,           -- 'percent' | 'fixed' | 'free_delivery'
  value         INTEGER DEFAULT 0,       -- 20 = 20% or PKR 200
  min_order     INTEGER DEFAULT 0,       -- minimum order to apply
  max_uses      INTEGER DEFAULT NULL,    -- NULL = unlimited
  used_count    INTEGER DEFAULT 0,
  active        BOOLEAN DEFAULT TRUE,
  expires_at    TIMESTAMPTZ DEFAULT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. ORDERS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id              TEXT PRIMARY KEY DEFAULT ('ORD-' || extract(epoch from now())::bigint::text),
  customer_id     UUID REFERENCES customers(id),
  customer_name   TEXT NOT NULL,
  customer_email  TEXT NOT NULL,
  customer_phone  TEXT NOT NULL,
  address         TEXT,
  city            TEXT,
  province        TEXT,
  notes           TEXT,
  payment         TEXT DEFAULT 'cod',
  discount_code   TEXT,
  discount_amount INTEGER DEFAULT 0,
  subtotal        INTEGER NOT NULL DEFAULT 0,
  delivery        INTEGER NOT NULL DEFAULT 0,
  total           INTEGER NOT NULL DEFAULT 0,
  status          TEXT DEFAULT 'pending', -- pending|confirmed|processing|shipped|delivered|cancelled
  -- NEW: tracking
  tracking_number TEXT,
  whatsapp_sent   BOOLEAN DEFAULT FALSE,
  email_sent      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 6. ORDER ITEMS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      TEXT REFERENCES orders(id) ON DELETE CASCADE,
  product_id    TEXT REFERENCES products(id) ON DELETE SET NULL,
  product_name  TEXT NOT NULL,
  variant       TEXT,                    -- e.g. "Size: M, Color: Purple"
  price         INTEGER NOT NULL,
  quantity      INTEGER NOT NULL DEFAULT 1,
  subtotal      INTEGER NOT NULL DEFAULT 0
);

-- ── 7. ABANDONED CARTS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS abandoned_carts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT,
  phone       TEXT,
  cart_data   JSONB NOT NULL,            -- array of {product_id, qty, variant}
  recovered   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 8. EMAIL SUBSCRIBERS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_subscribers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  name        TEXT,
  source      TEXT DEFAULT 'checkout',  -- checkout|newsletter|popup
  subscribed  BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 9. CONTACT MESSAGES ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  contact     TEXT NOT NULL,
  subject     TEXT,
  message     TEXT NOT NULL,
  status      TEXT DEFAULT 'unread',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 10. REVIEWS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  TEXT REFERENCES products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating      INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment     TEXT,
  approved    BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 11. ANALYTICS EVENTS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event       TEXT NOT NULL,            -- 'page_view'|'product_view'|'add_to_cart'|'purchase'
  product_id  TEXT,
  order_id    TEXT,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── UPDATED_AT TRIGGER ───────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated   BEFORE UPDATE ON products   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders_updated     BEFORE UPDATE ON orders     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_customers_updated  BEFORE UPDATE ON customers  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── ROW LEVEL SECURITY ───────────────────────────────────────
ALTER TABLE categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE products         ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders           ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE abandoned_carts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews          ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics        ENABLE ROW LEVEL SECURITY;

-- Public READ
DROP POLICY IF EXISTS "Public read categories" ON categories;
CREATE POLICY "Public read categories"    ON categories      FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read products" ON products;
CREATE POLICY "Public read products"      ON products        FOR SELECT USING (active = true);
DROP POLICY IF EXISTS "Public read reviews" ON reviews;
CREATE POLICY "Public read reviews"       ON reviews         FOR SELECT USING (approved = true);

-- Public INSERT
DROP POLICY IF EXISTS "Public insert orders" ON orders;
CREATE POLICY "Public insert orders"      ON orders          FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public insert order_items" ON order_items;
CREATE POLICY "Public insert order_items" ON order_items     FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public insert customers" ON customers;
CREATE POLICY "Public insert customers"   ON customers       FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public insert subscribers" ON email_subscribers;
CREATE POLICY "Public insert subscribers" ON email_subscribers FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public insert messages" ON contact_messages;
CREATE POLICY "Public insert messages"    ON contact_messages  FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public insert analytics" ON analytics;
CREATE POLICY "Public insert analytics"   ON analytics        FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public insert abandoned" ON abandoned_carts;
CREATE POLICY "Public insert abandoned"   ON abandoned_carts  FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public insert reviews" ON reviews;
CREATE POLICY "Public insert reviews"     ON reviews          FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public read discounts" ON discount_codes;
CREATE POLICY "Public read discounts"     ON discount_codes   FOR SELECT USING (active = true);

-- Customer upsert (for account updates)
DROP POLICY IF EXISTS "Public upsert customers" ON customers;
CREATE POLICY "Public upsert customers"   ON customers       FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Public update abandoned" ON abandoned_carts;
CREATE POLICY "Public update abandoned"   ON abandoned_carts FOR UPDATE USING (true);

-- ── STORAGE BUCKET ───────────────────────────────────────────
-- Run this in SQL editor too:
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read images" ON storage.objects;
CREATE POLICY "Public read images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Uploads and overwrites are admin-only. Without the TO authenticated clause,
-- anyone holding the anon key (it ships publicly in js/config.js) could fill
-- this bucket with arbitrary files or replace your product photos.
DROP POLICY IF EXISTS "Public upload images" ON storage.objects;
DROP POLICY IF EXISTS "Public update images" ON storage.objects;

DROP POLICY IF EXISTS "Admin upload images" ON storage.objects;
CREATE POLICY "Admin upload images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admin update images" ON storage.objects;
CREATE POLICY "Admin update images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admin delete images" ON storage.objects;
CREATE POLICY "Admin delete images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'product-images');

-- ── ADMIN POLICIES (authenticated role only) ─────────────────
-- The admin panel signs in through Supabase Auth and sends its session token
-- instead of the anon key, so these grants never reach the public storefront.
-- Policies are permissive and OR'd together, so authenticated also keeps the
-- public read access defined above.

-- Catalogue management
DROP POLICY IF EXISTS "Admin all products"   ON products;
CREATE POLICY "Admin all products"   ON products       FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin all categories" ON categories;
CREATE POLICY "Admin all categories" ON categories     FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin all discounts"  ON discount_codes;
CREATE POLICY "Admin all discounts"  ON discount_codes FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin all reviews"    ON reviews;
CREATE POLICY "Admin all reviews"    ON reviews        FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Order + customer visibility
DROP POLICY IF EXISTS "Admin read orders"      ON orders;
CREATE POLICY "Admin read orders"      ON orders            FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admin update orders"    ON orders;
CREATE POLICY "Admin update orders"    ON orders            FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin read order_items" ON order_items;
CREATE POLICY "Admin read order_items" ON order_items       FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admin read customers"   ON customers;
CREATE POLICY "Admin read customers"   ON customers         FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admin read subscribers" ON email_subscribers;
CREATE POLICY "Admin read subscribers" ON email_subscribers FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admin read messages"    ON contact_messages;
CREATE POLICY "Admin read messages"    ON contact_messages  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admin update messages"  ON contact_messages;
CREATE POLICY "Admin update messages"  ON contact_messages  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin read analytics"   ON analytics;
CREATE POLICY "Admin read analytics"   ON analytics         FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admin read abandoned"   ON abandoned_carts;
CREATE POLICY "Admin read abandoned"   ON abandoned_carts   FOR SELECT TO authenticated USING (true);

-- ── SEED CATEGORIES ──────────────────────────────────────────
INSERT INTO categories (id, name, emoji, description, sort_order) VALUES
  ('charms',    'Charms',              '✨', 'Bracelet, necklace & earring bases', 1),
  ('bracelets', 'Bracelets',           '📿', 'Beaded & charm bracelets',           2),
  ('necklaces', 'Necklaces',           '💫', 'Layered & pendant necklaces',         3),
  ('earrings',  'Earrings',            '🌸', 'Studs, hoops & drops',               4),
  ('charms-phone','Phone Charms',      '📱', 'Cute phone & bag charms',            5),
  ('keychains', 'Keychains',           '🔑', 'Personalised keychains',             6),
  ('permanent', 'Permanent Jewellery', '💜', 'Welded-on forever pieces',           7)
ON CONFLICT (id) DO NOTHING;

-- ── SEED DISCOUNT CODES ──────────────────────────────────────
INSERT INTO discount_codes (code, type, value, min_order, max_uses) VALUES
  ('WELCOME10', 'percent',      10, 0,    NULL),
  ('SAVE200',   'fixed',       200, 1500, 100),
  ('FREESHIP',  'free_delivery', 0, 0,   NULL),
  ('BNC20',     'percent',      20, 2000, 50)
ON CONFLICT (code) DO NOTHING;

-- ── SEED PRODUCTS ────────────────────────────────────────────
INSERT INTO products (id, name, category_id, price, on_sale, sale_percent, description, tags, emoji, color, in_stock, stock_qty, featured, has_variants) VALUES
  ('p1','Pearl Beaded Bracelet','bracelets',850,false,0,'Delicate freshwater pearl bracelet with gold-filled clasp. Adjustable sizing, perfect for stacking.',ARRAY['pearl','bracelet','minimal'],'📿','linear-gradient(135deg,#F4EDFC,#E8D5F5)',true,25,true,false),
  ('p2','Moon & Star Charm Set','charms-phone',650,true,30,'Set of 3 celestial phone charms — crescent moon, star, and cloud. Detachable lobster clasp.',ARRAY['moon','star','charm'],'🌙','linear-gradient(135deg,#C4A8D8,#9B7BB8)',true,15,true,false),
  ('p3','Lilac Flower Ring','charms',550,false,0,'Dainty adjustable ring with hand-painted lilac flower resin detail. One size fits most.',ARRAY['ring','flower','lilac'],'💜','linear-gradient(135deg,#E8D5F5,#C4A8D8)',true,30,true,false),
  ('p4','Permanent Gold Bracelet','permanent',2500,false,0,'Our signature permanent bracelet — welded onto your wrist for a forever look. Gold-filled chain.',ARRAY['permanent','gold','forever'],'✨','linear-gradient(135deg,#F7F3EE,#EDE6DC)',true,10,true,false),
  ('p5','Butterfly Keychain','keychains',450,true,22,'Beaded butterfly keychain in purple and pink tones. Approx 12cm length.',ARRAY['butterfly','keychain'],'🦋','linear-gradient(135deg,#9B7BB8,#6B4E9B)',true,20,true,false),
  ('p6','Crystal Drop Earrings','earrings',700,false,0,'Amethyst-toned crystal drop earrings with surgical steel posts. Hypoallergenic.',ARRAY['earrings','crystal'],'💎','linear-gradient(135deg,#EDE6DC,#E8D5F5)',true,18,true,false),
  ('p7','Layered Chain Necklace','necklaces',1200,true,21,'Three-layer gold-filled chain necklace with tiny charm pendants. Adjustable 40-45cm.',ARRAY['necklace','layered'],'📿','linear-gradient(135deg,#F4EDFC,#E8D5F5)',true,12,false,false),
  ('p8','Beaded Friendship Bracelet','bracelets',650,true,23,'Colourful seed bead bracelet in purple, lilac and beige. Adjustable.',ARRAY['bracelet','friendship'],'🌈','linear-gradient(135deg,#EDE6DC,#E8D5F5)',true,22,false,false)
ON CONFLICT (id) DO NOTHING;
