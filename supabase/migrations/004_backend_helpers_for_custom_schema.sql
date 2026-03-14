-- ============================================================
-- Helper functions for your custom schema
-- Tables: "Operation", "OperationItem", "StockMovement", "Product"
-- ============================================================

-- 1) Real-time stock from StockMovement ledger + Product.initialStock
CREATE OR REPLACE FUNCTION public.calculate_current_stock(
  p_product_id UUID,
  p_warehouse_id UUID DEFAULT NULL
)
RETURNS FLOAT AS $$
DECLARE
  base_stock FLOAT;
  ledger_delta FLOAT;
BEGIN
  SELECT COALESCE(p."initialStock", 0)
  INTO base_stock
  FROM "Product" p
  WHERE p.id = p_product_id;

  SELECT COALESCE(SUM(
    CASE
      WHEN sm.type = 'IN' THEN sm.quantity
      WHEN sm.type = 'OUT' THEN -sm.quantity
      ELSE 0
    END
  ), 0)
  INTO ledger_delta
  FROM "StockMovement" sm
  WHERE sm."productId" = p_product_id
    AND (
      p_warehouse_id IS NULL
      OR sm."warehouseId" = p_warehouse_id
    );

  RETURN COALESCE(base_stock, 0) + COALESCE(ledger_delta, 0);
END;
$$ LANGUAGE plpgsql STABLE;


-- 2) Validate receipt transaction
--    p_lines JSON format:
--    [
--      {"productId":"<uuid>","warehouseId":"<uuid>","quantity":10},
--      ...
--    ]
CREATE OR REPLACE FUNCTION public.validate_receipt(
  p_operation_id UUID,
  p_lines JSONB
)
RETURNS VOID AS $$
DECLARE
  op_row "Operation"%ROWTYPE;
  line JSONB;
BEGIN
  -- Lock operation row to avoid concurrent validation.
  SELECT *
  INTO op_row
  FROM "Operation"
  WHERE id = p_operation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Operation not found: %', p_operation_id;
  END IF;

  IF op_row.type <> 'RECEIPT' THEN
    RAISE EXCEPTION 'Operation % is %, expected RECEIPT', p_operation_id, op_row.type;
  END IF;

  IF op_row.status = 'DONE' THEN
    RAISE EXCEPTION 'Operation % is already DONE', p_operation_id;
  END IF;

  IF p_lines IS NULL OR jsonb_array_length(p_lines) = 0 THEN
    RAISE EXCEPTION 'Receipt lines are required';
  END IF;

  FOR line IN SELECT * FROM jsonb_array_elements(p_lines)
  LOOP
    IF (line->>'productId') IS NULL
      OR (line->>'warehouseId') IS NULL
      OR (line->>'quantity') IS NULL THEN
      RAISE EXCEPTION 'Each line requires productId, warehouseId, quantity';
    END IF;

    IF (line->>'quantity')::FLOAT <= 0 THEN
      RAISE EXCEPTION 'quantity must be > 0';
    END IF;

    INSERT INTO "StockMovement" (
      "productId",
      "warehouseId",
      quantity,
      type,
      "operationId"
    )
    VALUES (
      (line->>'productId')::UUID,
      (line->>'warehouseId')::UUID,
      (line->>'quantity')::FLOAT,
      'IN',
      p_operation_id
    );
  END LOOP;

  UPDATE "Operation"
  SET status = 'DONE',
      "updatedAt" = CURRENT_TIMESTAMP
  WHERE id = p_operation_id;
END;
$$ LANGUAGE plpgsql;
