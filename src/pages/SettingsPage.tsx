export default function SettingsPage() {
  return (
    <>
      <header className="h-14 border-b border-border flex items-center px-8">
        <span className="text-sm font-medium text-muted-foreground">Settings</span>
      </header>

      <div className="flex-1 overflow-y-auto p-8 max-w-2xl space-y-8">
        <section className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider">Warehouse Configuration</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Warehouse Name</label>
              <input
                type="text"
                defaultValue="Main Distribution Center"
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Default Low Stock Threshold</label>
              <input
                type="number"
                defaultValue={10}
                className="w-32 bg-background border border-border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </section>

        <section className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider">Notifications</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" defaultChecked className="accent-primary" />
              Low stock email alerts
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" defaultChecked className="accent-primary" />
              Pending receipt reminders
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" className="accent-primary" />
              Daily inventory summary
            </label>
          </div>
        </section>

        <section className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider">System</h2>
          <p className="text-xs text-muted-foreground">CORE_IMS v1.0.0 • Build 2026.03.14</p>
        </section>
      </div>
    </>
  );
}
