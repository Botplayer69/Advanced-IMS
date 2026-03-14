export default function ReorderingRulesPage() {
  const rules = [
    { sku: "HYD-200-A", product: "Hydraulic Pump HP-200", reorderPoint: 10, reorderQty: 20 },
    { sku: "BRG-044-C", product: "Bearing Assembly BA-44", reorderPoint: 25, reorderQty: 50 },
    { sku: "FAN-120-E", product: "Cooling Fan 120mm", reorderPoint: 20, reorderQty: 40 },
  ];

  return (
    <>
      <header className="h-14 border-b border-border flex items-center px-8">
        <span className="text-sm text-muted-foreground">
          Products / <span className="text-foreground font-medium">Reordering Rules</span>
        </span>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4 text-right">Reorder Point</th>
                <th className="py-3 px-4 text-right">Reorder Qty</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {rules.map((rule) => (
                <tr key={rule.sku} className="border-b border-border/50 hover:bg-accent/20">
                  <td className="py-3 px-4 font-mono text-xs text-primary font-semibold">{rule.sku}</td>
                  <td className="py-3 px-4">{rule.product}</td>
                  <td className="py-3 px-4 text-right font-mono">{rule.reorderPoint}</td>
                  <td className="py-3 px-4 text-right font-mono">{rule.reorderQty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
