import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getProducts,
  updateCategory,
  type CategoryDto,
  type ProductDto,
} from "@/lib/api/masterData";

export default function ProductCategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const isManager = user?.role === "Inventory Manager";

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const [categoryRows, productRows] = await Promise.all([getCategories(), getProducts()]);
        if (!mounted) return;
        setCategories(categoryRows);
        setProducts(productRows);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load categories.";
        toast.error(message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const countsByCategory = useMemo(() => {
    return products.reduce<Record<string, number>>((acc, product) => {
      acc[product.categoryId] = (acc[product.categoryId] ?? 0) + 1;
      return acc;
    }, {});
  }, [products]);

  const resetForm = () => {
    setCategoryName("");
    setEditingCategoryId(null);
  };

  const handleSubmit = async () => {
    const trimmedName = categoryName.trim();
    if (!trimmedName) {
      toast.error("Category name is required.");
      return;
    }

    setSaving(true);
    try {
      if (editingCategoryId) {
        const updated = await updateCategory(editingCategoryId, { name: trimmedName });
        setCategories((prev) => prev.map((category) => (category.id === updated.id ? updated : category)));
        toast.success("Category updated.");
      } else {
        const created = await createCategory({ name: trimmedName });
        setCategories((prev) => [...prev, created].sort((left, right) => left.name.localeCompare(right.name)));
        toast.success("Category created.");
      }
      resetForm();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save category.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category: CategoryDto) => {
    setEditingCategoryId(category.id);
    setCategoryName(category.name);
  };

  const handleDelete = async (category: CategoryDto) => {
    try {
      await deleteCategory(category.id);
      setCategories((prev) => prev.filter((item) => item.id !== category.id));
      setProducts((prev) => prev.filter((product) => product.categoryId !== category.id));
      if (editingCategoryId === category.id) {
        resetForm();
      }
      toast.success("Category deleted.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete category.";
      toast.error(message);
    }
  };

  return (
    <>
      <header className="h-14 border-b border-border flex items-center justify-between px-8">
        <span className="text-sm text-muted-foreground">
          Products / <span className="text-foreground font-medium">Product Categories</span>
        </span>
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        <section className="bg-card border border-border rounded-lg p-6 space-y-4 max-w-3xl">
          <div>
            <h2 className="text-sm font-bold">{editingCategoryId ? "Update Category" : "Create Category"}</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Maintain product categories used by product creation and catalog pages.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Enter category name"
              className="flex-1 bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              disabled={!isManager || saving}
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isManager || saving}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 ims-press disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              {saving ? "Saving..." : editingCategoryId ? "Update Category" : "Create Category"}
            </button>
            {editingCategoryId && (
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="px-4 py-2 rounded border border-border text-sm hover:bg-accent/40 ims-press disabled:opacity-60"
              >
                Cancel
              </button>
            )}
          </div>

          {!isManager && (
            <p className="text-xs text-warning">Manager role is required to create, update, or delete categories.</p>
          )}
        </section>

        <section className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-bold">Existing Categories</h2>
            <span className="text-xs text-muted-foreground">{categories.length} total</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6 text-right">Products</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading && (
                  <tr>
                    <td colSpan={3} className="py-8 px-6 text-center text-muted-foreground">
                      Loading categories...
                    </td>
                  </tr>
                )}

                {!loading && categories.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 px-6 text-center text-muted-foreground">
                      No categories found.
                    </td>
                  </tr>
                )}

                {categories.map((category) => (
                  <tr key={category.id} className="border-b border-border/50 hover:bg-accent/20 ims-hover">
                    <td className="py-4 px-6 font-medium">{category.name}</td>
                    <td className="py-4 px-6 text-right font-mono text-muted-foreground">
                      {countsByCategory[category.id] ?? 0}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(category)}
                          disabled={!isManager || saving}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-border text-xs hover:bg-accent/40 disabled:opacity-60"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(category)}
                          disabled={!isManager || saving}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-destructive/20 text-destructive text-xs hover:bg-destructive/10 disabled:opacity-60"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
