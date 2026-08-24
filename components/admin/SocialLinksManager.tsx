"use client";

/**
 * Social links management — networks, URLs, active state, display order.
 * Changes flow into the storefront footer social section immediately.
 */

import { useMemo, useState } from "react";
import { SOCIAL_NETWORKS, type SocialLink } from "@/lib/admin/types";
import { useAdminStore } from "@/lib/admin/store";
import { ConfirmDialog, EmptyState, Field, PageHead } from "@/components/admin/ui";
import { Icon } from "@/components/ui/icons";

interface LinkDraft {
  id?: string;
  network: SocialLink["network"];
  label: string;
  value: string;
  active: boolean;
  order: number;
}

export function SocialLinksManager() {
  const { socialLinks, upsertSocialLink, deleteSocialLink } = useAdminStore();
  const [draft, setDraft] = useState<LinkDraft | null>(null);
  const [error, setError] = useState<string>();
  const [toDelete, setToDelete] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...socialLinks].sort((a, b) => a.order - b.order),
    [socialLinks],
  );

  const networkLabel = (network: SocialLink["network"]) =>
    SOCIAL_NETWORKS.find((n) => n.id === network)?.label ?? network;

  const openNew = () => {
    setDraft({ network: "instagram", label: "", value: "", active: true, order: sorted.length + 1 });
    setError(undefined);
  };

  const openEdit = (link: SocialLink) => {
    setDraft({
      id: link.id,
      network: link.network,
      label: link.label ?? "",
      value: link.value,
      active: link.active,
      order: link.order,
    });
    setError(undefined);
  };

  const save = () => {
    if (!draft) return;
    if (!draft.value.trim()) {
      setError("A URL or contact value is required.");
      return;
    }
    const network = draft.network;
    upsertSocialLink({
      id: draft.id ?? `soc-${Date.now().toString(36)}`,
      network,
      label: draft.label.trim() || undefined,
      value: draft.value.trim(),
      active: draft.active,
      order: draft.order || 10,
    });
    setDraft(null);
  };

  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= sorted.length) return;
    const next = [...sorted];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    next.forEach((link, i) => upsertSocialLink({ ...link, order: i + 1 }));
  };

  return (
    <>
      <PageHead
        title="Social links"
        sub="Manage the networks shown in the storefront footer and social section."
        action={
          <button type="button" className="btn btn--primary" onClick={openNew}>
            <Icon name="plus" size={15} /> Add link
          </button>
        }
      />

      {draft && (
        <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
          <h2 className="admin-card__title" style={{ marginBottom: "1.25rem" }}>
            {draft.id ? "Edit link" : "New link"}
          </h2>
          {error && (
            <div className="admin-form__error-summary" role="alert" style={{ marginBottom: "1rem" }}>
              {error}
            </div>
          )}
          <div className="admin-form">
            <div className="admin-form__grid admin-form__grid--3">
              <Field label="Network">
                <select
                  className="select"
                  value={draft.network}
                  onChange={(e) => setDraft({ ...draft, network: e.target.value as SocialLink["network"] })}
                >
                  {SOCIAL_NETWORKS.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Display label" hint="Optional. Falls back to the network name.">
                <input
                  className="input"
                  value={draft.label}
                  onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                  placeholder="e.g. @arem.world"
                />
              </Field>
              <Field label="URL / contact value" required>
                <input
                  className="input"
                  value={draft.value}
                  onChange={(e) => setDraft({ ...draft, value: e.target.value })}
                  placeholder="https://… or +57 … or hola@arem.world"
                />
              </Field>
              <Field label="Display order">
                <input
                  className="input"
                  type="number"
                  min="1"
                  step="1"
                  value={draft.order}
                  onChange={(e) => setDraft({ ...draft, order: Number(e.target.value) || 1 })}
                />
              </Field>
              <Field label="Active">
                <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", paddingTop: "0.35rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={draft.active}
                    onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
                  />
                  <span style={{ fontSize: "var(--text-sm)", color: "var(--ink-2)" }}>Show in the footer</span>
                </label>
              </Field>
            </div>
            <div className="admin-form__actions">
              <button type="button" className="btn btn--primary" onClick={save}>
                <Icon name="check" size={15} /> Save link
              </button>
              <button type="button" className="btn btn--secondary" onClick={() => setDraft(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="admin-card">
          <EmptyState
            icon="link"
            title="No social links yet"
            text="Add your Instagram, TikTok, WhatsApp and more."
            action={
              <button type="button" className="btn btn--primary btn--sm" onClick={openNew}>
                Add link
              </button>
            }
          />
        </div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Network</th>
                <th>Value</th>
                <th>Active</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((link, index) => (
                <tr key={link.id}>
                  <td data-label="Order">
                    <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <button
                        type="button"
                        className="icon-action"
                        aria-label="Move up"
                        disabled={index === 0}
                        onClick={() => move(index, -1)}
                      >
                        <Icon name="chevron-down" size={12} style={{ transform: "rotate(180deg)" }} />
                      </button>
                      <button
                        type="button"
                        className="icon-action"
                        aria-label="Move down"
                        disabled={index === sorted.length - 1}
                        onClick={() => move(index, 1)}
                      >
                        <Icon name="chevron-down" size={12} />
                      </button>
                      <span style={{ marginLeft: "0.3rem", color: "var(--muted)", fontSize: "var(--text-xs)" }}>
                        {link.order}
                      </span>
                    </div>
                  </td>
                  <td data-label="Network">
                    <div className="data-table__name">{link.label ?? networkLabel(link.network)}</div>
                    <div className="data-table__sub">{networkLabel(link.network)}</div>
                  </td>
                  <td data-label="Value" className="data-table__sub" style={{ maxWidth: "18rem", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {link.value}
                  </td>
                  <td data-label="Active">
                    <span className={`chip chip--${link.active ? "published" : "inactive"}`}>
                      {link.active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td data-label="Actions">
                    <div className="data-table__actions" style={{ justifyContent: "flex-end" }}>
                      <button type="button" className="icon-action" aria-label={`Edit ${link.network}`} onClick={() => openEdit(link)}>
                        <Icon name="pencil" size={14} />
                      </button>
                      <button
                        type="button"
                        className="icon-action icon-action--danger"
                        aria-label={`Delete ${link.network}`}
                        onClick={() => setToDelete(link.id)}
                      >
                        <Icon name="trash" size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete this social link?"
        text="The link will disappear from the storefront footer. This cannot be undone."
        onConfirm={() => {
          if (toDelete) deleteSocialLink(toDelete);
          setToDelete(null);
        }}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
