-- 001 — Capture customer + subscriber from the order itself
--
-- Run once. ~30 lines.
--
-- Why: the browser wrote to customers and email_subscribers directly, using
-- an upsert. An upsert needs UPDATE rights, so it demanded a public UPDATE
-- policy on customers — meaning anyone with the anon key could overwrite any
-- customer row. Those writes were also failing with 42501 regardless, so the
-- mailing list was never being built.
--
-- Instead: derive both from the order row in a trigger. SECURITY DEFINER means
-- it runs as the function owner and bypasses RLS, so the client needs no write
-- access to either table at all.

CREATE OR REPLACE FUNCTION capture_customer_from_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.customer_email IS NULL OR NEW.customer_email = '' THEN
    RETURN NEW;
  END IF;

  INSERT INTO customers (email, name, phone, city, updated_at)
  VALUES (NEW.customer_email, NEW.customer_name, NEW.customer_phone, NEW.city, NOW())
  ON CONFLICT (email) DO UPDATE
    SET name       = COALESCE(EXCLUDED.name,  customers.name),
        phone      = COALESCE(EXCLUDED.phone, customers.phone),
        city       = COALESCE(EXCLUDED.city,  customers.city),
        updated_at = NOW();

  INSERT INTO email_subscribers (email, name, source)
  VALUES (NEW.customer_email, NEW.customer_name, 'checkout')
  ON CONFLICT (email) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_capture_customer ON orders;
CREATE TRIGGER trg_capture_customer
AFTER INSERT ON orders
FOR EACH ROW EXECUTE FUNCTION capture_customer_from_order();

-- The client no longer writes to these, so drop the public write access.
-- "Public upsert customers" let anyone overwrite any customer row.
DROP POLICY IF EXISTS "Public upsert customers"   ON customers;
DROP POLICY IF EXISTS "Public insert customers"   ON customers;
DROP POLICY IF EXISTS "Public insert subscribers" ON email_subscribers;
REVOKE INSERT, UPDATE ON customers         FROM anon;
REVOKE INSERT, UPDATE ON email_subscribers FROM anon;
