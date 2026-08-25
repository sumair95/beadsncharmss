# Migrations

Small, numbered, **run-once** changes. Apply any file you have not run yet,
in order, then never touch it again.

`../supabase.sql` at the repo root is the **fresh-install** script — the whole
schema for a brand-new database. You do not re-run it for changes; that is what
these are for.

| # | File | What it does | Run? |
|---|---|---|---|
| 001 | `001_capture_customer_on_order.sql` | Customer + mailing-list entry created by trigger on order insert, instead of from the browser. Drops the public write access those client writes required. | ☐ |

## How to run one

Supabase → **SQL Editor → New Query** → paste the file → **Run**. Tick it off above.

Each file is idempotent, so re-running one is harmless — but you should not
need to.
