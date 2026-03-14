export default function ProductCategoriesPage() {
  const categories = [
    { name: "Motors", count: 84 },
    { name: "Sensors", count: 146 },
    { name: "Electronics", count: 320 },
    { name: "Consumables", count: 62 },
  ];

  return (
    <>
      <header className="h-14 border-b border-border flex items-center px-8">
        <span className="text-sm text-muted-foreground">
          Products / <span className="text-foreground font-medium">Product Categories</span>
        </span>
      </header>

      <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <div key={category.name} className="bg-card border border-border rounded-lg p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Category</div>
            <div className="mt-2 text-lg font-semibold">{category.name}</div>
            <div className="mt-1 text-xs text-muted-foreground">{category.count} items</div>
          </div>
        ))}
      </div>
    </>
  );
}
