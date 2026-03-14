import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { getProducts, type ProductDto } from "@/lib/api/masterData";
import { getStockSummary } from "@/lib/api/stock";
import { toast } from "sonner";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [stockByProduct, setStockByProduct] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const [productRows, stockRows] = await Promise.all([getProducts(), getStockSummary()]);
        if (!mounted) return;

        setProducts(productRows);
        const stockMap = stockRows.reduce<Record<string, number>>((acc, row) => {
          acc[row.productId] = row.quantity;
          return acc;
        }, {});
        setStockByProduct(stockMap);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load products.";
        toast.error(message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  return (
    <>
      <header className="h-14 border-b border-border flex items-center justify-between px-8">
        <span className="text-sm font-medium text-muted-foreground">Products</span>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search SKU or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-card border border-border rounded pl-8 pr-3 py-1 text-xs w-64 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Stock</th>
                <th className="py-3 px-4 text-right">Min</th>
                <th className="py-3 px-4 text-right">Price</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading && (
                <tr>
                  <td colSpan={7} className="py-8 px-4 text-center text-muted-foreground">
                    Loading products...
                  </td>
                </tr>
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 px-4 text-center text-muted-foreground">
                    No products found.
                  </td>
                </tr>
              )}

              {filtered.map((p) => (
                <tr
                  key={String(p.id)}
                  className="border-b border-border/50 hover:bg-accent/30 ims-hover"
                >
                  <td className="py-3 px-4 font-medium">{p.name}</td>
                  <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{p.sku}</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{p.categoryName ?? "Uncategorized"}</td>
                  <td className="py-3 px-4 text-right font-mono">{stockByProduct[p.id] ?? p.initialStock ?? 0}</td>
                  <td className="py-3 px-4 text-right font-mono text-muted-foreground">-</td>
                  <td className="py-3 px-4 text-right font-mono">-</td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                        (stockByProduct[p.id] ?? p.initialStock ?? 0) > 0
                          ? "bg-success/10 text-success border-success/20"
                          : "bg-destructive/10 text-destructive border-destructive/20"
                      }`}
                    >
                      {(stockByProduct[p.id] ?? p.initialStock ?? 0) > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
