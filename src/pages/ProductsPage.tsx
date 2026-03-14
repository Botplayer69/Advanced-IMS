import { useState } from "react";
import { Search } from "lucide-react";

const products = [
  { id: 1, name: "Industrial Sensor Pro X", sku: "SNS-992-B", category: "Sensors", stock: 147, min: 20, price: 89.5, status: "In Stock" },
  { id: 2, name: "Servo Motor A12", sku: "SRV-A12-C", category: "Motors", stock: 52, min: 15, price: 245.0, status: "In Stock" },
  { id: 3, name: "Hydraulic Pump HP-200", sku: "HYD-200-A", category: "Pumps", stock: 2, min: 10, price: 1200.0, status: "Low Stock" },
  { id: 4, name: "Bearing Assembly BA-44", sku: "BRG-044-C", category: "Parts", stock: 0, min: 25, price: 34.75, status: "Out of Stock" },
  { id: 5, name: "Cable Harness CX-90", sku: "CBL-090-D", category: "Cables", stock: 340, min: 50, price: 12.3, status: "In Stock" },
  { id: 6, name: "PCB Board Rev.4", sku: "PCB-004-A", category: "Electronics", stock: 820, min: 100, price: 7.85, status: "In Stock" },
  { id: 7, name: "Thermal Paste TG-7", sku: "THP-007-B", category: "Consumables", stock: 195, min: 30, price: 4.5, status: "In Stock" },
  { id: 8, name: "Cooling Fan 120mm", sku: "FAN-120-E", category: "Cooling", stock: 8, min: 20, price: 15.99, status: "Low Stock" },
  { id: 9, name: "O-Ring Kit ORK-15", sku: "ORK-015-B", category: "Parts", stock: 5, min: 50, price: 22.0, status: "Low Stock" },
  { id: 10, name: "Pressure Gauge PG-100", sku: "PRG-100-D", category: "Instruments", stock: 1, min: 8, price: 67.0, status: "Low Stock" },
];

export default function ProductsPage() {
  const [search, setSearch] = useState("");

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

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
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border/50 hover:bg-accent/30 ims-hover"
                >
                  <td className="py-3 px-4 font-medium">{p.name}</td>
                  <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{p.sku}</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{p.category}</td>
                  <td className="py-3 px-4 text-right font-mono">{p.stock}</td>
                  <td className="py-3 px-4 text-right font-mono text-muted-foreground">{p.min}</td>
                  <td className="py-3 px-4 text-right font-mono">${p.price.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                        p.status === "In Stock"
                          ? "bg-success/10 text-success border-success/20"
                          : p.status === "Low Stock"
                          ? "bg-warning/10 text-warning border-warning/20"
                          : "bg-destructive/10 text-destructive border-destructive/20"
                      }`}
                    >
                      {p.status}
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
