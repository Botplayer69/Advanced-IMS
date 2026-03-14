import { useState } from "react";
import { toast } from "sonner";

const products = [
  { name: "Industrial Sensor Pro X", sku: "SNS-992-B", currentStock: 147 },
  { name: "Servo Motor A12", sku: "SRV-A12-C", currentStock: 52 },
  { name: "Hydraulic Pump HP-200", sku: "HYD-200-A", currentStock: 2 },
  { name: "Bearing Assembly BA-44", sku: "BRG-044-C", currentStock: 0 },
  { name: "Cable Harness CX-90", sku: "CBL-090-D", currentStock: 340 },
];

export default function AdjustmentsPage() {
  const [adjustments, setAdjustments] = useState(
    products.map((p) => ({ ...p, adjustment: 0, reason: "" }))
  );

  const handleSubmit = () => {
    const changed = adjustments.filter((a) => a.adjustment !== 0);
    if (changed.length === 0) {
      toast.error("No adjustments to submit.");
      return;
    }
    toast.success(`${changed.length} adjustment(s) submitted successfully.`);
    setAdjustments((prev) =>
      prev.map((a) => ({
        ...a,
        currentStock: a.currentStock + a.adjustment,
        adjustment: 0,
        reason: "",
      }))
    );
  };

  return (
    <>
      <header className="h-14 border-b border-border flex items-center justify-between px-8">
        <span className="text-sm text-muted-foreground">
          Operations / <span className="text-foreground font-medium">Inventory Adjustment</span>
        </span>
        <button
          onClick={handleSubmit}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-1.5 rounded font-bold text-sm ims-press"
        >
          SUBMIT ADJUSTMENTS
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4 w-32 text-right">Current Stock</th>
                <th className="py-3 px-4 w-32">Adjustment</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4 w-32 text-right">New Stock</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {adjustments.map((item, i) => (
                <tr key={item.sku} className="border-b border-border/50 hover:bg-accent/20 ims-hover">
                  <td className="py-3 px-4">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{item.sku}</div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-muted-foreground">{item.currentStock}</td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      value={item.adjustment}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setAdjustments((prev) =>
                          prev.map((a, idx) => (idx === i ? { ...a, adjustment: val } : a))
                        );
                      }}
                      className="w-20 bg-background border border-border rounded px-2 py-1 font-mono text-sm focus:border-primary outline-none focus:ring-1 focus:ring-primary"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      placeholder="e.g. Damaged goods"
                      value={item.reason}
                      onChange={(e) => {
                        setAdjustments((prev) =>
                          prev.map((a, idx) => (idx === i ? { ...a, reason: e.target.value } : a))
                        );
                      }}
                      className="w-full bg-background border border-border rounded px-2 py-1 text-xs focus:border-primary outline-none focus:ring-1 focus:ring-primary"
                    />
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold">
                    <span className={item.adjustment !== 0 ? "text-primary" : "text-muted-foreground"}>
                      {item.currentStock + item.adjustment}
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
