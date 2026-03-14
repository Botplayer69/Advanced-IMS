import { useMemo, useState } from "react";
import { toast } from "sonner";
import { createDocument, validateReceipt } from "@/lib/api/documents";
import { getProducts, getWarehouses, type ProductDto, type WarehouseDto } from "@/lib/api/masterData";
import { useEffect } from "react";

type ReceiptLine = {
  id: string;
  productId: string;
  quantityReceived: number;
};

export default function ReceiptsPage() {
  const [supplier, setSupplier] = useState("");
  const [receiptDate, setReceiptDate] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [lines, setLines] = useState<ReceiptLine[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.all([getProducts(), getWarehouses()])
      .then(([productRows, warehouseRows]) => {
        if (!mounted) return;
        setProducts(productRows);
        setWarehouses(warehouseRows);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Failed to load products/warehouses.";
        toast.error(message);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const selectedProducts = useMemo(() => new Set(lines.map((line) => line.productId).filter(Boolean)), [lines]);

  const handleCreateReceipt = () => {
    setSupplier("");
    setReceiptDate("");
    setWarehouseId("");
    setLines([{ id: crypto.randomUUID(), productId: "", quantityReceived: 0 }]);
  };

  const handleSaveReceipt = async () => {
    if (!supplier || !receiptDate || !warehouseId) {
      toast.error("Supplier, receipt date, and warehouse are required.");
      return;
    }

    const validLines = lines.filter((line) => line.productId && line.quantityReceived > 0);
    if (validLines.length === 0) {
      toast.error("Add at least one product line with quantity > 0.");
      return;
    }

    setSaving(true);
    try {
      const operation = await createDocument(
        "RECEIPT",
        undefined,
        undefined,
        warehouseId,
        supplier,
        validLines.map((line) => ({ productId: line.productId, quantity: line.quantityReceived }))
      );

      await validateReceipt(
        operation.id,
        validLines.map((line) => ({
          productId: line.productId,
          warehouseId,
          quantity: line.quantityReceived,
        }))
      );

      toast.success("Receipt saved and inventory updated.");
      handleCreateReceipt();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save receipt.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const addLine = () => {
    setLines((prev) => [...prev, { id: crypto.randomUUID(), productId: "", quantityReceived: 0 }]);
  };

  const removeLine = (lineId: string) => {
    setLines((prev) => prev.filter((line) => line.id !== lineId));
  };

  const updateLine = (lineId: string, field: "productId" | "quantityReceived", value: string) => {
    setLines((prev) =>
      prev.map((line) => {
        if (line.id !== lineId) return line;

        if (field === "quantityReceived") {
          return { ...line, quantityReceived: Number(value || 0) };
        }

        return { ...line, productId: value };
      }),
    );
  };

  return (
    <>
      <header className="h-14 border-b border-border flex items-center justify-between px-8">
        <span className="text-sm text-muted-foreground">
          Operations / <span className="text-foreground font-medium">Receipts</span>
        </span>
        <button
          type="button"
          onClick={handleCreateReceipt}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1.5 rounded text-sm font-semibold ims-press"
        >
          Create New Receipt
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <section className="max-w-5xl bg-card border border-border rounded-lg p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Supplier</label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="e.g. Siemens Industrial"
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Receipt Date</label>
              <input
                type="date"
                value={receiptDate}
                onChange={(e) => setReceiptDate(e.target.value)}
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Destination Warehouse</label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select warehouse</option>
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold">Products in Receipt</h2>
              <button
                type="button"
                onClick={addLine}
                className="px-3 py-1.5 rounded border border-border text-xs font-semibold hover:bg-accent/40 ims-press"
              >
                + Add Product Row
              </button>
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4 w-40 text-right">Quantities Received</th>
                    <th className="py-3 px-4 w-24 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {lines.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-muted-foreground">
                        Click "Create New Receipt" to begin.
                      </td>
                    </tr>
                  )}

                  {lines.map((line) => (
                    <tr key={line.id} className="border-b border-border/50 hover:bg-accent/20">
                      <td className="py-3 px-4">
                        <select
                          value={line.productId}
                          onChange={(e) => updateLine(line.id, "productId", e.target.value)}
                          className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="">Select product</option>
                          {products.map((product) => {
                            const alreadyChosen = selectedProducts.has(product.id) && product.id !== line.productId;
                            return (
                              <option key={product.id} value={product.id} disabled={alreadyChosen}>
                                {product.name} ({product.sku})
                              </option>
                            );
                          })}
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <input
                          type="number"
                          min={0}
                          value={line.quantityReceived}
                          onChange={(e) => updateLine(line.id, "quantityReceived", e.target.value)}
                          className="w-28 bg-background border border-border rounded px-2 py-1.5 text-sm font-mono text-right focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => removeLine(line.id)}
                          className="text-xs text-destructive hover:underline"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button type="button" className="px-4 py-2 rounded border border-border text-sm hover:bg-accent/40 ims-press">
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSaveReceipt}
              className="px-4 py-2 rounded bg-success text-success-foreground text-sm font-semibold hover:bg-success/90 ims-press disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Receipt"}
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
