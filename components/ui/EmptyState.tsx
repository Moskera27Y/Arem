import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/icons";

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  sub?: string;
  actionHref?: string;
  actionLabel?: string;
  children?: ReactNode;
}

/**
 * Illustrated empty state — Wayuu diamond motif, serif title, optional CTA.
 * For carts, wishlists, search and order lists with nothing to show yet.
 */
export function EmptyState({ icon = "bag", title, sub, actionHref, actionLabel, children }: EmptyStateProps) {
  return (
    <div className="empty">
      <span className="empty__motif" aria-hidden="true">
        <span className="empty__diamond" />
        <span className="empty__icon">
          <Icon name={icon} size={26} />
        </span>
        <span className="empty__diamond" />
      </span>
      <h2 className="h3 empty__title">{title}</h2>
      {sub && <p className="muted empty__sub">{sub}</p>}
      {actionHref && actionLabel && (
        <Link href={actionHref} className="btn btn--primary empty__cta">
          {actionLabel}
        </Link>
      )}
      {children}
    </div>
  );
}
