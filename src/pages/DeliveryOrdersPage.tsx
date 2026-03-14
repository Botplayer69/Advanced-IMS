import { useState } from "react";
import { toast } from "@/components/ui/sonner";

interface DocumentItem {
  id: string;
  partner: string;
  scheduled: string;
  status: "Pending" | "Validated";
  lines: {
    product: string;
    sku: string;
    demand: number;
    done: number;
  }[];
}

const sampleDocuments: DocumentItem[] = [
  {
    id: "WH/OUT/08421",
    partner: "Global Logics Inc.",
    scheduled: "Oct 24, 14:00",
    status: "Pending",
    lines: [
      { product: "Industrial Sensor Pro X", sku: "SNS-992-B", demand: 12, done: 12 },
      { product: "PCB Board Rev.4", sku: "PCB-004-A", demand: 50, done: 48 },
    ],
  },
  {
    id: "WH/OUT/08420",
    partner: "TechCorp Solutions",
    scheduled: "Oct 24, 10:30",
    status: "Pending",
    lines: [
      { product: "Thermal Paste TG-7", sku: "THP-007-B", demand: 30, done: 30 },
    ],
  },
  {
    id: "WH/OUT/08419",
    partner: "MegaParts Ltd.",
    scheduled: "Oct 23, 16:00",
    status: "Validated",
    lines: [
      { product: "Cooling Fan 120mm", sku: "FAN-120-E", demand: 8, done: 8 },
      { product: "Cable Harness CX-90", sku: "CBL-090-D", demand: 100, done: 100 },
    ],
  },
  {
    id: "WH/OUT/08418",
    partner: "Atlas Manufacturing",
    scheduled: "Oct 23, 09:00",
    status: "Pending",
    lines: [
      { product: "Servo Motor A12", sku: "SRV-A12-C", demand: 5, done: 3 },
      { product: "Bearing Assembly BA-44", sku: "BRG-044-C", demand: 20, done: 0 },
      { product: "O-Ring Kit ORK-15", sku: "ORK-015-B", demand: 40, done: 40 },
    ],
  },
];

export default function DeliveryOrdersPage() {
  const [documents, setDocuments] = useState(sampleDocuments);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const selected = documents.find((d) => d.id === selectedId);

  const filtered = documents.filter((d) => {
    if (statusFilter !== "all" && d.status.toLowerCase() !== statusFilter) return false;
    return true;
  });

  const handleValidate = () => {
    if (!selected) return;
    setDocuments((prev) =>
      prev.map((d) => (d.id === selected.id ? { ...d, status: "Validated" as const } : d))
    );
    toast.success(`${selected.id} validated successfully`);
  };

  const handleDoneChange = (lineIndex: number, value: number) => {
    if (!selected) return;
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === selected.id
          ? {
            ...d,
            lines: d.lines.map((l, i) =>
              i === lineIndex ? { ...l, done: value } : l
            ),
          }
          : d
      )
    );
  };

  return (
    <>
      <header className="h-14 border-b border-border flex items-center px-8">
        <span className="text-sm text-muted-foreground">
          Operations / <span className="text-foreground font-medium">Delivery Orders</span>
        </span>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* List Pane */}
        <section className="w-[380px] border-r border-border overflow-y-auto bg-card/30 shrink-0">
          <div className="p-4 border-b border-border">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="validated">Validated</option>
            </select>
          </div>
          {filtered.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setSelectedId(doc.id)}
              className={`p-4 border-b border-border cursor-pointer ims-hover ${selectedId === doc.id
                ? "bg-accent/50"
                : "hover:bg-accent/20"
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
              <div className="text-xs text-muted-foreground">Customer: {doc.partner}</div>
              <div className="text-[10px] text-muted-foreground/50 mt-2">
                Scheduled: {doc.scheduled}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No documents match the filter.
            </div>
          )}
        </section>

        {/* Detail Pane */}
        <section className="flex-1 flex flex-col bg-background overflow-y-auto">
          {selected ? (
            <>
              <div className="p-8 flex justify-between items-center border-b border-border sticky top-0 bg-background z-10">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">{selected.id}</h1>
                  <p className="text-sm text-muted-foreground">
                    {selected.partner} • Scheduled {selected.scheduled}
                  </p>
                </div>
                {selected.status === "Pending" && (
                  <button
                    onClick={handleValidate}
                    className="bg-success hover:bg-success/90 text-success-foreground px-6 py-2 rounded font-bold text-sm ims-press shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                  >
                    VALIDATE
                  </button>
                )}
                {selected.status === "Validated" && (
                  <span className="text-success font-bold text-sm flex items-center gap-1.5">
                    ● Validated
                  </span>
                )}
              </div>

              <div className="p-8">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                      <th className="pb-4 px-2">Product</th>
                      <th className="pb-4 px-2 w-32">Demand</th>
                      <th className="pb-4 px-2 w-32">Done</th>
                      <th className="pb-4 px-2 w-24 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {selected.lines.map((line, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-accent/20 ims-hover">
                        <td className="py-4 px-2">
                          <div className="font-medium">{line.product}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {line.sku}
                          </div>
                        </td>
                        <td className="py-4 px-2 font-mono text-muted-foreground">
                          {line.demand.toFixed(2)}
                        </td>
                        <td className="py-4 px-2">
                          {selected.status === "Pending" ? (
                            <input
                              type="number"
                              value={line.done}
                              onChange={(e) =>
                                handleDoneChange(i, Number(e.target.value))
                              }
                              className="w-20 bg-card border border-border rounded px-2 py-1 font-mono text-sm focus:border-primary outline-none focus:ring-1 focus:ring-primary"
                            />
                          ) : (
                            <span className="font-mono">{line.done.toFixed(2)}</span>
                          )}
                        </td>
                        <td className="py-4 px-2 text-right">
                          {line.done >= line.demand ? (
                            <span className="text-success text-[10px] font-medium">● Ready</span>
                          ) : line.done > 0 ? (
                            <span className="text-warning text-[10px] font-medium">● Partial</span>
                          ) : (
                            <span className="text-destructive text-[10px] font-medium">● Waiting</span>
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
              <p className="text-sm text-muted-foreground">
                Select a document to begin processing.
              </p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
