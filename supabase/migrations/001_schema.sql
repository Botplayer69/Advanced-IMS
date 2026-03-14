-- ============================================================
-- Phase 1: Database Schema — Advanced IMS
-- Run this in the Supabase SQL Editor (or via supabase db push).
-- ============================================================

-- ── Enums ─────────────────────────────────────────────────────
CREATE TYPE document_type   AS ENUM ('Receipt', 'Delivery', 'Transfer', 'Adjustment');
CREATE TYPE document_status AS ENUM ('Draft', 'Pending', 'Validated');
CREATE TYPE user_role       AS ENUM ('Manager', 'Staff');

-- ── users ─────────────────────────────────────────────────────
-- Mirrors auth.users and adds the application-level role.
-- Populated automatically via the handle_new_user trigger below.
CREATE TABLE public.users (
  id         UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT        NOT NULL UNIQUE,
  role       user_role   NOT NULL DEFAULT 'Staff',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── locations ─────────────────────────────────────────────────
-- Represents physical storage locations (warehouses, racks, etc.)
CREATE TABLE public.locations (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── products ──────────────────────────────────────────────────
-- No static stock column.  Current stock is always derived from
-- the stock_moves ledger via calculate_stock().
CREATE TABLE public.products (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT        NOT NULL,
  sku             TEXT        NOT NULL UNIQUE,
  category        TEXT,
  unit_of_measure TEXT        NOT NULL DEFAULT 'unit',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── documents ─────────────────────────────────────────────────
-- A document is the header record for any inventory operation.
-- reference_location_id is the primary warehouse the document
-- is associated with (enables efficient location-based filtering
-- on Pending documents before any stock_moves exist).
CREATE TABLE public.documents (
  id                    UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  type                  document_type   NOT NULL,
  status                document_status NOT NULL DEFAULT 'Draft',
  created_by            UUID            NOT NULL REFERENCES public.users(id),
  reference_location_id UUID            REFERENCES public.locations(id),
  created_at            TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ── stock_moves (The Ledger) ───────────────────────────────────
-- Every movement of stock is recorded here.  Never delete rows.
--
--  Receipt  : source_location_id = NULL  (in from external supplier)
--  Delivery : dest_location_id   = NULL  (out to external customer)
--  Transfer : both non-NULL              (moves between warehouses)
--  Adjustment: one side NULL             (add/remove against virtual location)
--
-- Stock at location L for product P =
--   SUM(qty WHERE dest = L) - SUM(qty WHERE source = L)
CREATE TABLE public.stock_moves (
  id                 UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id        UUID           NOT NULL REFERENCES public.documents(id),
  product_id         UUID           NOT NULL REFERENCES public.products(id),
  source_location_id UUID           REFERENCES public.locations(id),  -- NULL = external
  dest_location_id   UUID           REFERENCES public.locations(id),  -- NULL = external
  quantity           NUMERIC(12, 4) NOT NULL CHECK (quantity > 0),
  move_date          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  created_at         TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  -- A move must have at least one internal side
  CONSTRAINT stock_moves_must_have_side CHECK (
    source_location_id IS NOT NULL OR dest_location_id IS NOT NULL
  ),
  -- A move cannot be from/to the same location
  CONSTRAINT stock_moves_no_self_transfer CHECK (
    source_location_id IS DISTINCT FROM dest_location_id
  )
);

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX idx_stock_moves_product_id         ON public.stock_moves(product_id);
CREATE INDEX idx_stock_moves_document_id        ON public.stock_moves(document_id);
CREATE INDEX idx_stock_moves_dest_location_id   ON public.stock_moves(dest_location_id);
CREATE INDEX idx_stock_moves_source_location_id ON public.stock_moves(source_location_id);
CREATE INDEX idx_documents_status               ON public.documents(status);
CREATE INDEX idx_documents_type                 ON public.documents(type);
CREATE INDEX idx_documents_created_by           ON public.documents(created_by);
CREATE INDEX idx_documents_ref_location         ON public.documents(reference_location_id);
CREATE INDEX idx_products_category              ON public.products(category);
CREATE INDEX idx_products_sku                   ON public.products(sku);

-- ── Shared updated_at trigger ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ── Auto-create user profile on Supabase Auth signup ──────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
