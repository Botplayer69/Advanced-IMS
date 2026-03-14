import { ProfileMenu } from "@/components/ProfileMenu";

const moveHistory = [
  { id: "MOV-001", date: "Oct 24, 14:32", product: "Industrial Sensor Pro X", sku: "SNS-992-B", from: "WH-A / Zone 3", to: "WH-B / Zone 1", qty: 12, user: "J. Carter" },
  { id: "MOV-002", date: "Oct 24, 11:15", product: "PCB Board Rev.4", sku: "PCB-004-A", from: "WH-A / Zone 1", to: "WH-A / Zone 4", qty: 50, user: "M. Chen" },
  { id: "MOV-003", date: "Oct 23, 16:45", product: "Cooling Fan 120mm", sku: "FAN-120-E", from: "WH-B / Zone 2", to: "WH-A / Zone 2", qty: 8, user: "J. Carter" },
  { id: "MOV-004", date: "Oct 23, 09:20", product: "Cable Harness CX-90", sku: "CBL-090-D", from: "Receiving", to: "WH-A / Zone 3", qty: 100, user: "S. Park" },
  { id: "MOV-005", date: "Oct 22, 15:00", product: "Thermal Paste TG-7", sku: "THP-007-B", from: "WH-A / Zone 1", to: "Shipping", qty: 30, user: "M. Chen" },
  { id: "MOV-006", date: "Oct 22, 10:10", product: "Servo Motor A12", sku: "SRV-A12-C", from: "Receiving", to: "WH-B / Zone 1", qty: 50, user: "J. Carter" },
];

export default function MoveHistoryPage() {
  return (
    <>
      <header className="h-14 border-b border-border flex items-center justify-between px-8">
        <span className="text-sm text-muted-foreground">
          Operations / <span className="text-foreground font-medium">Move History</span>
        </span>
        <ProfileMenu />
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                <th className="py-3 px-4">Move ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">From</th>
                <th className="py-3 px-4">To</th>
                <th className="py-3 px-4 text-right">Qty</th>
                <th className="py-3 px-4 text-right">User</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {moveHistory.map((m) => (
                <tr key={m.id} className="border-b border-border/50 hover:bg-accent/20 ims-hover">
                  <td className="py-3 px-4 font-mono text-xs font-bold text-primary">{m.id}</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{m.date}</td>
                  <td className="py-3 px-4">
                    <div className="font-medium">{m.product}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{m.sku}</div>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{m.from}</td>
                  <td className="py-3 px-4 text-xs">{m.to}</td>
                  <td className="py-3 px-4 text-right font-mono">{m.qty}</td>
                  <td className="py-3 px-4 text-right text-xs text-muted-foreground">{m.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
