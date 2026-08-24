"use client";

import Link from "next/link";
import { useAdminStore } from "@/lib/admin/store";
import { getPromotionStatus } from "@/lib/admin/promotions";
import { EmptyState, PageHead, StatCard } from "@/components/admin/ui";
import { Icon } from "@/components/ui/icons";

export default function AdminOverviewPage() {
  const { products, categories, promotions } = useAdminStore();

  const published = products.filter((p) => p.status === "active").length;
  const drafts = products.filter((p) => p.status === "draft").length;
  const enabledCategories = categories.filter((c) => c.enabled !== false).length;
  const activePromotions = promotions.filter((p) => getPromotionStatus(p) === "active").length;

  const recent = [...products]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  return (
    <>
      <PageHead
        title="Overview"
        sub="Catalog health and quick actions for AREM WORLD."
        action={
          <Link href="/en" target="_blank" rel="noopener noreferrer" className="btn btn--secondary btn--sm">
            <Icon name="external" size={14} /> Open storefront
          </Link>
        }
      />

      <div className="admin-stats">
        <StatCard value={products.length} label="Total products" />
        <StatCard value={published} label="Published products" accent />
        <StatCard value={drafts} label="Draft products" />
        <StatCard value={enabledCategories} label="Categories" />
        <StatCard value={activePromotions} label="Active promotions" accent />
      </div>

      <div className="admin-card">
        <div className="admin-card__head">
          <div>
            <h2 className="admin-card__title">Quick actions</h2>
            <p className="admin-card__sub">Common tasks, one click away.</p>
          </div>
        </div>
        <div className="quick-actions">
          <Link href="/admin/products/new" className="btn btn--primary btn--sm">
            <Icon name="plus" size={14} /> Add product
          </Link>
          <Link href="/admin/categories" className="btn btn--secondary btn--sm">
            <Icon name="tag" size={14} /> Add category
          </Link>
          <Link href="/admin/promotions" className="btn btn--secondary btn--sm">
            <Icon name="percent" size={14} /> Create promotion
          </Link>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card__head">
          <div>
            <h2 className="admin-card__title">Recent products</h2>
            <p className="admin-card__sub">The latest additions to the catalog.</p>
          </div>
          <Link href="/admin/products" className="btn btn--secondary btn--sm">
            Manage products
          </Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState
            icon="bag"
            title="No products yet"
            text="Create your first product to see it here."
            action={
              <Link href="/admin/products/new" className="btn btn--primary btn--sm">
                Add product
              </Link>
            }
          />
        ) : (
          <div className="recent-list">
            {recent.map((product) => (
              <Link key={product.id} href={`/admin/products/${product.id}`} className="recent-item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="recent-item__thumb"
                  src={product.images[0]?.src ?? "/images/cat-textiles.svg"}
                  alt=""
                />
                <div className="recent-item__meta">
                  <div className="recent-item__name">{product.name.en}</div>
                  <div className="recent-item__sub">
                    {product.slug} · {product.createdAt}
                  </div>
                </div>
                <span className={`chip chip--${product.status === "active" ? "published" : "draft"}`}>
                  {product.status === "active" ? "Published" : "Draft"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
