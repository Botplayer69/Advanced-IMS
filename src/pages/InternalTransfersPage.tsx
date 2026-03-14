import { ProfileMenu } from "@/components/ProfileMenu";

const transferQueue = [
  { id: "TRF-2101", product: "Servo Motor A12", from: "WH-A / Rack 02", to: "WH-B / Rack 11", qty: 6, status: "Queued" },
  { id: "TRF-2102", product: "Industrial Sensor Pro X", from: "WH-A / Rack 14", to: "WH-C / Rack 03", qty: 12, status: "In Progress" },
  { id: "TRF-2103", product: "PCB Board Rev.4", from: "WH-B / Rack 05", to: "WH-A / Rack 08", qty: 40, status: "Queued" },
];

export default function InternalTransfersPage() {
  return (
    <>
      <header className="h-14 border-b border-border flex items-center justify-between px-8">
        <span className="text-sm text-muted-foreground">
          Operations / <span className="text-foreground font-medium">Internal Transfers</span>
        </span>
        <ProfileMenu />
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                <th className="py-3 px-4">Transfer ID</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">From</th>
                <th className="py-3 px-4">To</th>
                <th className="py-3 px-4 text-right">Qty</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {transferQueue.map((task) => (
                <tr key={task.id} className="border-b border-border/50 hover:bg-accent/20 ims-hover">
                  <td className="py-3 px-4 font-mono text-xs font-bold text-primary">{task.id}</td>
                  <td className="py-3 px-4 font-medium">{task.product}</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{task.from}</td>
                  <td className="py-3 px-4 text-xs">{task.to}</td>
                  <td className="py-3 px-4 text-right font-mono">{task.qty}</td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                        task.status === "In Progress"
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-warning/10 text-warning border-warning/20"
                      }`}
                    >
                      {task.status}
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
