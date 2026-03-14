export default function ProductAvailabilityPage() {
  const rows = [
    { sku: "SRV-A12-C", product: "Servo Motor A12", location: "WH-A / Rack 02", qty: 52 },
    { sku: "SNS-992-B", product: "Industrial Sensor Pro X", location: "WH-B / Rack 11", qty: 147 },
    { sku: "PCB-004-A", product: "PCB Board Rev.4", location: "WH-C / Rack 05", qty: 820 },
  ];

  return (
    <>
      <header className="h-14 border-b border-border flex items-center px-8">
        <span className="text-sm text-muted-foreground">
          Products / <span className="text-foreground font-medium">Stock Availability per Location</span>
        </span>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-right">Available Qty</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {rows.map((row) => (
                <tr key={`${row.sku}-${row.location}`} className="border-b border-border/50 hover:bg-accent/20">
                  <td className="py-3 px-4 font-mono text-xs text-primary font-semibold">{row.sku}</td>
                  <td className="py-3 px-4">{row.product}</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">{row.location}</td>
                  <td className="py-3 px-4 text-right font-mono">{row.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
