-- ============================================================
-- Phase 3: PostgreSQL Helper Functions — Advanced IMS
-- Run AFTER 002_rls.sql.
-- ============================================================

-- ── calculate_stock ───────────────────────────────────────────
-- Returns the real-time stock quantity for a given product.
-- Pass p_location_id to scope to a specific warehouse/rack.
-- Leave p_location_id NULL for total stock across all locations.
--
-- Formula:
--   stock = SUM(qty arriving at location) − SUM(qty leaving location)
--
-- SECURITY DEFINER: readable by all authenticated users since
-- both Manager and Staff need live stock figures.
CREATE OR REPLACE FUNCTION public.calculate_stock(
  p_product_id  UUID,
  p_location_id UUID DEFAULT NULL
)
RETURNS NUMERIC AS $$
  SELECT
    COALESCE(SUM(
      CASE
        -- Global (no location filter): count all internal arrivals
        WHEN p_location_id IS NULL AND dest_location_id IS NOT NULL THEN quantity
        -- Location filter: count arrivals at this location
        WHEN p_location_id IS NOT NULL AND dest_location_id = p_location_id THEN quantity
        ELSE 0
      END
    ), 0)
    -
    COALESCE(SUM(
      CASE
        -- Global: count all internal departures
        WHEN p_location_id IS NULL AND source_location_id IS NOT NULL THEN quantity
        -- Location filter: count departures from this location
        WHEN p_location_id IS NOT NULL AND source_location_id = p_location_id THEN quantity
        ELSE 0
      END
    ), 0)
  FROM public.stock_moves
  WHERE product_id = p_product_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ── validate_receipt ──────────────────────────────────────────
-- Atomically:
--   1. Locks and validates the document (must be type Receipt,
--      status Draft or Pending, and caller must be a Manager).
--   2. Inserts one stock_move row per product line.
--      source_location_id is NULL (goods come from external supplier).
--   3. Sets the document status to 'Validated'.
--
-- p_moves JSON shape (array):
--   [{ "product_id": "<uuid>", "dest_location_id": "<uuid>", "quantity": 50 }, ...]
--
-- Raises an exception (and rolls back) on any violation.
CREATE OR REPLACE FUNCTION public.validate_receipt(
  p_document_id UUID,
  p_moves       JSONB
)
RETURNS VOID AS $$
DECLARE
  v_doc  public.documents%ROWTYPE;
  v_move JSONB;
BEGIN
  -- ── RBAC check ──────────────────────────────────────────────
  IF public.get_my_role() != 'Manager' THEN
    RAISE EXCEPTION 'Access denied: only Managers can validate receipts.';
  END IF;

  -- ── Lock document row to prevent concurrent validation ──────
  SELECT * INTO v_doc
  FROM public.documents
  WHERE id = p_document_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Document % not found.', p_document_id;
  END IF;

  IF v_doc.type != 'Receipt' THEN
    RAISE EXCEPTION 'Document % is type %, not Receipt.', p_document_id, v_doc.type;
  END IF;

  IF v_doc.status = 'Validated' THEN
    RAISE EXCEPTION 'Receipt % is already Validated.', p_document_id;
  END IF;

  IF jsonb_array_length(p_moves) = 0 THEN
    RAISE EXCEPTION 'Cannot validate a receipt with no product lines.';
  END IF;

  -- ── Insert stock moves ───────────────────────────────────────
  FOR v_move IN SELECT * FROM jsonb_array_elements(p_moves)
  LOOP
    -- Validate required fields exist in each move object
    IF (v_move->>'product_id') IS NULL OR
       (v_move->>'dest_location_id') IS NULL OR
       (v_move->>'quantity') IS NULL THEN
      RAISE EXCEPTION 'Each move must include product_id, dest_location_id, and quantity.';
    END IF;

    IF (v_move->>'quantity')::NUMERIC <= 0 THEN
      RAISE EXCEPTION 'quantity must be > 0 (got %).', v_move->>'quantity';
    END IF;

    INSERT INTO public.stock_moves (
      document_id,
      product_id,
      source_location_id,   -- NULL: goods arrive from external
      dest_location_id,
      quantity
    )
    VALUES (
      p_document_id,
      (v_move->>'product_id')::UUID,
      NULL,
      (v_move->>'dest_location_id')::UUID,
      (v_move->>'quantity')::NUMERIC
    );
  END LOOP;

  -- ── Mark document validated ──────────────────────────────────
  UPDATE public.documents
  SET    status     = 'Validated',
         updated_at = NOW()
  WHERE  id = p_document_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
