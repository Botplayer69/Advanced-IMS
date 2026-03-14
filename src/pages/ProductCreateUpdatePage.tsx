import { useState } from "react";
import { userRole } from "@/lib/rbac";

export default function ProductCreateUpdatePage() {
  const [formData, setFormData] = useState({
    productName: "",
    sku: "",
    category: "",
    unitOfMeasure: "",
  });

  const isManager = userRole === "Inventory Manager";

  if (!isManager) {
    return (
      <div className="flex-1 p-8">
        <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
          This page is restricted to Inventory Managers.
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="h-14 border-b border-border flex items-center px-8">
        <span className="text-sm text-muted-foreground">
          Products / <span className="text-foreground font-medium">Create and Update</span>
        </span>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        {/* BACKEND_CONDITIONAL_START: if role == 'Inventory Manager' */}
        <section className="max-w-3xl rounded-lg border border-border bg-card p-6 space-y-6">
          <div>
            <h1 className="text-lg font-bold">Create / Add Product</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Fill product details before saving to inventory master data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Product Name</label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => setFormData((prev) => ({ ...prev, productName: e.target.value }))}
                placeholder="e.g. Servo Motor A12"
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">SKU / Code</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
                placeholder="e.g. SRV-A12-C"
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select category</option>
                <option value="motors">Motors</option>
                <option value="sensors">Sensors</option>
                <option value="electronics">Electronics</option>
                <option value="consumables">Consumables</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Unit of Measure</label>
              <select
                value={formData.unitOfMeasure}
                onChange={(e) => setFormData((prev) => ({ ...prev, unitOfMeasure: e.target.value }))}
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select unit</option>
                <option value="pcs">Pieces (pcs)</option>
                <option value="box">Box</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="meter">Meter (m)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button className="px-4 py-2 rounded border border-border text-sm hover:bg-accent/40 ims-press">
              Cancel
            </button>
            <button className="px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 ims-press">
              Save Product
            </button>
          </div>
        </section>
        {/* BACKEND_CONDITIONAL_END */}
      </div>
    </>
  );
}
