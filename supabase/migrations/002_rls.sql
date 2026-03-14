-- ============================================================
-- Phase 2: Row Level Security (RLS) Policies — Advanced IMS
-- Run AFTER 001_schema.sql.
-- ============================================================

-- ── Enable RLS on all tables ──────────────────────────────────
ALTER TABLE public.users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_moves ENABLE ROW LEVEL SECURITY;

-- ── Role helper ───────────────────────────────────────────────
-- SECURITY DEFINER so it can read the users table regardless of
-- the calling user's own RLS restrictions.
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ── USERS ─────────────────────────────────────────────────────

-- Managers: full access to all user profiles
CREATE POLICY "managers_all_users"
  ON public.users FOR ALL
  USING  (public.get_my_role() = 'Manager')
  WITH CHECK (public.get_my_role() = 'Manager');

-- Staff: can only read and update their own profile
CREATE POLICY "staff_read_own_user"
  ON public.users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "staff_update_own_user"
  ON public.users FOR UPDATE
  USING  (id = auth.uid() AND public.get_my_role() = 'Staff')
  WITH CHECK (id = auth.uid() AND public.get_my_role() = 'Staff');

-- ── LOCATIONS ─────────────────────────────────────────────────

CREATE POLICY "managers_all_locations"
  ON public.locations FOR ALL
  USING  (public.get_my_role() = 'Manager')
  WITH CHECK (public.get_my_role() = 'Manager');

-- Staff: read-only
CREATE POLICY "staff_read_locations"
  ON public.locations FOR SELECT
  USING (public.get_my_role() = 'Staff');

-- ── PRODUCTS ──────────────────────────────────────────────────

CREATE POLICY "managers_all_products"
  ON public.products FOR ALL
  USING  (public.get_my_role() = 'Manager')
  WITH CHECK (public.get_my_role() = 'Manager');

-- Staff: read-only
CREATE POLICY "staff_read_products"
  ON public.products FOR SELECT
  USING (public.get_my_role() = 'Staff');

-- ── DOCUMENTS ─────────────────────────────────────────────────

CREATE POLICY "managers_all_documents"
  ON public.documents FOR ALL
  USING  (public.get_my_role() = 'Manager')
  WITH CHECK (public.get_my_role() = 'Manager');

-- Staff: can read all documents
CREATE POLICY "staff_read_documents"
  ON public.documents FOR SELECT
  USING (public.get_my_role() = 'Staff');

-- Staff: can create documents of allowed types (not Receipts — Managers only)
CREATE POLICY "staff_insert_documents"
  ON public.documents FOR INSERT
  WITH CHECK (
    public.get_my_role() = 'Staff'
    AND type IN ('Delivery', 'Transfer', 'Adjustment')
  );

-- Staff: can update documents they own of allowed types, but cannot
-- change the document type or creator
CREATE POLICY "staff_update_own_documents"
  ON public.documents FOR UPDATE
  USING (
    public.get_my_role() = 'Staff'
    AND created_by = auth.uid()
    AND type IN ('Delivery', 'Transfer', 'Adjustment')
  )
  WITH CHECK (
    public.get_my_role() = 'Staff'
    AND created_by = auth.uid()
    AND type IN ('Delivery', 'Transfer', 'Adjustment')
  );

-- ── STOCK_MOVES ───────────────────────────────────────────────

CREATE POLICY "managers_all_stock_moves"
  ON public.stock_moves FOR ALL
  USING  (public.get_my_role() = 'Manager')
  WITH CHECK (public.get_my_role() = 'Manager');

-- Staff: can read all stock moves (needed to display inventory levels)
CREATE POLICY "staff_read_stock_moves"
  ON public.stock_moves FOR SELECT
  USING (public.get_my_role() = 'Staff');

-- Staff: can insert stock moves only for documents they own of allowed types.
-- This prevents staff from inserting arbitrary ledger rows.
CREATE POLICY "staff_insert_stock_moves"
  ON public.stock_moves FOR INSERT
  WITH CHECK (
    public.get_my_role() = 'Staff'
    AND EXISTS (
      SELECT 1 FROM public.documents d
      WHERE  d.id         = document_id
        AND  d.created_by = auth.uid()
        AND  d.type       IN ('Delivery', 'Transfer', 'Adjustment')
        AND  d.status     != 'Validated'   -- cannot add moves to closed docs
    )
  );
