"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAdminStore } from "@/lib/admin/store";
import { resolveCategories } from "@/lib/content";
import { formatMoney } from "@/lib/format";
import { EmptyState, PageHead } from "@/components/admin/ui";
import { Icon } from "@/components/ui/icons";
import { ConfirmDialog } from "@/components/admin/ui";

export default function AdminProductsPage() {
  const { products, categories, deleteProduct } = useAdminStore();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toDelete, setToDelete] = useState<string | null>(null);

  const categoryOptions = useMemo(
    () => resolveCategories(categories, "en").sort((a, b) => a.order - b.order),
    [categories],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products
      .filter((p) => {
        if (categoryFilter !== "all" && !p.categoryIds.includes(categoryFilter)) return false;
        if (statusFilter === "published" && p.status !== "active") return false;
        if (statusFilter === "draft" && p.status !== "draft") return false;
        if (statusFilter === "archived" && p.status !== "archived") return false;
        if (q) {
          const haystack = `${p.name.en} ${p.name.es} ${p.variants[0]?.sku ?? ""} ${p.slug}`.toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [products, search, categoryFilter, statusFilter]);

  const categoryName = (id: string) =>
    resolveCategories(categories, "en").find((c) => c.id === id)?.name ?? "";

  const inventoryTotal = (p: (typeof products)[number]) => p.variants.reduce((sum, v) => sum + v.inventory, 0);

  return (
    <>
      <PageHead
        title="Products"
        sub={`${products.length} products in the catalog.`}
        action={
          <Link href="/admin/products/new" className="btn btn--primary">
            <Icon name="plus" size={15} /> Add product
          </Link>
        }
      />

      <div className="admin-toolbar">
        <input
          className="input"
          type="search"
          placeholder="Search by name or SKU…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search products"
        />
        <select
          className="select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>
          {categoryOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          className="select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="admin-card">
          <EmptyState
            icon="bag"
            title={search || categoryFilter !== "all" || statusFilter !== "all" ? "No matching products" : "No products yet"}
            text={
              search || categoryFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your search or filters."
                : "Create your first product to start building the catalog."
            }
            action={
              <Link href="/admin/products/new" className="btn btn--primary btn--sm">
                Add product
              </Link>
            }
          />
        </div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Region · Artisan</th>
                <th>Price</th>
                <th>Inventory</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => {
                const stock = inventoryTotal(product);
                const sale = product.compareAtPrice ? true : false;
                return (
                  <tr key={product.id}>
                    <td data-label="Product">
                      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img className="data-table__thumb" src={product.images[0]?.src ?? "/images/cat-textiles.svg"} alt="" />
                        <div>
                          <div className="data-table__name">{product.name.en}</div>
                          <div className="data-table__sub">{product.variants[0]?.sku ?? "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td data-label="Category">{product.categoryIds.map(categoryName).join(", ") || "—"}</td>
                    <td data-label="Region · Artisan" className="data-table__sub">
                      {product.regionId ? "Region ✓" : ""}
                      {product.artisanId ? " · Artisan ✓" : ""}
                      {!product.regionId && !product.artisanId ? "—" : ""}
                    </td>
                    <td data-label="Price">
                      <div style={{ fontWeight: 600 }}>{formatMoney(product.price)}</div>
                      {sale && (
                        <div className="data-table__sub" style={{ color: "var(--clay-deep)" }}>
                          {formatMoney(product.compareAtPrice!)} was
                        </div>
                      )}
                    </td>
                    <td data-label="Inventory">
                      <span className={`chip ${stock > 0 ? "chip--in-stock" : "chip--out-of-stock"}`}>
                        {stock > 0 ? `${stock} in stock` : "Out of stock"}
                      </span>
                    </td>
                    <td data-label="Status">
                      <span className={`chip chip--${product.status === "active" ? "published" : "draft"}`}>
                        {product.status === "active" ? "Published" : product.status === "draft" ? "Draft" : "Archived"}
                      </span>
                    </td>
                    <td data-label="Actions">
                      <div className="data-table__actions" style={{ justifyContent: "flex-end" }}>
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="icon-action"
                          aria-label={`Edit ${product.name.en}`}
                        >
                          <Icon name="pencil" size={14} />
                        </Link>
                        <button
                          type="button"
                          className="icon-action icon-action--danger"
                          aria-label={`Delete ${product.name.en}`}
                          onClick={() => setToDelete(product.id)}
                        >
                          <Icon name="trash" size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete this product?"
        text={
          toDelete
            ? `“${products.find((p) => p.id === toDelete)?.name.en ?? ""}” will be removed from the storefront and the Admin catalog. This cannot be undone.`
            : ""
        }
        onConfirm={() => {
          if (toDelete) deleteProduct(toDelete);
          setToDelete(null);
        }}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
