"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/admin/ui";
import { Icon } from "@/components/ui/icons";

// Mirrors OrderAction in lib/server/orders (kept local: server-only modules
// cannot be imported from client components).
type OrderAction = "approve_payment" | "ship" | "deliver" | "cancel" | "delete";

const ACTION_META: Record<OrderAction, { label: string; kind: "primary" | "secondary" | "danger"; confirm?: string }> = {
  approve_payment: { label: "Approve payment", kind: "primary" },
  ship: { label: "Mark as shipped", kind: "primary" },
  deliver: { label: "Mark as delivered", kind: "secondary" },
  cancel: { label: "Cancel order", kind: "danger", confirm: "Se devolverá el stock al inventario y se avisará al cliente. ¿Continuar?" },
  delete: {
    label: "Delete order",
    kind: "danger",
    confirm: "Se eliminará la orden y sus registros. Solo para órdenes canceladas o sin pago. ¿Continuar?",
  },
};

/**
 * Guided order workflow: only the actions valid for the current status,
 * each with its side effects (restock, shipment, customer notification).
 */
export function OrderActions({
  orderId,
  status,
  actions,
}: {
  orderId: string;
  status: string;
  actions: OrderAction[];
}) {
  const [busy, setBusy] = useState<OrderAction | null>(null);
  const [msg, setMsg] = useState("");
  const [pending, setPending] = useState<OrderAction | null>(null);

  async function run(action: OrderAction) {
    setBusy(action);
    setMsg("");
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(d.error || "Error");
      window.location.reload();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Error");
      setBusy(null);
    }
  }

  if (actions.length === 0) {
    return (
      <div className="admin-card" style={{ marginTop: "1rem" }}>
        <p className="muted" style={{ margin: 0 }}>
          Status <strong>{status}</strong> is terminal — no further actions.
        </p>
      </div>
    );
  }

  return (
    <div className="admin-card" style={{ marginTop: "1rem" }}>
      <h3 style={{ margin: "0 0 1rem" }}>Order actions</h3>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
        {actions.map((a) => (
          <button
            key={a}
            type="button"
            className={`btn btn--sm ${ACTION_META[a].kind === "primary" ? "btn--primary" : ACTION_META[a].kind === "danger" ? "btn--ghost-danger" : "btn--secondary"}`}
            disabled={busy !== null}
            onClick={() => (ACTION_META[a].confirm ? setPending(a) : run(a))}
          >
            {a === "delete" && <Icon name="trash" size={14} />}
            {busy === a ? "Working…" : ACTION_META[a].label}
          </button>
        ))}
        {msg && <span className="muted">{msg}</span>}
      </div>
      <ConfirmDialog
        open={pending !== null}
        title={pending === "delete" ? "¿Eliminar esta orden?" : "¿Continuar?"}
        text={pending ? (ACTION_META[pending].confirm ?? "") : ""}
        onConfirm={() => {
          const a = pending;
          setPending(null);
          if (a) run(a);
        }}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}
