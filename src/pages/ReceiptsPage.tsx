import { useState } from "react";
import { toast } from "@/components/ui/sonner";

const sampleReceipts = [
  {
    id: "WH/IN/04521",
    vendor: "Siemens Industrial",
    scheduled: "Oct 25, 09:00",
    status: "Pending" as const,
    lines: [
      { product: "Servo Motor A12", sku: "SRV-A12-C", expected: 50, received: 50 },
      { product: "Pressure Gauge PG-100", sku: "PRG-100-D", expected: 20, received: 18 },
    ],
  },
  {
    id: "WH/IN/04520",
    vendor: "Molex Components",
    scheduled: "Oct 24, 14:00",
    status: "Validated" as const,
    lines: [
      { product: "PCB Board Rev.4", sku: "PCB-004-A", expected: 200, received: 200 },
    ],
  },
  {
    id: "WH/IN/04519",
    vendor: "Parker Hannifin",
    scheduled: "Oct 24, 08:00",
    status: "Pending" as const,
    lines: [
      { product: "Hydraulic Pump HP-200", sku: "HYD-200-A", expected: 10, received: 0 },
      { product: "O-Ring Kit ORK-15", sku: "ORK-015-B", expected: 100, received: 100 },
    ],
  },
];

export default function ReceiptsPage() {
  const [documents, setDocuments] = useState(sampleReceipts);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = documents.find((d) => d.id === selectedId);

  const handleValidate = () => {
    if (!selected) return;
    setDocuments((prev) =>
      prev.map((d) => (d.id === selected.id ? { ...d, status: "Validated" as const } : d))
    );
    toast.success(`${selected.id} receipt validated`);
  };

  return (
    <>
      <header className="h-14 border-b border-border flex items-center px-8">
        <span className="text-sm text-muted-foreground">
          Operations / <span className="text-foreground font-medium">Receipts</span>
        </span>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <section className="w-[380px] border-r border-border overflow-y-auto bg-card/30 shrink-0">
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setSelectedId(doc.id)}
              className={`p-4 border-b border-border cursor-pointer ims-hover ${selectedId === doc.id ? "bg-accent/50" : "hover:bg-accent/20"
                }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-mono text-xs font-bold text-primary">{doc.id}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${doc.status === "Pending"
                      ? "bg-warning/10 text-warning border-warning/20"
                      : "bg-success/10 text-success border-success/20"
                    }`}
                >
                  {doc.status}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">Vendor: {doc.vendor}</div>
              <div className="text-[10px] text-muted-foreground/50 mt-2">Scheduled: {doc.scheduled}</div>
            </div>
          ))}
        </section>

        <section className="flex-1 flex flex-col bg-background overflow-y-auto">
          {selected ? (
            <>
              <div className="p-8 flex justify-between items-center border-b border-border sticky top-0 bg-background z-10">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">{selected.id}</h1>
                  <p className="text-sm text-muted-foreground">{selected.vendor} • {selected.scheduled}</p>
                </div>
                {selected.status === "Pending" ? (
                  <button onClick={handleValidate} className="bg-success hover:bg-success/90 text-success-foreground px-6 py-2 rounded font-bold text-sm ims-press shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                    VALIDATE RECEIPT
                  </button>
                ) : (
                  <span className="text-success font-bold text-sm">● Validated</span>
                )}
              </div>
              <div className="p-8">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                      <th className="pb-4 px-2">Product</th>
                      <th className="pb-4 px-2 w-32">Expected</th>
                      <th className="pb-4 px-2 w-32">Received</th>
                      <th className="pb-4 px-2 w-24 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {selected.lines.map((line, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-accent/20 ims-hover">
                        <td className="py-4 px-2">
                          <div className="font-medium">{line.product}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{line.sku}</div>
                        </td>
                        <td className="py-4 px-2 font-mono text-muted-foreground">{line.expected}</td>
                        <td className="py-4 px-2 font-mono">{line.received}</td>
                        <td className="py-4 px-2 text-right">
                          {line.received >= line.expected ? (
                            <span className="text-success text-[10px] font-medium">● Complete</span>
                          ) : (
                            <span className="text-warning text-[10px] font-medium">● Partial</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Select a receipt to begin processing.</p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
